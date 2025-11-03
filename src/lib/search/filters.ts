/**
 * Search Filters
 *
 * Provides filtering capabilities for search results by date, tags, metadata, etc.
 */

export interface DateRange {
  start?: Date;
  end?: Date;
}

export interface SearchFilters {
  dateCreated?: DateRange;
  dateModified?: DateRange;
  tags?: string[];
  excludeTags?: string[];
  wordCount?: { min?: number; max?: number };
  hasLinks?: boolean;
  hasBacklinks?: boolean;
  folder?: string;
  fileType?: string;
}

export interface FilterableItem {
  fileName?: string;
  title?: string;
  content: string;
  metadata?: {
    created?: Date | string;
    modified?: Date | string;
    tags?: string[];
    wordCount?: number;
    linkCount?: number;
    backlinkCount?: number;
    folder?: string;
  };
}

/**
 * Apply all filters to a list of items
 */
export function applyFilters<T extends FilterableItem>(items: T[], filters: SearchFilters): T[] {
  return items.filter(item => {
    // Date created filter
    if (filters.dateCreated) {
      const created = parseDate(item.metadata?.created);
      if (!created) return false;

      if (filters.dateCreated.start && created < filters.dateCreated.start) {
        return false;
      }
      if (filters.dateCreated.end && created > filters.dateCreated.end) {
        return false;
      }
    }

    // Date modified filter
    if (filters.dateModified) {
      const modified = parseDate(item.metadata?.modified);
      if (!modified) return false;

      if (filters.dateModified.start && modified < filters.dateModified.start) {
        return false;
      }
      if (filters.dateModified.end && modified > filters.dateModified.end) {
        return false;
      }
    }

    // Tags filter (must have all specified tags)
    if (filters.tags && filters.tags.length > 0) {
      const itemTags = item.metadata?.tags || [];
      if (!filters.tags.every(tag => itemTags.includes(tag))) {
        return false;
      }
    }

    // Exclude tags filter (must not have any of these tags)
    if (filters.excludeTags && filters.excludeTags.length > 0) {
      const itemTags = item.metadata?.tags || [];
      if (filters.excludeTags.some(tag => itemTags.includes(tag))) {
        return false;
      }
    }

    // Word count filter
    if (filters.wordCount) {
      const wordCount = item.metadata?.wordCount || countWords(item.content);

      if (filters.wordCount.min !== undefined && wordCount < filters.wordCount.min) {
        return false;
      }
      if (filters.wordCount.max !== undefined && wordCount > filters.wordCount.max) {
        return false;
      }
    }

    // Has links filter
    if (filters.hasLinks !== undefined) {
      const linkCount = item.metadata?.linkCount || countLinks(item.content);
      if (filters.hasLinks && linkCount === 0) return false;
      if (!filters.hasLinks && linkCount > 0) return false;
    }

    // Has backlinks filter
    if (filters.hasBacklinks !== undefined) {
      const backlinkCount = item.metadata?.backlinkCount || 0;
      if (filters.hasBacklinks && backlinkCount === 0) return false;
      if (!filters.hasBacklinks && backlinkCount > 0) return false;
    }

    // Folder filter
    if (filters.folder) {
      const itemFolder = item.metadata?.folder || extractFolder(item.fileName || '');
      if (itemFolder !== filters.folder) return false;
    }

    // File type filter
    if (filters.fileType) {
      const fileName = item.fileName || '';
      if (!fileName.endsWith(filters.fileType)) return false;
    }

    return true;
  });
}

/**
 * Parse date from various formats
 */
function parseDate(date: Date | string | undefined): Date | null {
  if (!date) return null;
  if (date instanceof Date) return date;

  try {
    return new Date(date);
  } catch {
    return null;
  }
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;
}

/**
 * Count wikilinks in text
 */
function countLinks(text: string): number {
  const wikilinkPattern = /\[\[([^\]]+)\]\]/g;
  const matches = text.match(wikilinkPattern);
  return matches ? matches.length : 0;
}

/**
 * Extract folder from file path
 */
function extractFolder(filePath: string): string {
  const parts = filePath.split('/');
  return parts.length > 1 ? parts[0] : '';
}

/**
 * Parse filter from search query string
 * Supports syntax like: query tag:javascript date:2024-01-01..2024-12-31 words:100..1000
 */
export function parseFilterQuery(query: string): { query: string; filters: SearchFilters } {
  let cleanQuery = query;
  const filters: SearchFilters = {};

  // Tag filter: tag:tagname or tag:tag1,tag2
  const tagMatch = query.match(/tag:([^\s]+)/);
  if (tagMatch) {
    filters.tags = tagMatch[1].split(',');
    cleanQuery = cleanQuery.replace(tagMatch[0], '').trim();
  }

  // Exclude tag: -tag:tagname
  const excludeTagMatch = query.match(/-tag:([^\s]+)/);
  if (excludeTagMatch) {
    filters.excludeTags = excludeTagMatch[1].split(',');
    cleanQuery = cleanQuery.replace(excludeTagMatch[0], '').trim();
  }

  // Date created: created:YYYY-MM-DD or created:YYYY-MM-DD..YYYY-MM-DD
  const createdMatch = query.match(/created:([^\s]+)/);
  if (createdMatch) {
    filters.dateCreated = parseDateRange(createdMatch[1]);
    cleanQuery = cleanQuery.replace(createdMatch[0], '').trim();
  }

  // Date modified: modified:YYYY-MM-DD or modified:YYYY-MM-DD..YYYY-MM-DD
  const modifiedMatch = query.match(/modified:([^\s]+)/);
  if (modifiedMatch) {
    filters.dateModified = parseDateRange(modifiedMatch[1]);
    cleanQuery = cleanQuery.replace(modifiedMatch[0], '').trim();
  }

  // Word count: words:100 or words:100..1000
  const wordsMatch = query.match(/words:([^\s]+)/);
  if (wordsMatch) {
    filters.wordCount = parseNumberRange(wordsMatch[1]);
    cleanQuery = cleanQuery.replace(wordsMatch[0], '').trim();
  }

  // Has links: haslinks:true or haslinks:false
  const hasLinksMatch = query.match(/haslinks:(true|false)/);
  if (hasLinksMatch) {
    filters.hasLinks = hasLinksMatch[1] === 'true';
    cleanQuery = cleanQuery.replace(hasLinksMatch[0], '').trim();
  }

  // Has backlinks: hasbacklinks:true or hasbacklinks:false
  const hasBacklinksMatch = query.match(/hasbacklinks:(true|false)/);
  if (hasBacklinksMatch) {
    filters.hasBacklinks = hasBacklinksMatch[1] === 'true';
    cleanQuery = cleanQuery.replace(hasBacklinksMatch[0], '').trim();
  }

  // Folder: folder:foldername
  const folderMatch = query.match(/folder:([^\s]+)/);
  if (folderMatch) {
    filters.folder = folderMatch[1];
    cleanQuery = cleanQuery.replace(folderMatch[0], '').trim();
  }

  return { query: cleanQuery, filters };
}

/**
 * Parse date range from string (YYYY-MM-DD or YYYY-MM-DD..YYYY-MM-DD)
 */
function parseDateRange(rangeStr: string): DateRange {
  if (rangeStr.includes('..')) {
    const [start, end] = rangeStr.split('..');
    return {
      start: start ? new Date(start) : undefined,
      end: end ? new Date(end) : undefined,
    };
  }

  // Single date means "on this day"
  const date = new Date(rangeStr);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  return { start: date, end: nextDay };
}

/**
 * Parse number range from string (100 or 100..1000)
 */
function parseNumberRange(rangeStr: string): { min?: number; max?: number } {
  if (rangeStr.includes('..')) {
    const [min, max] = rangeStr.split('..').map(Number);
    return { min, max };
  }

  // Single number means exact count
  const num = Number(rangeStr);
  return { min: num, max: num };
}

/**
 * Build human-readable description of active filters
 */
export function describeFilters(filters: SearchFilters): string[] {
  const descriptions: string[] = [];

  if (filters.tags && filters.tags.length > 0) {
    descriptions.push(`Tagged: ${filters.tags.join(', ')}`);
  }

  if (filters.excludeTags && filters.excludeTags.length > 0) {
    descriptions.push(`Not tagged: ${filters.excludeTags.join(', ')}`);
  }

  if (filters.dateCreated) {
    descriptions.push(`Created: ${formatDateRange(filters.dateCreated)}`);
  }

  if (filters.dateModified) {
    descriptions.push(`Modified: ${formatDateRange(filters.dateModified)}`);
  }

  if (filters.wordCount) {
    const { min, max } = filters.wordCount;
    if (min && max && min === max) {
      descriptions.push(`Exactly ${min} words`);
    } else if (min && max) {
      descriptions.push(`${min}-${max} words`);
    } else if (min) {
      descriptions.push(`At least ${min} words`);
    } else if (max) {
      descriptions.push(`At most ${max} words`);
    }
  }

  if (filters.hasLinks !== undefined) {
    descriptions.push(filters.hasLinks ? 'Has links' : 'No links');
  }

  if (filters.hasBacklinks !== undefined) {
    descriptions.push(filters.hasBacklinks ? 'Has backlinks' : 'No backlinks');
  }

  if (filters.folder) {
    descriptions.push(`Folder: ${filters.folder}`);
  }

  return descriptions;
}

/**
 * Format date range for display
 */
function formatDateRange(range: DateRange): string {
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  if (range.start && range.end) {
    return `${formatDate(range.start)} to ${formatDate(range.end)}`;
  } else if (range.start) {
    return `after ${formatDate(range.start)}`;
  } else if (range.end) {
    return `before ${formatDate(range.end)}`;
  }

  return '';
}
