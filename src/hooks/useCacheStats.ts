/**
 * Cache Statistics Hook
 *
 * React hook to monitor markdown cache performance.
 */

'use client';

import { useState, useEffect } from 'react';
import { getMarkdownCache } from '@/lib/cache';
import type { CacheStats } from '@/lib/cache';

export interface CachePerformance extends CacheStats {
  avgHitTime?: number;
  avgMissTime?: number;
  memorySaved?: string;
}

/**
 * Hook to get cache statistics
 */
export function useCacheStats(refreshInterval = 5000): CachePerformance | null {
  const [stats, setStats] = useState<CachePerformance | null>(null);

  useEffect(() => {
    const updateStats = () => {
      try {
        const cache = getMarkdownCache();
        const cacheStats = cache.getStats();

        setStats({
          ...cacheStats,
          // Could add more metrics here
        });
      } catch (error) {
        console.error('Failed to get cache stats:', error);
      }
    };

    // Initial update
    updateStats();

    // Set up interval
    const interval = setInterval(updateStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return stats;
}

/**
 * Format cache stats for display
 */
export function formatCacheStats(stats: CacheStats): string {
  const { size, maxSize, hits, misses, hitRate, evictions } = stats;
  const total = hits + misses;

  return `
Cache Statistics:
  Size: ${size}/${maxSize} entries
  Hits: ${hits} (${(hitRate * 100).toFixed(1)}%)
  Misses: ${misses}
  Total Requests: ${total}
  Evictions: ${evictions}
  `.trim();
}

/**
 * Log cache stats to console (development only)
 */
export function logCacheStats(): void {
  if (process.env.NODE_ENV !== 'development') return;

  try {
    const cache = getMarkdownCache();
    const stats = cache.getStats();
    console.log(formatCacheStats(stats));
  } catch (error) {
    console.error('Failed to log cache stats:', error);
  }
}

/**
 * Expose global cache inspection function (development only)
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__cacheReport = () => {
    const cache = getMarkdownCache();
    const stats = cache.getStats();
    console.log('%c📊 Markdown Cache Report', 'font-size: 16px; font-weight: bold;');
    console.log(formatCacheStats(stats));
    return stats;
  };

  (window as any).__clearCache = async () => {
    const cache = getMarkdownCache();
    await cache.clear();
    console.log('✅ Cache cleared');
  };
}
