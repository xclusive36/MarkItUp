import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * ============================================================================
 * AUTHENTICATION & USER MANAGEMENT TABLES
 * ============================================================================
 */

/**
 * Users table - Core user account information
 */
export const users = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'timestamp' }),
    name: text('name'),
    image: text('image'),
    passwordHash: text('password_hash'), // bcrypt hash

    // Account status
    isActive: integer('is_active', { mode: 'boolean' })
      .notNull()
      .default(sql`1`),
    isEmailVerified: integer('is_email_verified', { mode: 'boolean' })
      .notNull()
      .default(sql`0`),

    // Subscription & limits (for future billing)
    plan: text('plan').notNull().default('free'), // 'free', 'pro', 'enterprise'
    planExpiry: integer('plan_expiry', { mode: 'timestamp' }),

    // Usage quotas (bytes for storage, counts for others)
    storageQuota: integer('storage_quota')
      .notNull()
      .default(100 * 1024 * 1024), // 100MB default
    storageUsed: integer('storage_used').notNull().default(0),
    notesQuota: integer('notes_quota').notNull().default(100), // 100 notes for free
    aiRequestsQuota: integer('ai_requests_quota').notNull().default(20), // 20/day for free

    // Timestamps
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  },
  table => ({
    emailIdx: index('users_email_idx').on(table.email),
  })
);

/**
 * Sessions table - User session management
 */
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(), // JWT or session token
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
  },
  table => ({
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
    tokenIdx: index('sessions_token_idx').on(table.token),
    expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
  })
);

/**
 * OAuth accounts table - For Google, GitHub, etc.
 */
export const oauthAccounts = sqliteTable(
  'oauth_accounts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(), // 'google', 'github', etc.
    providerAccountId: text('provider_account_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  table => ({
    userIdIdx: index('oauth_accounts_user_id_idx').on(table.userId),
    providerIdx: index('oauth_accounts_provider_idx').on(table.provider, table.providerAccountId),
  })
);

/**
 * Email verification tokens
 */
export const verificationTokens = sqliteTable(
  'verification_tokens',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull(),
    token: text('token').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  table => ({
    emailIdx: index('verification_tokens_email_idx').on(table.email),
    tokenIdx: index('verification_tokens_token_idx').on(table.token),
  })
);

/**
 * Password reset tokens
 */
export const passwordResetTokens = sqliteTable(
  'password_reset_tokens',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    used: integer('used', { mode: 'boolean' })
      .notNull()
      .default(sql`0`),
  },
  table => ({
    tokenIdx: index('password_reset_tokens_token_idx').on(table.token),
    userIdIdx: index('password_reset_tokens_user_id_idx').on(table.userId),
  })
);

/**
 * User preferences - Settings that were in localStorage
 */
export const userPreferences = sqliteTable('user_preferences', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Editor preferences
  editorMode: text('editor_mode').default('edit'), // 'edit', 'preview', 'split', 'wysiwyg'
  theme: text('theme').default('system'), // 'light', 'dark', 'system'
  fontSize: integer('font_size').default(14),
  fontFamily: text('font_family').default('Inter'),
  lineHeight: integer('line_height').default(150),

  // Layout preferences
  leftPanelWidth: integer('left_panel_width').default(280),
  rightPanelWidth: integer('right_panel_width').default(320),
  leftPanelCollapsed: integer('left_panel_collapsed', { mode: 'boolean' }).default(sql`0`),
  rightPanelCollapsed: integer('right_panel_collapsed', { mode: 'boolean' }).default(sql`1`),

  // Feature flags
  enableCollaboration: integer('enable_collaboration', { mode: 'boolean' }).default(sql`0`),
  enableSemanticSearch: integer('enable_semantic_search', { mode: 'boolean' }).default(sql`1`),
  enableAI: integer('enable_ai', { mode: 'boolean' }).default(sql`1`),

  // AI preferences
  aiProvider: text('ai_provider').default('ollama'), // 'openai', 'anthropic', 'google', 'ollama'
  aiModel: text('ai_model'),
  aiTemperature: integer('ai_temperature').default(70), // 0-100, stored as int
  aiMaxTokens: integer('ai_max_tokens').default(2000),

  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * User API keys - Encrypted storage for AI provider keys
 */
export const userApiKeys = sqliteTable(
  'user_api_keys',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(), // 'openai', 'anthropic', 'google'
    encryptedKey: text('encrypted_key').notNull(), // AES-256 encrypted
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  },
  table => ({
    userProviderIdx: index('user_api_keys_user_provider_idx').on(table.userId, table.provider),
  })
);

/**
 * Usage tracking - Monitor quotas and generate analytics
 */
export const usageMetrics = sqliteTable(
  'usage_metrics',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: text('date').notNull(), // YYYY-MM-DD for daily aggregation

    // Counters
    notesCreated: integer('notes_created').notNull().default(0),
    notesUpdated: integer('notes_updated').notNull().default(0),
    notesDeleted: integer('notes_deleted').notNull().default(0),
    aiRequests: integer('ai_requests').notNull().default(0),
    collaborationMinutes: integer('collaboration_minutes').notNull().default(0),
    searchQueries: integer('search_queries').notNull().default(0),

    // Storage snapshot
    storageUsed: integer('storage_used').notNull().default(0),

    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  table => ({
    userDateIdx: index('usage_metrics_user_date_idx').on(table.userId, table.date),
  })
);

/**
 * ============================================================================
 * NOTES & KNOWLEDGE BASE TABLES
 * ============================================================================
 */

/**
 * Notes table - Metadata and content cache from markdown files
 * Files on disk remain the source of truth
 */
export const notes = sqliteTable(
  'notes',
  {
    // Primary key is the file path (e.g., "folder/note.md" or "note.md")
    id: text('id').primaryKey(),

    // User ownership (for multi-tenancy)
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

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
    userIdIdx: index('notes_user_id_idx').on(table.userId),
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

    // User ownership (for multi-tenancy)
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

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
    userIdIdx: index('links_user_id_idx').on(table.userId),
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
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type OAuthAccount = typeof oauthAccounts.$inferSelect;
export type NewOAuthAccount = typeof oauthAccounts.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
export type UserApiKey = typeof userApiKeys.$inferSelect;
export type NewUserApiKey = typeof userApiKeys.$inferInsert;
export type UsageMetric = typeof usageMetrics.$inferSelect;
export type NewUsageMetric = typeof usageMetrics.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
