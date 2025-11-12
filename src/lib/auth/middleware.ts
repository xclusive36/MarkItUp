/**
 * Authentication Middleware
 * Utilities for protecting API routes and checking user authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from './auth-service';
import { fileService } from '@/lib/services/fileService';
import { getDatabase } from '@/lib/db';
import { notes, links } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { dbLogger } from '@/lib/logger';

// Development bypass - set to true to disable auth temporarily
const DISABLE_AUTH_DEV = process.env.DISABLE_AUTH === 'true';

// CRITICAL: Prevent auth bypass in production
if (process.env.NODE_ENV === 'production' && DISABLE_AUTH_DEV) {
  throw new Error(
    'CRITICAL SECURITY ERROR: DISABLE_AUTH must not be enabled in production. ' +
      'This completely bypasses authentication. Set DISABLE_AUTH=false or remove it.'
  );
}

// Warn in development if auth is disabled
if (DISABLE_AUTH_DEV && process.env.NODE_ENV !== 'test') {
  console.warn(
    '⚠️  WARNING: Authentication is DISABLED. This is for development only. ' +
      'All requests will use a development user with enterprise-level access.'
  );
}

// Default development user (used when auth is disabled)
// Development user ID when auth is disabled
// Empty string signals fileService to use root /markdown directory
// This allows development without database user creation and matches legacy behavior
const DEV_USER_ID = '';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  emailVerified: boolean;
}

export interface AuthResult {
  userId: string;
  user: AuthenticatedUser;
}

/**
 * Require authentication for an API route
 * Returns user info if authenticated, or error response if not
 *
 * Usage:
 * const auth = await requireAuth(request);
 * if (auth instanceof NextResponse) return auth; // Error response
 * const { userId, user } = auth; // Authenticated user
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult | NextResponse> {
  // Development bypass - skip authentication if DISABLE_AUTH=true
  if (DISABLE_AUTH_DEV) {
    dbLogger.warn('⚠️  Authentication bypassed for development (DISABLE_AUTH=true)');
    dbLogger.warn('⚠️  Using root /markdown directory (no user isolation)');
    const authResult = {
      userId: DEV_USER_ID,
      user: {
        id: DEV_USER_ID,
        email: 'dev@localhost',
        name: 'Development User',
        plan: 'enterprise', // Give full access in dev mode
        emailVerified: true,
      },
    };

    return authResult;
  }

  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('session-token')?.value;

    if (!token) {
      dbLogger.warn('Authentication failed: No token provided');
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'No authentication token provided',
          code: 'NO_TOKEN',
        },
        { status: 401 }
      );
    }

    // Verify session
    const authService = getAuthService();
    const session = await authService.verifySession(token);

    if (!session) {
      dbLogger.warn('Authentication failed: Invalid or expired token');
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or expired session',
          code: 'INVALID_SESSION',
        },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!session.user.isActive) {
      dbLogger.warn('Authentication failed: Account disabled', { userId: session.userId });
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Account is disabled',
          code: 'ACCOUNT_DISABLED',
        },
        { status: 403 }
      );
    }

    const authResult = {
      userId: session.userId,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        plan: session.user.plan,
        emailVerified: session.user.isEmailVerified === true,
      },
    };

    // Ensure a markdown directory exists for this user upon successful auth
    try {
      fileService.ensureUserDirExists(authResult.userId);
    } catch (e) {
      dbLogger.warn('Failed to ensure user directory after auth', {
        userId: authResult.userId,
        error: e instanceof Error ? e.message : String(e),
      });
    }

    return authResult;
  } catch (error) {
    dbLogger.error('Auth middleware error', {}, error as Error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Authentication failed',
        code: 'AUTH_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Optional authentication - returns user if authenticated, null if not
 * Does not return error responses
 */
export async function optionalAuth(request: NextRequest): Promise<AuthResult | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('session-token')?.value;

    if (!token) {
      return null;
    }

    const authService = getAuthService();
    const session = await authService.verifySession(token);

    if (!session || !session.user.isActive) {
      return null;
    }

    return {
      userId: session.userId,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        plan: session.user.plan,
        emailVerified: session.user.isEmailVerified === true,
      },
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if user owns a specific note
 */
export async function checkNoteOwnership(userId: string, noteId: string): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);

    return result[0]?.userId === userId;
  } catch (error) {
    dbLogger.error('Error checking note ownership', { userId, noteId }, error as Error);
    return false;
  }
}

/**
 * Check if user owns a specific link
 */
export async function checkLinkOwnership(userId: string, linkId: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.select().from(links).where(eq(links.id, linkId)).limit(1);

    return result[0]?.userId === userId;
  } catch (error) {
    dbLogger.error('Error checking link ownership', { userId, linkId }, error as Error);
    return false;
  }
}

/**
 * Require note ownership - returns error response if user doesn't own the note
 */
export async function requireNoteOwnership(
  userId: string,
  noteId: string
): Promise<true | NextResponse> {
  const owns = await checkNoteOwnership(userId, noteId);

  if (!owns) {
    dbLogger.warn('Access denied: User does not own note', { userId, noteId });
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'You do not have access to this note',
        code: 'NOT_OWNER',
      },
      { status: 403 }
    );
  }

  return true;
}

/**
 * Extract user ID from request (assumes requireAuth was already called)
 * This is a helper for code clarity
 */
export function getUserId(auth: AuthResult): string {
  return auth.userId;
}

/**
 * Get session token from request
 */
export function getSessionToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  return authHeader?.replace('Bearer ', '') || request.cookies.get('session-token')?.value || null;
}
