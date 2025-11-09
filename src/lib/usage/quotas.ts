/**
 * Quota Enforcement System
 * Check and enforce user quotas based on their plan
 */

import { getDatabase } from '@/lib/db';
import { users, notes } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getTodayUsage } from './tracker';
import { dbLogger } from '@/lib/logger';

export type QuotaType = 'notes' | 'storage' | 'ai_requests';

export interface QuotaCheckResult {
  allowed: boolean;
  message?: string;
  current?: number;
  limit?: number;
  remaining?: number;
}

// Development bypass - same as in auth middleware
const DISABLE_AUTH_DEV = process.env.DISABLE_AUTH === 'true';
const DEV_USER_ID = 'dev-user-00000000-0000-0000-0000-000000000000';

/**
 * Check if user has quota available for an operation
 */
export async function checkQuota(userId: string, type: QuotaType): Promise<QuotaCheckResult> {
  // Bypass quota checks for development user when auth is disabled
  if (DISABLE_AUTH_DEV && userId === DEV_USER_ID) {
    return {
      allowed: true,
      current: 0,
      limit: 999999,
      remaining: 999999,
    };
  }

  const db = getDatabase();

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return {
        allowed: false,
        message: 'User not found',
      };
    }

    if (type === 'notes') {
      // Count user's notes
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(notes)
        .where(eq(notes.userId, userId));

      const current = Number(result[0]?.count || 0);
      const limit = user.notesQuota;

      if (current >= limit) {
        return {
          allowed: false,
          message: `Note limit reached (${limit} notes). Upgrade your plan for more.`,
          current,
          limit,
          remaining: 0,
        };
      }

      return {
        allowed: true,
        current,
        limit,
        remaining: limit - current,
      };
    }

    if (type === 'storage') {
      const current = user.storageUsed;
      const limit = user.storageQuota;

      if (current >= limit) {
        return {
          allowed: false,
          message: 'Storage quota exceeded. Upgrade your plan for more storage.',
          current,
          limit,
          remaining: 0,
        };
      }

      return {
        allowed: true,
        current,
        limit,
        remaining: limit - current,
      };
    }

    if (type === 'ai_requests') {
      const todayUsage = await getTodayUsage(userId);
      const current = todayUsage.aiRequests;
      const limit = user.aiRequestsQuota;

      if (current >= limit) {
        return {
          allowed: false,
          message:
            'Daily AI request limit reached. Upgrade for more requests or try again tomorrow.',
          current,
          limit,
          remaining: 0,
        };
      }

      return {
        allowed: true,
        current,
        limit,
        remaining: limit - current,
      };
    }

    return { allowed: true };
  } catch (error) {
    dbLogger.error('Failed to check quota', { userId, type }, error as Error);
    // Allow operation if quota check fails (fail open for better UX)
    return { allowed: true };
  }
}

/**
 * Get all quota statuses for a user
 */
export async function getAllQuotas(userId: string) {
  const [notesQuota, storageQuota, aiRequestsQuota] = await Promise.all([
    checkQuota(userId, 'notes'),
    checkQuota(userId, 'storage'),
    checkQuota(userId, 'ai_requests'),
  ]);

  return {
    notes: notesQuota,
    storage: storageQuota,
    aiRequests: aiRequestsQuota,
  };
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
