import { getDatabase, schema } from './index';
import { sql, eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import type { Note } from '../types';

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
    const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.md');

    // Extract tags (#tag format)
    const tagMatches = content.match(/#[\w-]+/g) || [];
    const tags = [...new Set(tagMatches)].sort();

    // Extract wikilinks ([[link]])
    const wikilinkMatches = content.match(/\[\[([^\]]+)\]\]/g) || [];
    const wikilinks = wikilinkMatches.map(match => {
      const link = match.slice(2, -2); // Remove [[ ]]
      return link.split('|')[0].trim(); // Handle [[link|alias]]
    });

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

        if (entry.isDirectory()) {
          await scanDir(fullPath, baseDir);
        } else if (entry.name.endsWith('.md')) {
          const content = await fs.readFile(fullPath, 'utf-8');
          const stats = await fs.stat(fullPath);

          // Create relative path from markdown dir
          const relativePath = path.relative(baseDir, fullPath);
          const folder = path.dirname(relativePath) === '.' ? null : path.dirname(relativePath);
          const name = path.basename(relativePath, '.md');

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
      console.error('[Sync] Error scanning files:', error);
    }

    return files;
  }

  /**
   * Index a single note (insert or update)
   */
  async indexNote(noteId: string, content: string, createdAt?: Date, updatedAt?: Date) {
    const metadata = this.extractMetadata(noteId, content);
    const folder = path.dirname(noteId) === '.' ? null : path.dirname(noteId);
    const name = path.basename(noteId, '.md');

    const now = new Date();

    const noteData = {
      id: noteId,
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
      await this.updateLinks(noteId, metadata.wikilinks);

      console.log(`[Sync] Indexed note: ${noteId}`);
    } catch (error) {
      console.error(`[Sync] Error indexing note ${noteId}:`, error);
    }
  }

  /**
   * Update links for a note
   */
  private async updateLinks(sourceId: string, wikilinks: string[]) {
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
      console.error(`[Sync] Error updating links for ${sourceId}:`, error);
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
      console.error('[Sync] Error updating backlink counts:', error);
    }
  }

  /**
   * Delete a note from database
   */
  async deleteNote(noteId: string) {
    try {
      await this.db.delete(schema.notes).where(eq(schema.notes.id, noteId)).run();

      console.log(`[Sync] Deleted note: ${noteId}`);

      // Update backlink counts (cascading delete will remove links)
      await this.updateBacklinkCounts();
    } catch (error) {
      console.error(`[Sync] Error deleting note ${noteId}:`, error);
    }
  }

  /**
   * Initialize database from file system
   * Scans all markdown files and syncs with database
   */
  async initialize() {
    console.log('[Sync] Starting initial sync...');

    try {
      // Scan all markdown files
      const files = await this.scanMarkdownFiles();
      console.log(`[Sync] Found ${files.length} markdown files`);

      // Get all notes from database
      const dbNotes = await this.db.select().from(schema.notes).all();
      const dbNoteIds = new Set(dbNotes.map(n => n.id));

      // Find files that need to be indexed/updated
      let addedCount = 0;
      let updatedCount = 0;

      for (const file of files) {
        const dbNote = dbNotes.find(n => n.id === file.id);

        if (!dbNote) {
          // New file - add to database
          await this.indexNote(file.id, file.content, file.stats.birthtime, file.stats.mtime);
          addedCount++;
        } else if (file.stats.mtime > dbNote.updatedAt) {
          // File modified - update database
          await this.indexNote(file.id, file.content, dbNote.createdAt, file.stats.mtime);
          updatedCount++;
        }
      }

      // Find notes in DB that no longer have files (deleted)
      const fileIds = new Set(files.map(f => f.id));
      const deletedNotes = dbNotes.filter(n => !fileIds.has(n.id));

      for (const note of deletedNotes) {
        await this.deleteNote(note.id);
      }

      console.log(`[Sync] Initial sync complete:`);
      console.log(`  - Added: ${addedCount}`);
      console.log(`  - Updated: ${updatedCount}`);
      console.log(`  - Deleted: ${deletedNotes.length}`);
    } catch (error) {
      console.error('[Sync] Error during initialization:', error);
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
