/**
 * Markdown Cache
 *
 * High-performance caching layer for parsed markdown content.
 * Uses LRU cache + IndexedDB for persistence across sessions.
 */

import { LRUCache, hashContent } from './lru-cache';

export interface ParsedMarkdown {
  html: string;
  ast?: unknown; // AST structure (if available from parser)
  metadata?: {
    headings?: Array<{ level: number; text: string; id: string }>;
    links?: string[];
    images?: string[];
    codeBlocks?: number;
  };
}

export interface MarkdownCacheOptions {
  maxSize?: number;
  persistToIndexedDB?: boolean;
  dbName?: string;
  storeName?: string;
}

const DEFAULT_OPTIONS: Required<MarkdownCacheOptions> = {
  maxSize: 200,
  persistToIndexedDB: true,
  dbName: 'markitup_cache',
  storeName: 'markdown',
};

export class MarkdownCache {
  public cache: LRUCache<ParsedMarkdown>; // Make cache public for sync access
  private options: Required<MarkdownCacheOptions>;
  private db: IDBDatabase | null = null;
  private dbReady = false;

  constructor(options: MarkdownCacheOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.cache = new LRUCache<ParsedMarkdown>(this.options.maxSize);

    if (this.options.persistToIndexedDB && typeof window !== 'undefined') {
      this.initIndexedDB();
    }
  }

  /**
   * Get parsed markdown from cache
   */
  async get(content: string): Promise<ParsedMarkdown | undefined> {
    const key = hashContent(content);

    // Try memory cache first
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    // Try IndexedDB if enabled
    if (this.options.persistToIndexedDB && this.dbReady) {
      try {
        const stored = await this.getFromIndexedDB(key);
        if (stored) {
          // Restore to memory cache
          this.cache.set(key, stored);
          return stored;
        }
      } catch (error) {
        console.warn('Failed to get from IndexedDB:', error);
      }
    }

    return undefined;
  }

  /**
   * Store parsed markdown in cache
   */
  async set(content: string, parsed: ParsedMarkdown): Promise<void> {
    const key = hashContent(content);

    // Store in memory cache
    this.cache.set(key, parsed);

    // Store in IndexedDB if enabled
    if (this.options.persistToIndexedDB && this.dbReady) {
      try {
        await this.setInIndexedDB(key, parsed);
      } catch (error) {
        console.warn('Failed to set in IndexedDB:', error);
      }
    }
  }

  /**
   * Clear specific entry
   */
  delete(content: string): void {
    const key = hashContent(content);
    this.cache.delete(key);

    if (this.options.persistToIndexedDB && this.dbReady) {
      this.deleteFromIndexedDB(key).catch(err => {
        console.warn('Failed to delete from IndexedDB:', err);
      });
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();

    if (this.options.persistToIndexedDB && this.dbReady) {
      try {
        await this.clearIndexedDB();
      } catch (error) {
        console.warn('Failed to clear IndexedDB:', error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Initialize IndexedDB
   */
  private async initIndexedDB(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.options.dbName, 1);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.dbReady = true;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.options.storeName)) {
          const objectStore = db.createObjectStore(this.options.storeName, {
            keyPath: 'key',
          });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Get from IndexedDB
   */
  private async getFromIndexedDB(key: string): Promise<ParsedMarkdown | undefined> {
    if (!this.db) return undefined;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.options.storeName], 'readonly');
      const store = transaction.objectStore(this.options.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(result.value as ParsedMarkdown);
        } else {
          resolve(undefined);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Set in IndexedDB
   */
  private async setInIndexedDB(key: string, value: ParsedMarkdown): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.options.storeName], 'readwrite');
      const store = transaction.objectStore(this.options.storeName);

      const request = store.put({
        key,
        value,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete from IndexedDB
   */
  private async deleteFromIndexedDB(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.options.storeName], 'readwrite');
      const store = transaction.objectStore(this.options.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear IndexedDB
   */
  private async clearIndexedDB(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.options.storeName], 'readwrite');
      const store = transaction.objectStore(this.options.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Export cache to JSON
   */
  exportCache(): string {
    return JSON.stringify(this.cache.toJSON());
  }

  /**
   * Import cache from JSON
   */
  importCache(json: string): void {
    try {
      const data = JSON.parse(json);
      this.cache.fromJSON(data);
    } catch (error) {
      console.error('Failed to import cache:', error);
    }
  }
}

// Global singleton instance
let globalMarkdownCache: MarkdownCache | null = null;

/**
 * Get global markdown cache instance
 */
export function getMarkdownCache(): MarkdownCache {
  if (!globalMarkdownCache) {
    globalMarkdownCache = new MarkdownCache({
      maxSize: 200,
      persistToIndexedDB: true,
    });
  }
  return globalMarkdownCache;
}

/**
 * Reset global cache (useful for testing)
 */
export function resetMarkdownCache(): void {
  if (globalMarkdownCache) {
    globalMarkdownCache.clear();
  }
  globalMarkdownCache = null;
}
