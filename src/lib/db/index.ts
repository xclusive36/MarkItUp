import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

/**
 * SQLite database client (singleton)
 * Database file stored in project root as 'markitup.db'
 */
let sqliteDb: Database.Database | null = null;
let db: BetterSQLite3Database<typeof schema> | null = null;

export function getDatabase(): BetterSQLite3Database<typeof schema> {
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

  // ============================================================================
  // AUTHENTICATION & USER MANAGEMENT TABLES
  // ============================================================================

  // Create users table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER,
      name TEXT,
      image TEXT,
      password_hash TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_email_verified INTEGER NOT NULL DEFAULT 0,
      plan TEXT NOT NULL DEFAULT 'free',
      plan_expiry INTEGER,
      storage_quota INTEGER NOT NULL DEFAULT ${100 * 1024 * 1024},
      storage_used INTEGER NOT NULL DEFAULT 0,
      notes_quota INTEGER NOT NULL DEFAULT 100,
      ai_requests_quota INTEGER NOT NULL DEFAULT 20,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_login_at INTEGER
    );
  `);

  sqliteDb.exec(`CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);`);

  // Create sessions table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  sqliteDb.exec(`
    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(token);
    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
  `);

  // Create oauth_accounts table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS oauth_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      expires_at INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  sqliteDb.exec(`
    CREATE INDEX IF NOT EXISTS oauth_accounts_user_id_idx ON oauth_accounts(user_id);
    CREATE INDEX IF NOT EXISTS oauth_accounts_provider_idx ON oauth_accounts(provider, provider_account_id);
  `);

  // Create verification_tokens table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  sqliteDb.exec(`
    CREATE INDEX IF NOT EXISTS verification_tokens_email_idx ON verification_tokens(email);
    CREATE INDEX IF NOT EXISTS verification_tokens_token_idx ON verification_tokens(token);
  `);

  // Create password_reset_tokens table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  sqliteDb.exec(`
    CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON password_reset_tokens(token);
    CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx ON password_reset_tokens(user_id);
  `);

  // Create user_preferences table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      editor_mode TEXT DEFAULT 'edit',
      theme TEXT DEFAULT 'system',
      font_size INTEGER DEFAULT 14,
      font_family TEXT DEFAULT 'Inter',
      line_height INTEGER DEFAULT 150,
      left_panel_width INTEGER DEFAULT 280,
      right_panel_width INTEGER DEFAULT 320,
      left_panel_collapsed INTEGER DEFAULT 0,
      right_panel_collapsed INTEGER DEFAULT 1,
      enable_collaboration INTEGER DEFAULT 0,
      enable_semantic_search INTEGER DEFAULT 1,
      enable_ai INTEGER DEFAULT 1,
      ai_provider TEXT DEFAULT 'ollama',
      ai_model TEXT,
      ai_temperature INTEGER DEFAULT 70,
      ai_max_tokens INTEGER DEFAULT 2000,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create user_api_keys table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS user_api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      encrypted_key TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_used_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  sqliteDb.exec(`
    CREATE INDEX IF NOT EXISTS user_api_keys_user_provider_idx ON user_api_keys(user_id, provider);
  `);

  // Create usage_metrics table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS usage_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      notes_created INTEGER NOT NULL DEFAULT 0,
      notes_updated INTEGER NOT NULL DEFAULT 0,
      notes_deleted INTEGER NOT NULL DEFAULT 0,
      ai_requests INTEGER NOT NULL DEFAULT 0,
      collaboration_minutes INTEGER NOT NULL DEFAULT 0,
      search_queries INTEGER NOT NULL DEFAULT 0,
      storage_used INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  sqliteDb.exec(`
    CREATE INDEX IF NOT EXISTS usage_metrics_user_date_idx ON usage_metrics(user_id, date);
  `);

  // ============================================================================
  // NOTES & KNOWLEDGE BASE TABLES
  // ============================================================================

  // Create notes table (updated with user_id)
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
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
      backlink_count INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create indexes
  sqliteDb.exec(`
    CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
    CREATE INDEX IF NOT EXISTS folder_idx ON notes(folder);
    CREATE INDEX IF NOT EXISTS updated_at_idx ON notes(updated_at);
    CREATE INDEX IF NOT EXISTS name_idx ON notes(name);
  `);

  // Create links table (updated with user_id)
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      type TEXT NOT NULL,
      context TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES notes(id) ON DELETE CASCADE
    );
  `);

  // Create link indexes
  sqliteDb.exec(`
    CREATE INDEX IF NOT EXISTS links_user_id_idx ON links(user_id);
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
 * Optionally filter by userId for multi-tenant support
 */
export async function searchNotes(query: string, limit = 20, userId?: string) {
  const database = getDatabase();

  try {
    // Use FTS5 MATCH for full-text search with optional user filter
    const userFilter = userId ? sql` AND notes.user_id = ${userId}` : sql``;

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
      .innerJoin(
        sql`notes_fts`,
        sql`notes.rowid = notes_fts.rowid AND notes_fts MATCH ${query}${userFilter}`
      )
      .limit(limit)
      .all();

    return results;
  } catch (error) {
    console.error('[DB] Search error:', error);
    // Fallback to simple LIKE search if FTS fails
    const userFilter = userId ? sql` AND ${schema.notes.userId} = ${userId}` : sql``;

    const results = database
      .select()
      .from(schema.notes)
      .where(sql`content LIKE ${'%' + query + '%'}${userFilter}`)
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
