/**
 * Search Result Highlighting Utility
 *
 * Provides enhanced highlighting for search results with support for:
 * - Keyword match highlighting
 * - Semantic similarity highlighting
 * - Context extraction
 * - Different highlight styles for different match types
 */

import React from 'react';
import { SearchMatch } from '@/lib/types';

export interface HighlightOptions {
  theme?: 'light' | 'dark';
  highlightColor?: string;
  semanticHighlightColor?: string;
  contextLength?: number;
  showLineNumbers?: boolean;
}

export interface EnhancedSearchMatch extends SearchMatch {
  type?: 'keyword' | 'semantic';
  similarity?: number; // For semantic matches
}

/**
 * Highlight matches in text with different colors for keyword vs semantic
 */
export function highlightText(
  text: string,
  matches: EnhancedSearchMatch[],
  options: HighlightOptions = {}
): React.ReactNode {
  const { theme = 'light', highlightColor, semanticHighlightColor } = options;

  if (!matches || matches.length === 0) {
    return <span>{text}</span>;
  }

  // Sort matches by start position
  const sortedMatches = [...matches].sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedMatches.forEach((match, index) => {
    // Prevent overlapping matches
    if (match.start < lastIndex) {
      return;
    }

    // Add text before match
    if (match.start > lastIndex) {
      parts.push(<span key={`text-${index}`}>{text.slice(lastIndex, match.start)}</span>);
    }

    // Determine highlight style based on match type
    const isSemantic = match.type === 'semantic';

    // Calculate colors
    const bgColor = isSemantic
      ? semanticHighlightColor || (theme === 'dark' ? '#7c3aed' : '#ddd6fe')
      : highlightColor || (theme === 'dark' ? '#ca8a04' : '#fef08a');

    const textColor = theme === 'dark' ? '#ffffff' : '#000000';

    // Add highlighted match
    parts.push(
      <mark
        key={`match-${index}`}
        className={`px-1 py-0.5 rounded ${isSemantic ? 'font-medium' : 'font-normal'}`}
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
        title={
          isSemantic
            ? `Semantic match (${Math.round((match.similarity || 0) * 100)}% similar)`
            : 'Keyword match'
        }
      >
        {match.text}
      </mark>
    );

    lastIndex = match.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
}

/**
 * Extract context around a match with configurable length
 */
export function extractContext(
  fullText: string,
  match: SearchMatch,
  contextLength: number = 100
): string {
  const startContext = Math.max(0, match.start - contextLength);
  const endContext = Math.min(fullText.length, match.end + contextLength);

  let context = fullText.slice(startContext, endContext);

  // Add ellipsis if truncated
  if (startContext > 0) {
    context = '...' + context;
  }
  if (endContext < fullText.length) {
    context = context + '...';
  }

  return context.trim();
}

/**
 * Group matches by line for better display
 */
export function groupMatchesByLine(matches: SearchMatch[]): Map<number, SearchMatch[]> {
  const grouped = new Map<number, SearchMatch[]>();

  matches.forEach(match => {
    const existing = grouped.get(match.lineNumber) || [];
    existing.push(match);
    grouped.set(match.lineNumber, existing);
  });

  return grouped;
}

/**
 * Generate snippet with context for a search result
 */
export function generateSnippet(
  content: string,
  matches: SearchMatch[],
  maxLength: number = 200
): string {
  if (matches.length === 0) {
    return content.slice(0, maxLength) + (content.length > maxLength ? '...' : '');
  }

  // Use the first match to extract context
  const firstMatch = matches[0];
  const start = Math.max(0, firstMatch.start - 50);
  const end = Math.min(content.length, firstMatch.end + 150);

  let snippet = content.slice(start, end);

  // Add ellipsis
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  return snippet.trim();
}

/**
 * Calculate a relevance score based on match positions and types
 */
export function calculateRelevanceScore(
  matches: EnhancedSearchMatch[],
  totalLength: number
): number {
  if (matches.length === 0) return 0;

  let score = 0;

  matches.forEach(match => {
    // Base score for having a match
    score += 10;

    // Bonus for keyword matches (more precise)
    if (match.type === 'keyword') {
      score += 5;
    }

    // Bonus for semantic matches based on similarity
    if (match.type === 'semantic' && match.similarity) {
      score += match.similarity * 10;
    }

    // Bonus for matches earlier in the document
    const positionFactor = 1 - match.start / totalLength;
    score += positionFactor * 5;
  });

  return Math.round(score);
}

/**
 * Format match count text
 */
export function formatMatchCount(count: number, type?: 'keyword' | 'semantic'): string {
  if (count === 0) return 'No matches';
  if (count === 1) {
    if (type === 'semantic') return '1 semantic match';
    if (type === 'keyword') return '1 keyword match';
    return '1 match';
  }
  if (type === 'semantic') return `${count} semantic matches`;
  if (type === 'keyword') return `${count} keyword matches`;
  return `${count} matches`;
}

/**
 * Get highlight color based on match type and theme
 */
export function getHighlightColor(
  matchType: 'keyword' | 'semantic' | undefined,
  theme: 'light' | 'dark' = 'light'
): { background: string; text: string; border: string } {
  if (matchType === 'semantic') {
    return theme === 'dark'
      ? {
          background: '#7c3aed',
          text: '#ffffff',
          border: '#a78bfa',
        }
      : {
          background: '#ddd6fe',
          text: '#000000',
          border: '#a78bfa',
        };
  }

  // Keyword or default
  return theme === 'dark'
    ? {
        background: '#ca8a04',
        text: '#ffffff',
        border: '#facc15',
      }
    : {
        background: '#fef08a',
        text: '#000000',
        border: '#facc15',
      };
}

/**
 * Render a search result snippet with enhanced highlighting
 */
export interface SearchResultSnippetProps {
  content: string;
  matches: EnhancedSearchMatch[];
  theme?: 'light' | 'dark';
  maxLength?: number;
  showLineNumbers?: boolean;
  className?: string;
}

export function SearchResultSnippet({
  content,
  matches,
  theme = 'light',
  maxLength = 200,
  showLineNumbers = true,
  className = '',
}: SearchResultSnippetProps): React.ReactElement {
  const snippet = generateSnippet(content, matches, maxLength);
  const groupedMatches = groupMatchesByLine(matches);

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from(groupedMatches.entries())
        .slice(0, 3) // Show max 3 line groups
        .map(([lineNumber, lineMatches]) => {
          const context = lineMatches[0].context || snippet;

          return (
            <div
              key={lineNumber}
              className={`text-sm font-mono rounded border-l-2 p-2 ${
                theme === 'dark' ? 'bg-gray-800 border-purple-500' : 'bg-gray-50 border-purple-400'
              }`}
            >
              {showLineNumbers && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Line {lineNumber}
                </div>
              )}
              <div className="text-gray-900 dark:text-gray-100">
                {highlightText(context, lineMatches, { theme })}
              </div>
            </div>
          );
        })}

      {groupedMatches.size > 3 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          +{groupedMatches.size - 3} more locations
        </div>
      )}
    </div>
  );
}

const searchHighlightUtils = {
  highlightText,
  extractContext,
  groupMatchesByLine,
  generateSnippet,
  calculateRelevanceScore,
  formatMatchCount,
  getHighlightColor,
  SearchResultSnippet,
};

export default searchHighlightUtils;
