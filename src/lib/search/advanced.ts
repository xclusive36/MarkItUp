/**
 * Advanced Search API
 *
 * Combines fuzzy search, boolean operators, and filters into a unified search system.
 */

import { fuzzyMatch, rankResults, SearchResult } from './fuzzy';
import { booleanSearch } from './boolean';
import { applyFilters, parseFilterQuery, SearchFilters, FilterableItem } from './filters';

export interface AdvancedSearchOptions {
  query: string;
  filters?: SearchFilters;
  fuzzy?: boolean;
  fuzzyThreshold?: number;
  boolean?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResultWithMetadata extends SearchResult {
  fileName?: string;
  metadata?: {
    created?: Date | string;
    modified?: Date | string;
    tags?: string[];
    wordCount?: number;
    linkCount?: number;
    backlinkCount?: number;
    folder?: string;
  };
  matchType?: 'exact' | 'fuzzy' | 'boolean';
  highlights?: string[];
}

/**
 * Main advanced search function
 */
export async function advancedSearch<T extends FilterableItem>(
  items: T[],
  options: AdvancedSearchOptions
): Promise<SearchResultWithMetadata[]> {
  // Parse filter syntax from query
  const { query, filters: parsedFilters } = parseFilterQuery(options.query);

  // Merge parsed filters with provided filters
  const finalFilters: SearchFilters = {
    ...parsedFilters,
    ...options.filters,
  };

  // Apply filters first to reduce search space
  const filtered = applyFilters(items, finalFilters);

  // Convert to search results format
  let results: SearchResultWithMetadata[] = filtered.map(item => ({
    id: item.fileName || '',
    title: item.title || item.fileName || '',
    content: item.content,
    fileName: item.fileName,
    metadata: item.metadata,
  }));

  // If no query, return filtered results
  if (!query.trim()) {
    return paginateResults(results, options.limit, options.offset);
  }

  // Apply search based on mode
  if (options.boolean) {
    // Boolean search mode
    results = results.filter(item => {
      const searchText = `${item.title} ${item.content}`;
      return booleanSearch(query, searchText);
    });

    results.forEach(r => {
      r.matchType = 'boolean';
    });
  } else if (options.fuzzy) {
    // Fuzzy search mode
    const threshold = options.fuzzyThreshold || 0.7;

    results = results.filter(item => {
      const titleMatch = fuzzyMatch(item.title, query, threshold);
      const contentMatch = fuzzyMatch(item.content, query, threshold);
      return titleMatch || contentMatch;
    });

    results.forEach(r => {
      r.matchType = 'fuzzy';
    });

    // Rank results by relevance
    results = rankResults(results, query);
  } else {
    // Exact search mode (default)
    const queryLower = query.toLowerCase();

    results = results.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(queryLower);
      const contentMatch = item.content.toLowerCase().includes(queryLower);
      return titleMatch || contentMatch;
    });

    results.forEach(r => {
      r.matchType = 'exact';
    });

    // Simple ranking (title matches first)
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(queryLower);
      const bTitle = b.title.toLowerCase().includes(queryLower);
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      return 0;
    });
  }

  return paginateResults(results, options.limit, options.offset);
}

/**
 * Search with auto-detection of search mode
 */
export async function smartSearch<T extends FilterableItem>(
  items: T[],
  query: string,
  filters?: SearchFilters
): Promise<SearchResultWithMetadata[]> {
  // Detect if query uses boolean operators
  const hasBoolean = /\b(AND|OR|NOT)\b/.test(query);

  // Detect if query uses filter syntax
  const hasFilters = /(tag|created|modified|words|folder|haslinks|hasbacklinks):/.test(query);

  return advancedSearch(items, {
    query,
    filters,
    boolean: hasBoolean,
    fuzzy: false, // Enable fuzzy as fallback if no results
  });
}

/**
 * Paginate results
 */
function paginateResults(
  results: SearchResultWithMetadata[],
  limit?: number,
  offset?: number
): SearchResultWithMetadata[] {
  if (!limit) return results;

  const start = offset || 0;
  return results.slice(start, start + limit);
}

/**
 * Get search suggestions based on query
 */
export function getSearchSuggestions<T extends FilterableItem>(
  items: T[],
  query: string,
  limit = 5
): string[] {
  const queryLower = query.toLowerCase();
  const suggestions = new Set<string>();

  // Suggest titles that start with or contain the query
  for (const item of items) {
    const title = item.title || item.fileName || '';
    const titleLower = title.toLowerCase();

    if (titleLower.startsWith(queryLower)) {
      suggestions.add(title);
    } else if (titleLower.includes(queryLower)) {
      suggestions.add(title);
    }

    if (suggestions.size >= limit) break;
  }

  // Suggest tags
  const allTags = new Set<string>();
  for (const item of items) {
    item.metadata?.tags?.forEach(tag => allTags.add(tag));
  }

  Array.from(allTags)
    .filter(tag => tag.toLowerCase().includes(queryLower))
    .slice(0, limit - suggestions.size)
    .forEach(tag => suggestions.add(`tag:${tag}`));

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Build search query from components
 */
export function buildQuery(options: {
  terms?: string[];
  phrases?: string[];
  tags?: string[];
  dateRange?: { start?: string; end?: string };
  operator?: 'AND' | 'OR';
}): string {
  const parts: string[] = [];

  // Add terms with operator
  if (options.terms && options.terms.length > 0) {
    const operator = options.operator || 'AND';
    parts.push(options.terms.join(` ${operator} `));
  }

  // Add phrases
  if (options.phrases && options.phrases.length > 0) {
    parts.push(...options.phrases.map(p => `"${p}"`));
  }

  // Add tags
  if (options.tags && options.tags.length > 0) {
    parts.push(`tag:${options.tags.join(',')}`);
  }

  // Add date range
  if (options.dateRange) {
    const { start, end } = options.dateRange;
    if (start && end) {
      parts.push(`modified:${start}..${end}`);
    } else if (start) {
      parts.push(`modified:${start}`);
    }
  }

  return parts.join(' ');
}
