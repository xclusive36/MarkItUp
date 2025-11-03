import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

/**
 * SQLite database client (singleton)
 * Database file stored in project root as 'markitup.db'
 */
let sqliteDb: Database.Database | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!db) {
    // Determine database path (project root)
    const dbPath = path.join(process.cwd(), 'markitup.db');

    // Ensure the database file exists
    if (!fs.existsSync(dbPath)) {
      console.log('[DB] Creating new database at:', dbPath);
    }

    // Create SQLite connection
    sqliteDb = new Database(dbPath);

    // Enable WAL mode for better concurrency
    sqliteDb.pragma('journal_mode = WAL');

    // Create Drizzle instance
    db = drizzle(sqliteDb, { schema });

    // Initialize database schema
    initializeSchema();

    console.log('[DB] Database initialized successfully');
  }

  return db;
}

/**
 * Initialize database schema (create tables if they don't exist)
 */
function initializeSchema() {
  if (!sqliteDb) return;

  // Create notes table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      folder TEXT,
      content TEXT NOT NULL,
      title TEXT,
      tags TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      word_count INTEGER NOT NULL DEFAULT 0,
      character_count INTEGER NOT NULL DEFAULT 0,
      link_count INTEGER NOT NULL DEFAULT 0,
      backlink_count INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Create indexes
  sqliteDb.exec(`
    CREATE INDEX IF NOT EXISTS folder_idx ON notes(folder);
    CREATE INDEX IF NOT EXISTS updated_at_idx ON notes(updated_at);
    CREATE INDEX IF NOT EXISTS name_idx ON notes(name);
  `);

  // Create links table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      type TEXT NOT NULL,
      context TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (source_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES notes(id) ON DELETE CASCADE
    );
  `);

  // Create link indexes
  sqliteDb.exec(`
    CREATE INDEX IF NOT EXISTS source_idx ON links(source_id);
    CREATE INDEX IF NOT EXISTS target_idx ON links(target_id);
    CREATE INDEX IF NOT EXISTS unique_link_idx ON links(source_id, target_id, type);
  `);

  // Create FTS5 virtual table for full-text search
  sqliteDb.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
      id UNINDEXED,
      content,
      title,
      tags,
      content='notes',
      content_rowid='rowid'
    );
  `);

  // Create triggers to keep FTS in sync with notes table
  sqliteDb.exec(`
    CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
      INSERT INTO notes_fts(rowid, id, content, title, tags)
      VALUES (new.rowid, new.id, new.content, new.title, new.tags);
    END;
  `);

  sqliteDb.exec(`
    CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
      DELETE FROM notes_fts WHERE rowid = old.rowid;
    END;
  `);

  sqliteDb.exec(`
    CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
      UPDATE notes_fts 
      SET content = new.content, title = new.title, tags = new.tags
      WHERE rowid = new.rowid;
    END;
  `);

  console.log('[DB] Schema initialized');
}

/**
 * Close database connection (cleanup)
 */
export function closeDatabase() {
  if (sqliteDb) {
    sqliteDb.close();
    sqliteDb = null;
    db = null;
    console.log('[DB] Database connection closed');
  }
}

/**
 * Full-text search using FTS5
 */
export async function searchNotes(query: string, limit = 20) {
  const database = getDatabase();

  try {
    // Use FTS5 MATCH for full-text search
    const results = database
      .select({
        id: schema.notes.id,
        name: schema.notes.name,
        folder: schema.notes.folder,
        title: schema.notes.title,
        content: schema.notes.content,
        tags: schema.notes.tags,
        updatedAt: schema.notes.updatedAt,
      })
      .from(schema.notes)
      .innerJoin(sql`notes_fts`, sql`notes.rowid = notes_fts.rowid AND notes_fts MATCH ${query}`)
      .limit(limit)
      .all();

    return results;
  } catch (error) {
    console.error('[DB] Search error:', error);
    // Fallback to simple LIKE search if FTS fails
    const results = database
      .select()
      .from(schema.notes)
      .where(sql`content LIKE ${'%' + query + '%'}`)
      .limit(limit)
      .all();

    return results;
  }
}

/**
 * Get backlinks for a note
 */
export async function getBacklinks(noteId: string) {
  const database = getDatabase();

  const backlinks = database
    .select({
      sourceId: schema.links.sourceId,
      sourceName: schema.notes.name,
      sourceFolder: schema.notes.folder,
      type: schema.links.type,
      context: schema.links.context,
    })
    .from(schema.links)
    .innerJoin(schema.notes, sql`links.source_id = notes.id`)
    .where(sql`links.target_id = ${noteId}`)
    .all();

  return backlinks;
}

/**
 * Get all tags with counts
 */
export async function getTagsWithCounts() {
  const database = getDatabase();

  const notes = database
    .select({
      tags: schema.notes.tags,
    })
    .from(schema.notes)
    .all();

  // Parse tags and count occurrences
  const tagCounts: Record<string, number> = {};

  notes.forEach(note => {
    if (note.tags) {
      try {
        const tags = JSON.parse(note.tags);
        tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      } catch (e) {
        // Skip invalid JSON
      }
    }
  });

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export { schema };
export type { Note, NewNote, Link, NewLink } from './schema';
