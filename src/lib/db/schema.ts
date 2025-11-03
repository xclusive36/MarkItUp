import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Notes table - Metadata and content cache from markdown files
 * Files on disk remain the source of truth
 */
export const notes = sqliteTable(
  'notes',
  {
    // Primary key is the file path (e.g., "folder/note.md" or "note.md")
    id: text('id').primaryKey(),

    // File metadata
    name: text('name').notNull(), // filename without .md
    folder: text('folder'), // folder path or null for root
    content: text('content').notNull(), // full markdown content

    // Extracted metadata
    title: text('title'), // First H1 or filename
    tags: text('tags'), // JSON array of tags

    // Timestamps
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),

    // Cached statistics
    wordCount: integer('word_count').notNull().default(0),
    characterCount: integer('character_count').notNull().default(0),
    linkCount: integer('link_count').notNull().default(0),
    backLinkCount: integer('backlink_count').notNull().default(0),
  },
  table => ({
    // Indexes for common queries
    folderIdx: index('folder_idx').on(table.folder),
    updatedAtIdx: index('updated_at_idx').on(table.updatedAt),
    nameIdx: index('name_idx').on(table.name),
  })
);

/**
 * Links table - Wikilinks and markdown links between notes
 */
export const links = sqliteTable(
  'links',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),

    // Source note (the one containing the link)
    sourceId: text('source_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),

    // Target note (the one being linked to)
    targetId: text('target_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),

    // Link type: 'wikilink' ([[note]]) or 'markdown' ([text](note.md))
    type: text('type').notNull(),

    // Context where link appears (for preview)
    context: text('context'),

    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  table => ({
    // Indexes for backlink queries
    sourceIdx: index('source_idx').on(table.sourceId),
    targetIdx: index('target_idx').on(table.targetId),
    // Composite index for unique constraint
    uniqueLinkIdx: index('unique_link_idx').on(table.sourceId, table.targetId, table.type),
  })
);

/**
 * Full-text search virtual table for notes content
 * Uses SQLite FTS5 for blazing-fast search
 */
export const notesFts = sqliteTable('notes_fts', {
  id: text('id').primaryKey(),
  content: text('content'),
  title: text('title'),
  tags: text('tags'),
});

// Type exports for TypeScript
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
