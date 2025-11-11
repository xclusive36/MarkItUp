import { getDatabase, schema } from './index';
import { sql, eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
// Note type import not directly used - only for documentation
import { withRetry, dbCircuitBreaker } from './retry';
import { dbLogger } from '../logger';

/**
 * File System <-> Database Sync Service
 * Keeps markdown files (source of truth) in sync with SQLite database (cache)
 */
export class FileSystemDBSync {
  private markdownDir: string;
  private db: ReturnType<typeof getDatabase>;

  constructor(markdownDir = 'markdown') {
    this.markdownDir = path.join(process.cwd(), markdownDir);
    this.db = getDatabase();
  }

  /**
   * Extract metadata from markdown content
   */
  private extractMetadata(filePath: string, content: string) {
    // Extract title (first H1 or filename)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title =
      titleMatch && titleMatch[1] ? titleMatch[1].trim() : path.basename(filePath, '.md');

    // Extract tags (#tag format)
    const tagMatches = content.match(/#[\w-]+/g) || [];
    const tags = [...new Set(tagMatches)].sort();

    // Extract wikilinks ([[link]])
    const wikilinkMatches = content.match(/\[\[([^\]]+)\]\]/g) || [];
    const wikilinks = wikilinkMatches
      .map(match => {
        const link = match.slice(2, -2); // Remove [[ ]]
        const parts = link.split('|');
        const firstPart = parts[0];
        return firstPart ? firstPart.trim() : ''; // Handle [[link|alias]]
      })
      .filter(link => link.length > 0);

    // Calculate statistics
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const characterCount = content.length;
    const linkCount = wikilinks.length;

    return {
      title,
      tags: JSON.stringify(tags),
      wordCount,
      characterCount,
      linkCount,
      wikilinks,
    };
  }

  /**
   * Scan markdown directory and return all files with metadata
   */
  private async scanMarkdownFiles(): Promise<
    Array<{ id: string; path: string; content: string; stats: any }>
  > {
    const files: Array<{ id: string; path: string; content: string; stats: any }> = [];

    async function scanDir(dir: string, baseDir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip hidden files, dotfiles, and sensitive files
        if (
          entry.name.startsWith('.') ||
          entry.name.includes('.env') ||
          entry.name.endsWith('.env') ||
          entry.name === 'node_modules' ||
          entry.name === '.git' ||
          entry.name.toLowerCase() === 'env'
        ) {
          // Explicitly ignore any directory or file named 'env' to prevent accidental
          // indexing of environment-related content accidentally placed under markdown.
          continue;
        }

        if (entry.isDirectory()) {
          await scanDir(fullPath, baseDir);
        } else if (entry.name.endsWith('.md')) {
          const content = await fs.readFile(fullPath, 'utf-8');
          const stats = await fs.stat(fullPath);

          // Create relative path from markdown dir
          const relativePath = path.relative(baseDir, fullPath);
          // const folder = path.dirname(relativePath) === '.' ? null : path.dirname(relativePath); // Commented out: folder not used
          // const name = path.basename(relativePath, '.md'); // Commented out: name not used

          // ID is the full relative path
          const id = relativePath;

          files.push({
            id,
            path: fullPath,
            content,
            stats,
          });
        }
      }
    }

    try {
      await scanDir(this.markdownDir, this.markdownDir);
    } catch (error) {
      dbLogger.error('Error scanning markdown files', {}, error as Error);
    }

    return files;
  }

  /**
   * Index a single note (insert or update)
   * Uses retry logic and circuit breaker for reliability
   */
  async indexNote(
    noteId: string,
    content: string,
    userId: string = 'system',
    createdAt?: Date,
    updatedAt?: Date
  ) {
    const metadata = this.extractMetadata(noteId, content);
    const folder = path.dirname(noteId) === '.' ? null : path.dirname(noteId);
    const name = path.basename(noteId, '.md');

    const now = new Date();

    const noteData = {
      id: noteId,
      userId, // Add userId to note data
      name,
      folder,
      content,
      title: metadata.title,
      tags: metadata.tags,
      createdAt: createdAt || now,
      updatedAt: updatedAt || now,
      wordCount: metadata.wordCount,
      characterCount: metadata.characterCount,
      linkCount: metadata.linkCount,
      backLinkCount: 0, // Will be calculated after links are indexed
    };

    try {
      // Use circuit breaker and retry logic for database operations
      await dbCircuitBreaker.execute(async () => {
        await withRetry(
          async () => {
            // Upsert note (insert or update if exists)
            await this.db
              .insert(schema.notes)
              .values(noteData)
              .onConflictDoUpdate({
                target: schema.notes.id,
                set: {
                  content: noteData.content,
                  title: noteData.title,
                  tags: noteData.tags,
                  updatedAt: noteData.updatedAt,
                  wordCount: noteData.wordCount,
                  characterCount: noteData.characterCount,
                  linkCount: noteData.linkCount,
                },
              })
              .run();

            // Update links
            await this.updateLinks(noteId, metadata.wikilinks, userId);
          },
          `indexNote:${noteId}`,
          { maxAttempts: 3 }
        );
      }, `indexNote:${noteId}`);

      dbLogger.debug('Note indexed successfully', { noteId });
    } catch (error) {
      dbLogger.error('Failed to index note after retries', { noteId }, error as Error);
      throw error; // Re-throw to let caller handle
    }
  }

  /**
   * Update links for a note
   */
  private async updateLinks(sourceId: string, wikilinks: string[], userId: string = 'system') {
    try {
      // Delete existing links from this note
      await this.db.delete(schema.links).where(eq(schema.links.sourceId, sourceId)).run();

      // Insert new links
      for (const link of wikilinks) {
        // Try to find target note (could be in any folder)
        const targetNote = await this.findNoteByName(link);

        if (targetNote) {
          await this.db
            .insert(schema.links)
            .values({
              userId, // Add userId for links
              sourceId,
              targetId: targetNote.id,
              type: 'wikilink',
              context: null,
              createdAt: new Date(),
            })
            .run();
        }
      }

      // Update backlink counts
      await this.updateBacklinkCounts();
    } catch (error) {
      dbLogger.error('Error updating links', { sourceId }, error as Error);
    }
  }

  /**
   * Find a note by name (without .md extension)
   */
  private async findNoteByName(name: string) {
    const results = await this.db
      .select()
      .from(schema.notes)
      .where(eq(schema.notes.name, name))
      .limit(1)
      .all();

    return results[0] || null;
  }

  /**
   * Update backlink counts for all notes
   */
  private async updateBacklinkCounts() {
    try {
      // Get backlink counts
      const backlinkCounts = await this.db
        .select({
          targetId: schema.links.targetId,
          count: sql<number>`count(*)`.as('count'),
        })
        .from(schema.links)
        .groupBy(schema.links.targetId)
        .all();

      // Update each note
      for (const { targetId, count } of backlinkCounts) {
        await this.db
          .update(schema.notes)
          .set({ backLinkCount: Number(count) })
          .where(eq(schema.notes.id, targetId))
          .run();
      }
    } catch (error) {
      dbLogger.error('Error updating backlink counts', {}, error as Error);
    }
  }

  /**
   * Delete a note from database
   */
  async deleteNote(noteId: string) {
    try {
      await this.db.delete(schema.notes).where(eq(schema.notes.id, noteId)).run();

      dbLogger.debug('Note deleted from database', { noteId });

      // Update backlink counts (cascading delete will remove links)
      await this.updateBacklinkCounts();
    } catch (error) {
      dbLogger.error('Error deleting note from database', { noteId }, error as Error);
    }
  }

  /**
   * Initialize database from file system
   * Scans all markdown files and syncs with database
   */
  async initialize() {
    dbLogger.info('Starting database initialization');

    try {
      // Scan all markdown files
      const files = await this.scanMarkdownFiles();
      dbLogger.info('Scanned markdown files', { count: files.length });

      // Get all notes from database
      const dbNotes = await this.db.select().from(schema.notes).all();
      // const dbNoteIds = new Set(dbNotes.map(n => n.id)); // Commented out: not used

      // Find files that need to be indexed/updated
      let addedCount = 0;
      let updatedCount = 0;

      for (const file of files) {
        const dbNote = dbNotes.find(n => n.id === file.id);

        if (!dbNote) {
          // New file - add to database
          await this.indexNote(
            file.id,
            file.content,
            'system',
            file.stats.birthtime,
            file.stats.mtime
          );
          addedCount++;
        } else if (file.stats.mtime > dbNote.updatedAt) {
          // File modified - update database
          await this.indexNote(file.id, file.content, 'system', dbNote.createdAt, file.stats.mtime);
          updatedCount++;
        }
      }

      // Find notes in DB that no longer have files (deleted)
      const fileIds = new Set(files.map(f => f.id));
      const deletedNotes = dbNotes.filter(n => !fileIds.has(n.id));

      for (const note of deletedNotes) {
        await this.deleteNote(note.id);
      }

      dbLogger.info('Database initialization complete', {
        added: addedCount,
        updated: updatedCount,
        deleted: deletedNotes.length,
        total: files.length,
      });
    } catch (error) {
      dbLogger.error('Database initialization failed', {}, error as Error);
      throw error; // Re-throw to prevent app from starting with corrupt state
    }
  }

  /**
   * Get sync statistics
   */
  async getStats() {
    const noteCount = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.notes)
      .get();

    const linkCount = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.links)
      .get();

    return {
      notes: noteCount?.count || 0,
      links: linkCount?.count || 0,
    };
  }
}

// Singleton instance
let syncInstance: FileSystemDBSync | null = null;

export function getSyncService() {
  if (!syncInstance) {
    syncInstance = new FileSystemDBSync();
  }
  return syncInstance;
}
