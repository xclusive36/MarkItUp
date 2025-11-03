/**
 * Cache Module
 *
 * High-performance caching utilities for MarkItUp
 */

export { LRUCache, hashContent, type CacheEntry, type CacheStats } from './lru-cache';
export {
  MarkdownCache,
  getMarkdownCache,
  resetMarkdownCache,
  type ParsedMarkdown,
  type MarkdownCacheOptions,
} from './markdown-cache';
