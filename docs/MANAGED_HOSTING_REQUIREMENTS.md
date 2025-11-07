# Managed Hosting - Application Requirements

**Document Version:** 1.0  
**Date:** November 7, 2025  
**Status:** Planning Phase

This document outlines the **internal application changes** required to transform MarkItUp from a single-user self-hosted application to a multi-tenant managed hosting platform.

---

## 📊 Current State

**Architecture:**
- ✅ File-based markdown storage (`/markdown` directory)
- ✅ SQLite database for search/indexing
- ✅ API routes for file operations
- ✅ Real-time collaboration infrastructure (WebSocket)
- ✅ AI integration with multiple providers
- ✅ Plugin system
- ❌ **No authentication system**
- ❌ **No user data isolation**
- ❌ **No multi-tenancy support**

**Security Gaps:**
- API routes are completely open (no auth required)
- All users would share the same `/markdown` directory
- No concept of "users" in database schema
- Client-side settings stored in localStorage (not per-user)
- AI API keys stored client-side (insecure for managed hosting)

---

## 🎯 Required Application Changes

### 1. Authentication & User Management

#### 1.1 User Database Schema

**New Tables Required:**

```typescript
// src/lib/db/schema.ts

/**
 * Users table - Core user account information
 */
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'timestamp' }),
  name: text('name'),
  image: text('image'),
  passwordHash: text('password_hash'), // bcrypt hash
  
  // Account status
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  isEmailVerified: integer('is_email_verified', { mode: 'boolean' }).default(false),
  
  // Subscription & limits (for future billing)
  plan: text('plan').default('free'), // 'free', 'pro', 'enterprise'
  planExpiry: integer('plan_expiry', { mode: 'timestamp' }),
  
  // Usage quotas
  storageQuota: integer('storage_quota').default(100 * 1024 * 1024), // 100MB default
  storageUsed: integer('storage_used').default(0),
  notesQuota: integer('notes_quota').default(100), // 100 notes for free
  aiRequestsQuota: integer('ai_requests_quota').default(20), // 20/day for free
  
  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

/**
 * Sessions table - User session management
 */
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(), // JWT or session token
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
}, (table) => ({
  userIdIdx: index('sessions_user_id_idx').on(table.userId),
  tokenIdx: index('sessions_token_idx').on(table.token),
}));

/**
 * OAuth accounts table - For Google, GitHub, etc.
 */
export const oauthAccounts = sqliteTable('oauth_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'google', 'github', etc.
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: index('oauth_accounts_user_id_idx').on(table.userId),
  providerIdx: index('oauth_accounts_provider_idx').on(table.provider, table.providerAccountId),
}));

/**
 * Email verification tokens
 */
export const verificationTokens = sqliteTable('verification_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  emailIdx: index('verification_tokens_email_idx').on(table.email),
  tokenIdx: index('verification_tokens_token_idx').on(table.token),
}));

/**
 * Password reset tokens
 */
export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  used: integer('used', { mode: 'boolean' }).default(false),
}, (table) => ({
  tokenIdx: index('password_reset_tokens_token_idx').on(table.token),
}));
```

#### 1.2 Update Existing Tables for Multi-Tenancy

**Modify ALL existing tables to include userId:**

```typescript
// Update notes table
export const notes = sqliteTable(
  'notes',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // NEW
    
    // Existing fields...
    name: text('name').notNull(),
    folder: text('folder'),
    content: text('content').notNull(),
    title: text('title'),
    tags: text('tags'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    userIdIdx: index('notes_user_id_idx').on(table.userId), // NEW INDEX
    folderIdx: index('notes_folder_idx').on(table.folder),
  })
);

// Update links table
export const links = sqliteTable(
  'links',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // NEW
    
    sourceNoteId: text('source_note_id').notNull(),
    targetNoteId: text('target_note_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    userIdIdx: index('links_user_id_idx').on(table.userId), // NEW INDEX
    sourceIdx: index('links_source_idx').on(table.sourceNoteId),
    targetIdx: index('links_target_idx').on(table.targetNoteId),
  })
);

// Similar updates needed for:
// - notesFts (full-text search)
// - notesMetadata
// - Any other data tables
```

#### 1.3 User Preferences & Settings

```typescript
/**
 * User preferences - Settings that were in localStorage
 */
export const userPreferences = sqliteTable('user_preferences', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  
  // Editor preferences
  editorMode: text('editor_mode').default('edit'), // 'edit', 'preview', 'split', 'wysiwyg'
  theme: text('theme').default('system'), // 'light', 'dark', 'system'
  fontSize: integer('font_size').default(14),
  fontFamily: text('font_family').default('Inter'),
  lineHeight: integer('line_height').default(150),
  
  // Layout preferences
  leftPanelWidth: integer('left_panel_width').default(280),
  rightPanelWidth: integer('right_panel_width').default(320),
  leftPanelCollapsed: integer('left_panel_collapsed', { mode: 'boolean' }).default(false),
  rightPanelCollapsed: integer('right_panel_collapsed', { mode: 'boolean' }).default(true),
  
  // Feature flags
  enableCollaboration: integer('enable_collaboration', { mode: 'boolean' }).default(false),
  enableSemanticSearch: integer('enable_semantic_search', { mode: 'boolean' }).default(true),
  enableAI: integer('enable_ai', { mode: 'boolean' }).default(true),
  
  // AI preferences
  aiProvider: text('ai_provider').default('ollama'), // 'openai', 'anthropic', 'google', 'ollama'
  aiModel: text('ai_model'),
  aiTemperature: integer('ai_temperature').default(70), // 0-100, stored as int
  aiMaxTokens: integer('ai_max_tokens').default(2000),
  
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

/**
 * User API keys - Encrypted storage
 */
export const userApiKeys = sqliteTable('user_api_keys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'openai', 'anthropic', 'google'
  encryptedKey: text('encrypted_key').notNull(), // AES-256 encrypted
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
}, (table) => ({
  userProviderIdx: index('user_api_keys_user_provider_idx').on(table.userId, table.provider),
}));

/**
 * Usage tracking - Monitor quotas
 */
export const usageMetrics = sqliteTable('usage_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD for daily aggregation
  
  // Counters
  notesCreated: integer('notes_created').default(0),
  notesUpdated: integer('notes_updated').default(0),
  notesDeleted: integer('notes_deleted').default(0),
  aiRequests: integer('ai_requests').default(0),
  collaborationMinutes: integer('collaboration_minutes').default(0),
  searchQueries: integer('search_queries').default(0),
  
  // Storage snapshot
  storageUsed: integer('storage_used').default(0),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  userDateIdx: index('usage_metrics_user_date_idx').on(table.userId, table.date),
}));
```

---

### 2. Authentication Service Layer

#### 2.1 Auth Service Implementation

**File:** `src/lib/auth/auth-service.ts`

```typescript
import bcrypt from 'bcryptjs'
import { getDatabase } from '@/lib/db'
import { users, sessions, verificationTokens, passwordResetTokens } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import { generateToken, verifyToken } from './jwt'
import { sendVerificationEmail, sendPasswordResetEmail } from './email'

export class AuthService {
  private db = getDatabase()

  /**
   * Register new user with email/password
   */
  async register(email: string, password: string, name?: string) {
    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format')
    }

    // Check password strength
    if (!this.isStrongPassword(password)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number')
    }

    // Check if user already exists
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const [newUser] = await this.db.insert(users).values({
      email,
      passwordHash,
      name,
      isActive: true,
      isEmailVerified: false,
    }).returning()

    // Create verification token
    const verificationToken = this.generateSecureToken()
    await this.db.insert(verificationTokens).values({
      email,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    })

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return { userId: newUser.id, email: newUser.email }
  }

  /**
   * Login with email/password
   */
  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    // Find user
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials')
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('Account is disabled')
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    // Create session
    const sessionToken = generateToken({ userId: user.id })
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await this.db.insert(sessions).values({
      userId: user.id,
      token: sessionToken,
      expiresAt,
      ipAddress,
      userAgent,
    })

    // Update last login
    await this.db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id))

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        plan: user.plan,
        emailVerified: user.isEmailVerified,
      },
      sessionToken,
      expiresAt,
    }
  }

  /**
   * Verify session token
   */
  async verifySession(token: string) {
    const session = await this.db.query.sessions.findFirst({
      where: and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date())
      ),
      with: {
        user: true,
      }
    })

    if (!session) {
      return null
    }

    return {
      userId: session.userId,
      user: session.user,
    }
  }

  /**
   * Logout (invalidate session)
   */
  async logout(token: string) {
    await this.db.delete(sessions).where(eq(sessions.token, token))
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string) {
    const verification = await this.db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.token, token),
        gt(verificationTokens.expiresAt, new Date())
      )
    })

    if (!verification) {
      throw new Error('Invalid or expired verification token')
    }

    // Update user
    await this.db.update(users)
      .set({ isEmailVerified: true, emailVerified: new Date() })
      .where(eq(users.email, verification.email))

    // Delete used token
    await this.db.delete(verificationTokens).where(eq(verificationTokens.id, verification.id))

    return true
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (!user) {
      // Don't reveal if user exists
      return { success: true }
    }

    // Create reset token
    const resetToken = this.generateSecureToken()
    await this.db.insert(passwordResetTokens).values({
      userId: user.id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    })

    // Send reset email
    await sendPasswordResetEmail(email, resetToken)

    return { success: true }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    // Find valid reset token
    const resetToken = await this.db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date()),
        eq(passwordResetTokens.used, false)
      )
    })

    if (!resetToken) {
      throw new Error('Invalid or expired reset token')
    }

    // Validate new password
    if (!this.isStrongPassword(newPassword)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number')
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update user password
    await this.db.update(users)
      .set({ passwordHash })
      .where(eq(users.id, resetToken.userId))

    // Mark token as used
    await this.db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id))

    // Invalidate all sessions for this user
    await this.db.delete(sessions).where(eq(sessions.userId, resetToken.userId))

    return true
  }

  // Helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isStrongPassword(password: string): boolean {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password)
  }

  private generateSecureToken(): string {
    return crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '')
  }
}

// Singleton instance
let authService: AuthService | null = null

export function getAuthService(): AuthService {
  if (!authService) {
    authService = new AuthService()
  }
  return authService
}
```

#### 2.2 JWT Token Management

**File:** `src/lib/auth/jwt.ts`

```typescript
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRY = '30d' // 30 days

export interface TokenPayload {
  userId: string
  email?: string
  iat?: number
  exp?: number
}

export function generateToken(payload: { userId: string, email?: string }): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}
```

#### 2.3 Encryption Utilities (for API keys)

**File:** `src/lib/auth/encryption.ts`

```typescript
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32b'
const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

/**
 * Encrypt sensitive data (API keys)
 */
export function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32))
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encrypted: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32))
  const parts = encrypted.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encryptedText = parts[1]
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

---

### 3. API Route Protection

#### 3.1 Authentication Middleware

**File:** `src/lib/auth/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthService } from './auth-service'

export interface AuthenticatedRequest extends NextRequest {
  userId: string
  user: {
    id: string
    email: string
    name?: string
    plan: string
  }
}

/**
 * Middleware to require authentication
 * Use in API routes to protect endpoints
 */
export async function requireAuth(request: NextRequest): Promise<{ userId: string, user: any } | NextResponse> {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('session-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authentication token provided' },
        { status: 401 }
      )
    }

    // Verify session
    const authService = getAuthService()
    const session = await authService.verifySession(token)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!session.user.isActive) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Account is disabled' },
        { status: 403 }
      )
    }

    return {
      userId: session.userId,
      user: session.user,
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Authentication failed' },
      { status: 500 }
    )
  }
}

/**
 * Check if user owns a resource
 */
export async function checkOwnership(
  userId: string,
  resourceType: 'note' | 'link',
  resourceId: string
): Promise<boolean> {
  const db = getDatabase()
  
  if (resourceType === 'note') {
    const note = await db.query.notes.findFirst({
      where: eq(notes.id, resourceId)
    })
    return note?.userId === userId
  }
  
  if (resourceType === 'link') {
    const link = await db.query.links.findFirst({
      where: eq(links.id, parseInt(resourceId))
    })
    return link?.userId === userId
  }
  
  return false
}
```

#### 3.2 Update File API Routes

**File:** `src/app/api/files/route.ts` (Updated)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { fileService } from '@/lib/services/fileService'
import { requireAuth } from '@/lib/auth/middleware'
import { trackUsage } from '@/lib/usage/tracker'
import { checkQuota } from '@/lib/usage/quotas'

/**
 * GET /api/files - List user's notes
 */
export async function GET(request: NextRequest) {
  // ✅ Require authentication
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  try {
    // Get user's notes only
    const notes = await fileService.listFiles(userId)
    
    return NextResponse.json({
      notes,
      count: notes.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/files - Create new note
 */
export async function POST(request: NextRequest) {
  // ✅ Require authentication
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const { userId, user } = auth

  try {
    const { filename, content, folder } = await request.json()

    // ✅ Check quotas before creating
    const quotaCheck = await checkQuota(userId, 'notes')
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: 'Quota exceeded', message: quotaCheck.message },
        { status: 403 }
      )
    }

    // Create note for this user
    const note = await fileService.createFile(userId, filename, content, folder)

    // Track usage
    await trackUsage(userId, 'note_created')

    return NextResponse.json(note)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create file' },
      { status: 500 }
    )
  }
}
```

---

### 4. User-Scoped File Storage

#### 4.1 Update File Service

**File:** `src/lib/services/fileService.ts` (Updated)

```typescript
import fs from 'fs'
import path from 'path'

class FileService {
  private baseDir = path.join(process.cwd(), 'markdown')

  /**
   * Get user's markdown directory
   */
  private getUserDir(userId: string): string {
    return path.join(this.baseDir, `user_${userId}`)
  }

  /**
   * Ensure user directory exists
   */
  private ensureUserDir(userId: string): void {
    const userDir = this.getUserDir(userId)
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true })
    }
  }

  /**
   * List all notes for a user
   */
  async listFiles(userId: string): Promise<Note[]> {
    this.ensureUserDir(userId)
    const userDir = this.getUserDir(userId)
    
    // Recursively read all .md files
    const files = this.readDirectoryRecursive(userDir)
    
    return files.map(filePath => {
      const relativePath = path.relative(userDir, filePath)
      const content = fs.readFileSync(filePath, 'utf-8')
      const stats = fs.statSync(filePath)
      
      return {
        id: relativePath,
        name: path.basename(filePath, '.md'),
        folder: path.dirname(relativePath) === '.' ? null : path.dirname(relativePath),
        content,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
      }
    })
  }

  /**
   * Create a new note
   */
  async createFile(userId: string, filename: string, content: string, folder?: string): Promise<Note> {
    this.ensureUserDir(userId)
    const userDir = this.getUserDir(userId)
    
    const targetDir = folder ? path.join(userDir, folder) : userDir
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    
    const filePath = path.join(targetDir, `${filename}.md`)
    
    if (fs.existsSync(filePath)) {
      throw new Error('File already exists')
    }
    
    fs.writeFileSync(filePath, content, 'utf-8')
    
    const stats = fs.statSync(filePath)
    const relativePath = path.relative(userDir, filePath)
    
    return {
      id: relativePath,
      name: filename,
      folder: folder || null,
      content,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
    }
  }

  /**
   * Read a note
   */
  async readFile(userId: string, noteId: string): Promise<Note | null> {
    const userDir = this.getUserDir(userId)
    const filePath = path.join(userDir, noteId)
    
    if (!fs.existsSync(filePath)) {
      return null
    }
    
    const content = fs.readFileSync(filePath, 'utf-8')
    const stats = fs.statSync(filePath)
    
    return {
      id: noteId,
      name: path.basename(filePath, '.md'),
      folder: path.dirname(noteId) === '.' ? null : path.dirname(noteId),
      content,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
    }
  }

  /**
   * Update a note
   */
  async updateFile(userId: string, noteId: string, content: string): Promise<Note> {
    const userDir = this.getUserDir(userId)
    const filePath = path.join(userDir, noteId)
    
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found')
    }
    
    fs.writeFileSync(filePath, content, 'utf-8')
    
    const stats = fs.statSync(filePath)
    
    return {
      id: noteId,
      name: path.basename(filePath, '.md'),
      folder: path.dirname(noteId) === '.' ? null : path.dirname(noteId),
      content,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
    }
  }

  /**
   * Delete a note
   */
  async deleteFile(userId: string, noteId: string): Promise<void> {
    const userDir = this.getUserDir(userId)
    const filePath = path.join(userDir, noteId)
    
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found')
    }
    
    fs.unlinkSync(filePath)
  }

  /**
   * Calculate user's storage usage
   */
  async calculateStorageUsed(userId: string): Promise<number> {
    const userDir = this.getUserDir(userId)
    
    if (!fs.existsSync(userDir)) {
      return 0
    }
    
    let totalSize = 0
    const files = this.readDirectoryRecursive(userDir)
    
    files.forEach(filePath => {
      const stats = fs.statSync(filePath)
      totalSize += stats.size
    })
    
    return totalSize
  }

  private readDirectoryRecursive(dir: string): string[] {
    const files: string[] = []
    
    const items = fs.readdirSync(dir)
    items.forEach(item => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        files.push(...this.readDirectoryRecursive(fullPath))
      } else if (item.endsWith('.md')) {
        files.push(fullPath)
      }
    })
    
    return files
  }
}

export const fileService = new FileService()
```

---

### 5. Usage Tracking & Quota Enforcement

#### 5.1 Usage Tracker

**File:** `src/lib/usage/tracker.ts`

```typescript
import { getDatabase } from '@/lib/db'
import { users, usageMetrics } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

type UsageType = 'note_created' | 'note_updated' | 'note_deleted' | 'ai_request' | 'search_query'

export async function trackUsage(userId: string, type: UsageType, amount: number = 1) {
  const db = getDatabase()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  try {
    // Get or create today's metrics
    const existing = await db.query.usageMetrics.findFirst({
      where: and(
        eq(usageMetrics.userId, userId),
        eq(usageMetrics.date, today)
      )
    })

    if (existing) {
      // Update existing
      const updates: any = {}
      if (type === 'note_created') updates.notesCreated = existing.notesCreated + amount
      if (type === 'note_updated') updates.notesUpdated = existing.notesUpdated + amount
      if (type === 'note_deleted') updates.notesDeleted = existing.notesDeleted + amount
      if (type === 'ai_request') updates.aiRequests = existing.aiRequests + amount
      if (type === 'search_query') updates.searchQueries = existing.searchQueries + amount

      await db.update(usageMetrics)
        .set(updates)
        .where(eq(usageMetrics.id, existing.id))
    } else {
      // Create new
      const metrics: any = {
        userId,
        date: today,
        notesCreated: 0,
        notesUpdated: 0,
        notesDeleted: 0,
        aiRequests: 0,
        searchQueries: 0,
      }
      
      if (type === 'note_created') metrics.notesCreated = amount
      if (type === 'note_updated') metrics.notesUpdated = amount
      if (type === 'note_deleted') metrics.notesDeleted = amount
      if (type === 'ai_request') metrics.aiRequests = amount
      if (type === 'search_query') metrics.searchQueries = amount

      await db.insert(usageMetrics).values(metrics)
    }
  } catch (error) {
    console.error('Failed to track usage:', error)
  }
}

/**
 * Update user's storage usage
 */
export async function updateStorageUsage(userId: string, bytes: number) {
  const db = getDatabase()
  
  await db.update(users)
    .set({ storageUsed: bytes })
    .where(eq(users.id, userId))
}
```

#### 5.2 Quota Checker

**File:** `src/lib/usage/quotas.ts`

```typescript
import { getDatabase } from '@/lib/db'
import { users, usageMetrics } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

type QuotaType = 'notes' | 'storage' | 'ai_requests'

export async function checkQuota(userId: string, type: QuotaType): Promise<{
  allowed: boolean
  message?: string
  current?: number
  limit?: number
}> {
  const db = getDatabase()
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  })

  if (!user) {
    return { allowed: false, message: 'User not found' }
  }

  if (type === 'notes') {
    // Count user's notes
    const noteCount = await db.select({ count: sql`count(*)` })
      .from(notes)
      .where(eq(notes.userId, userId))
    
    const current = Number(noteCount[0]?.count || 0)
    const limit = user.notesQuota

    if (current >= limit) {
      return {
        allowed: false,
        message: `Note limit reached (${limit} notes). Upgrade your plan for more.`,
        current,
        limit,
      }
    }

    return { allowed: true, current, limit }
  }

  if (type === 'storage') {
    const current = user.storageUsed
    const limit = user.storageQuota

    if (current >= limit) {
      return {
        allowed: false,
        message: 'Storage quota exceeded. Upgrade your plan for more storage.',
        current,
        limit,
      }
    }

    return { allowed: true, current, limit }
  }

  if (type === 'ai_requests') {
    const today = new Date().toISOString().split('T')[0]
    
    const todayMetrics = await db.query.usageMetrics.findFirst({
      where: and(
        eq(usageMetrics.userId, userId),
        eq(usageMetrics.date, today)
      )
    })

    const current = todayMetrics?.aiRequests || 0
    const limit = user.aiRequestsQuota

    if (current >= limit) {
      return {
        allowed: false,
        message: 'Daily AI request limit reached. Upgrade for more requests.',
        current,
        limit,
      }
    }

    return { allowed: true, current, limit }
  }

  return { allowed: true }
}
```

---

### 6. Frontend Authentication Components

#### 6.1 Login Form

**File:** `src/components/auth/LoginForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store session token
      document.cookie = `session-token=${data.sessionToken}; path=/; max-age=${30 * 24 * 60 * 60}`

      // Redirect to dashboard
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  )
}
```

#### 6.2 Signup Form

**File:** `src/components/auth/SignupForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Show success message
      alert('Registration successful! Please check your email to verify your account.')
      router.push('/auth/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email *
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password *
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          At least 8 characters with uppercase, lowercase, and number
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium">
          Confirm Password *
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  )
}
```

---

### 7. Required Environment Variables

Update `.env.example`:

```bash
# Database
DATABASE_URL=file:./markitup.db

# Authentication
JWT_SECRET=your-jwt-secret-key-at-least-32-characters-long
ENCRYPTION_KEY=your-encryption-key-exactly-32-bytes

# Email (for verification/reset)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
FROM_EMAIL=noreply@markitup.app

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ✅ Summary of Changes

### Database Layer
- ✅ 5 new tables: users, sessions, oauth_accounts, verification_tokens, password_reset_tokens
- ✅ 3 new tables: user_preferences, user_api_keys, usage_metrics
- ✅ Update all existing tables with `userId` foreign key
- ✅ Add indexes for user-scoped queries

### Backend Services
- ✅ AuthService for registration, login, session management
- ✅ JWT token generation/verification
- ✅ Encryption utilities for API keys
- ✅ Usage tracking system
- ✅ Quota enforcement system

### API Routes
- ✅ Authentication middleware for all protected routes
- ✅ Update file operations to scope by userId
- ✅ Add ownership checks
- ✅ Quota checks before operations

### File Storage
- ✅ User-specific directories (`/markdown/user_{id}/`)
- ✅ Storage usage calculation
- ✅ User isolation in file operations

### Frontend
- ✅ Login/Signup forms
- ✅ Session token management
- ✅ Protected route handling
- ✅ User dashboard components

---

## 📝 Migration Plan

**Phase 1: Database (Week 1)**
1. Add new user-related tables
2. Create migration script
3. Test locally with sample data

**Phase 2: Authentication (Week 2)**
4. Implement AuthService
5. Create auth API routes
6. Build login/signup UI
7. Test registration flow

**Phase 3: Multi-Tenancy (Week 3)**
8. Update existing tables with userId
9. Modify fileService for user directories
10. Update all API routes with auth middleware
11. Test data isolation

**Phase 4: Features (Week 4)**
12. Implement usage tracking
13. Add quota enforcement
14. Build user dashboard
15. Test complete flow

---

## 🎯 Next Steps

1. Review this document and provide feedback
2. Decide on authentication strategy (JWT vs NextAuth.js)
3. Set up development database with new schema
4. Begin Phase 1 implementation

Would you like me to start implementing any specific section?
