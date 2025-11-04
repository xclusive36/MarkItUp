/**
 * Fuzzy Search Utilities
 *
 * Provides typo-tolerant search using Levenshtein distance and other algorithms.
 */

/**
 * Calculate Levenshtein distance between two strings
 * (minimum number of single-character edits required to change one word into another)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create 2D array for dynamic programming
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) {
    const row = matrix[i];
    if (row) row[0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    const row = matrix[0];
    if (row) row[j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      const currentRow = matrix[i];
      const prevRow = matrix[i - 1];
      if (!currentRow || !prevRow) continue;

      const deletion = prevRow[j];
      const insertion = currentRow[j - 1];
      const substitution = prevRow[j - 1];

      if (deletion === undefined || insertion === undefined || substitution === undefined) continue;

      currentRow[j] = Math.min(deletion + 1, insertion + 1, substitution + cost);
    }
  }

  const finalRow = matrix[len1];
  if (!finalRow) return 0;
  const result = finalRow[len2];
  return result ?? 0;
}

/**
 * Calculate similarity score between two strings (0-1, higher = more similar)
 */
export function similarityScore(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLen;
}

/**
 * Check if a string fuzzy matches a query with given threshold
 */
export function fuzzyMatch(text: string, query: string, threshold = 0.7): boolean {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match
  if (textLower.includes(queryLower)) return true;

  // Check if any word in text fuzzy matches the query
  const words = textLower.split(/\s+/);
  return words.some(word => {
    const score = similarityScore(word, queryLower);
    return score >= threshold;
  });
}

/**
 * Find all fuzzy matches in a text with their positions and scores
 */
export interface FuzzyMatch {
  text: string;
  startIndex: number;
  endIndex: number;
  score: number;
}

export function findFuzzyMatches(text: string, query: string, threshold = 0.7): FuzzyMatch[] {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const matches: FuzzyMatch[] = [];

  // Split into words with positions
  const wordRegex = /\b\w+\b/g;
  let match;

  while ((match = wordRegex.exec(textLower)) !== null) {
    const word = match[0];
    const score = similarityScore(word, queryLower);

    if (score >= threshold) {
      matches.push({
        text: text.substring(match.index, match.index + word.length),
        startIndex: match.index,
        endIndex: match.index + word.length,
        score,
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}

/**
 * Rank search results by relevance using multiple factors
 */
export interface SearchResult {
  id: string;
  title: string;
  content: string;
  score?: number;
}

export function rankResults(results: SearchResult[], query: string): SearchResult[] {
  const queryLower = query.toLowerCase();

  return results
    .map(result => {
      let score = 0;

      // Title exact match (highest weight)
      if (result.title.toLowerCase().includes(queryLower)) {
        score += 100;
      }

      // Title fuzzy match
      const titleScore = similarityScore(result.title.toLowerCase(), queryLower);
      score += titleScore * 50;

      // Content exact match
      const contentLower = result.content.toLowerCase();
      const exactMatches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length;
      score += exactMatches * 10;

      // Content fuzzy matches
      const fuzzyMatches = findFuzzyMatches(result.content, query, 0.8);
      score += fuzzyMatches.length * 5;

      // Boost for matches near the beginning
      const firstMatch = contentLower.indexOf(queryLower);
      if (firstMatch !== -1) {
        score += Math.max(0, 20 - firstMatch / 10);
      }

      return { ...result, score };
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Highlight matches in text with HTML
 */
export function highlightMatches(
  text: string,
  query: string,
  threshold = 0.7,
  className = 'highlight'
): string {
  const matches = findFuzzyMatches(text, query, threshold);

  if (matches.length === 0) return text;

  // Sort matches by position (reverse order for replacement)
  const sortedMatches = [...matches].sort((a, b) => b.startIndex - a.startIndex);

  let result = text;
  for (const match of sortedMatches) {
    const before = result.substring(0, match.startIndex);
    const highlighted = result.substring(match.startIndex, match.endIndex);
    const after = result.substring(match.endIndex);
    result = `${before}<mark class="${className}">${highlighted}</mark>${after}`;
  }

  return result;
}
