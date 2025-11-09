/**
 * Usage Tracking System
 * Track user activity for quota enforcement and analytics
 */

import { getDatabase } from '@/lib/db';
import { users, usageMetrics } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { dbLogger } from '@/lib/logger';

export type UsageType =
  | 'note_created'
  | 'note_updated'
  | 'note_deleted'
  | 'ai_request'
  | 'search_query'
  | 'collaboration_minute';

/**
 * Track a usage event for a user
 */
export async function trackUsage(
  userId: string,
  type: UsageType,
  amount: number = 1
): Promise<void> {
  const db = getDatabase();
  const today: string = new Date().toISOString().split('T')[0]!; // YYYY-MM-DD

  try {
    // Get or create today's metrics
    const existing = await db.query.usageMetrics.findFirst({
      where: and(eq(usageMetrics.userId, userId), eq(usageMetrics.date, today)),
    });

    if (existing) {
      // Update existing metrics
      const updates: Partial<typeof usageMetrics.$inferInsert> = {};

      switch (type) {
        case 'note_created':
          updates.notesCreated = existing.notesCreated + amount;
          break;
        case 'note_updated':
          updates.notesUpdated = existing.notesUpdated + amount;
          break;
        case 'note_deleted':
          updates.notesDeleted = existing.notesDeleted + amount;
          break;
        case 'ai_request':
          updates.aiRequests = existing.aiRequests + amount;
          break;
        case 'search_query':
          updates.searchQueries = existing.searchQueries + amount;
          break;
        case 'collaboration_minute':
          updates.collaborationMinutes = existing.collaborationMinutes + amount;
          break;
      }

      await db.update(usageMetrics).set(updates).where(eq(usageMetrics.id, existing.id));
    } else {
      // Create new metrics record
      const newMetrics: typeof usageMetrics.$inferInsert = {
        userId,
        date: today as string, // Explicitly cast to string
        notesCreated: type === 'note_created' ? amount : 0,
        notesUpdated: type === 'note_updated' ? amount : 0,
        notesDeleted: type === 'note_deleted' ? amount : 0,
        aiRequests: type === 'ai_request' ? amount : 0,
        searchQueries: type === 'search_query' ? amount : 0,
        collaborationMinutes: type === 'collaboration_minute' ? amount : 0,
        storageUsed: 0,
      };

      await db.insert(usageMetrics).values(newMetrics);
    }

    dbLogger.debug('Usage tracked', { userId, type, amount });
  } catch (error) {
    // Don't fail the request if tracking fails
    dbLogger.error('Failed to track usage', { userId, type, amount }, error as Error);
  }
}

/**
 * Update user's storage usage in bytes
 */
export async function updateStorageUsage(userId: string, bytes: number): Promise<void> {
  const db = getDatabase();

  try {
    await db.update(users).set({ storageUsed: bytes }).where(eq(users.id, userId));

    // Also update today's metrics
    const today: string = new Date().toISOString().split('T')[0]!; // YYYY-MM-DD
    const existing = await db.query.usageMetrics.findFirst({
      where: and(eq(usageMetrics.userId, userId), eq(usageMetrics.date, today)),
    });

    if (existing) {
      await db
        .update(usageMetrics)
        .set({ storageUsed: bytes })
        .where(eq(usageMetrics.id, existing.id));
    }

    dbLogger.debug('Storage usage updated', { userId, bytes });
  } catch (error) {
    dbLogger.error('Failed to update storage usage', { userId, bytes }, error as Error);
  }
}

/**
 * Get user's usage stats for today
 */
export async function getTodayUsage(userId: string) {
  const db = getDatabase();
  const today: string = new Date().toISOString().split('T')[0]!; // YYYY-MM-DD

  try {
    const metrics = await db.query.usageMetrics.findFirst({
      where: and(eq(usageMetrics.userId, userId), eq(usageMetrics.date, today)),
    });

    if (!metrics) {
      return {
        notesCreated: 0,
        notesUpdated: 0,
        notesDeleted: 0,
        aiRequests: 0,
        searchQueries: 0,
        collaborationMinutes: 0,
        storageUsed: 0,
      };
    }

    return {
      notesCreated: metrics.notesCreated,
      notesUpdated: metrics.notesUpdated,
      notesDeleted: metrics.notesDeleted,
      aiRequests: metrics.aiRequests,
      searchQueries: metrics.searchQueries,
      collaborationMinutes: metrics.collaborationMinutes,
      storageUsed: metrics.storageUsed,
    };
  } catch (error) {
    dbLogger.error('Failed to get today usage', { userId }, error as Error);
    return {
      notesCreated: 0,
      notesUpdated: 0,
      notesDeleted: 0,
      aiRequests: 0,
      searchQueries: 0,
      collaborationMinutes: 0,
      storageUsed: 0,
    };
  }
}
