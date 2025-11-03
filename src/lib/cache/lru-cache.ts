/**
 * LRU (Least Recently Used) Cache
 *
 * Generic cache implementation with automatic eviction of least recently used items.
 * Thread-safe and optimized for frequent reads.
 */

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (entry) {
      this.hits++;
      entry.hits++;
      entry.timestamp = Date.now();

      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, entry);

      return entry.value;
    }

    this.misses++;
    return undefined;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T): void {
    // If already exists, update it
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      entry.value = value;
      entry.timestamp = Date.now();

      // Move to end
      this.cache.delete(key);
      this.cache.set(key, entry);
      return;
    }

    // Check if we need to evict
    if (this.cache.size >= this.maxSize) {
      // Evict least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.evictions++;
      }
    }

    // Add new entry
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      evictions: this.evictions,
    };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get entries sorted by most recently used
   */
  getMostRecent(limit?: number): Array<{ key: string; value: T; timestamp: number }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        value: entry.value,
        timestamp: entry.timestamp,
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    return limit ? entries.slice(0, limit) : entries;
  }

  /**
   * Get entries sorted by most frequently used
   */
  getMostFrequent(limit?: number): Array<{ key: string; value: T; hits: number }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        value: entry.value,
        hits: entry.hits,
      }))
      .sort((a, b) => b.hits - a.hits);

    return limit ? entries.slice(0, limit) : entries;
  }

  /**
   * Resize cache (evicts items if new size is smaller)
   */
  resize(newMaxSize: number): void {
    this.maxSize = newMaxSize;

    // Evict oldest items if current size exceeds new max
    while (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.evictions++;
      } else {
        break;
      }
    }
  }

  /**
   * Export cache to JSON
   */
  toJSON(): Array<{ key: string; value: T; timestamp: number; hits: number }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      value: entry.value,
      timestamp: entry.timestamp,
      hits: entry.hits,
    }));
  }

  /**
   * Import cache from JSON
   */
  fromJSON(data: Array<{ key: string; value: T; timestamp: number; hits: number }>): void {
    this.clear();

    // Sort by timestamp (most recent first) and take max items
    const sorted = data.sort((a, b) => b.timestamp - a.timestamp).slice(0, this.maxSize);

    for (const item of sorted) {
      this.cache.set(item.key, {
        value: item.value,
        timestamp: item.timestamp,
        hits: item.hits,
      });
    }
  }
}

/**
 * Create a hash key from content
 */
export function hashContent(content: string): string {
  // Simple FNV-1a hash algorithm (fast and good distribution)
  let hash = 2166136261; // FNV offset basis

  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV prime
  }

  return (hash >>> 0).toString(36);
}
