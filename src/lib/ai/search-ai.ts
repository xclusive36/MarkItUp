/**
 * AI-Enhanced Search Utilities for Global Search V4
 *
 * This module provides optional AI enhancements for search functionality:
 * - Natural language query parsing
 * - Smart search suggestions
 * - Query understanding and correction
 * - Semantic refinement
 *
 * All features are OPTIONAL and gracefully degrade when AI is not configured.
 */

import { AIService } from './ai-service';
import { SearchResult, Note } from '@/lib/types';

export interface ParsedQuery {
  keywords: string[];
  filters: {
    tags?: string[];
    folders?: string[];
    dateRange?: 'today' | 'week' | 'month' | 'all';
    dateRangeCustom?: { start?: string; end?: string };
    wordCountMin?: number;
    wordCountMax?: number;
    hasLinks?: boolean;
    noLinks?: boolean;
    hasTags?: boolean;
    noTags?: boolean;
  };
  intent: 'search' | 'filter' | 'analyze' | 'find-related';
  confidence: number;
  originalQuery: string;
  suggestedMode?: 'keyword' | 'semantic' | 'hybrid' | 'regex';
}

export interface SearchSuggestion {
  type: 'query' | 'topic' | 'note' | 'tag' | 'folder';
  value: string;
  reason: string;
  confidence: number;
}

export interface QueryCorrection {
  original: string;
  suggested: string;
  reason: string;
  confidence: number;
}

/**
 * Check if AI is available and configured
 */
export function isAIAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // Check both possible localStorage keys
    const aiSettings =
      localStorage.getItem('markitup-ai-settings') || localStorage.getItem('aiSettings');
    if (!aiSettings) return false;

    const settings = JSON.parse(aiSettings);

    // Must have a provider selected
    if (!settings.provider || settings.provider === 'none') return false;

    // Ollama doesn't need API key - just needs to be selected as provider
    // ollamaUrl is optional (defaults to http://localhost:11434)
    if (settings.provider === 'ollama') {
      return true;
    }

    // Other providers need API key
    if (settings.provider && settings.apiKey && settings.apiKey.trim().length > 0) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Get current AI provider name
 */
export function getAIProvider(): string {
  if (typeof window === 'undefined') return 'none';

  try {
    // Check both possible localStorage keys
    const aiSettings =
      localStorage.getItem('markitup-ai-settings') || localStorage.getItem('aiSettings');
    if (!aiSettings) return 'none';

    const settings = JSON.parse(aiSettings);
    return settings.provider || 'none';
  } catch {
    return 'none';
  }
}

/**
 * Parse natural language query into structured search parameters
 *
 * Examples:
 * - "React notes I edited last week" → { keywords: ["React"], filters: { dateRange: "week" } }
 * - "Untagged JavaScript files" → { keywords: ["JavaScript"], filters: { noTags: true } }
 * - "Long notes about machine learning" → { keywords: ["machine learning"], filters: { wordCountMin: 1000 } }
 */
export async function parseNaturalLanguageQuery(
  query: string,
  aiService?: AIService
): Promise<ParsedQuery> {
  // Default fallback parsing (no AI)
  const fallback: ParsedQuery = {
    keywords: query.split(/\s+/).filter(k => k.length > 0),
    filters: {},
    intent: 'search',
    confidence: 0.3,
    originalQuery: query,
    suggestedMode: 'keyword',
  };

  if (!aiService || !isAIAvailable()) {
    return fallback;
  }

  try {
    const prompt = `Parse this search query into structured parameters. Return ONLY valid JSON with no markdown formatting.

Query: "${query}"

Analyze the query and extract:
1. Keywords to search for
2. Filters (tags, folders, date ranges, word count, link presence)
3. User intent (search, filter, analyze, find-related)
4. Suggested search mode (keyword, semantic, hybrid, regex)

Return JSON in this exact format:
{
  "keywords": ["word1", "word2"],
  "filters": {
    "tags": ["tag1"],
    "folders": ["folder"],
    "dateRange": "week",
    "wordCountMin": 100,
    "wordCountMax": 1000,
    "hasLinks": true,
    "noLinks": false,
    "hasTags": true,
    "noTags": false
  },
  "intent": "search",
  "confidence": 0.9,
  "suggestedMode": "hybrid"
}

Common date ranges: "today", "week", "month", "all"
Intent options: "search", "filter", "analyze", "find-related"
Mode options: "keyword", "semantic", "hybrid", "regex"

Examples:
- "React notes from last week" → keywords: ["React"], filters: { dateRange: "week" }
- "Untagged JavaScript files" → keywords: ["JavaScript"], filters: { noTags: true }
- "Long notes about AI" → keywords: ["AI"], filters: { wordCountMin: 1000 }
- "Notes in projects folder" → keywords: [], filters: { folders: ["projects"] }`;

    const response = await aiService.chat({
      sessionId: 'search-nlp',
      message: prompt,
      temperature: 0.1,
      maxTokens: 500,
      includeContext: false,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'AI request failed');
    }

    // Parse AI response
    const parsed = JSON.parse(response.data.content.trim());

    // Add original query
    parsed.originalQuery = query;

    // Validate and ensure all required fields
    if (!parsed.keywords) parsed.keywords = fallback.keywords;
    if (!parsed.filters) parsed.filters = {};
    if (!parsed.intent) parsed.intent = 'search';
    if (!parsed.confidence) parsed.confidence = 0.7;
    if (!parsed.suggestedMode) parsed.suggestedMode = 'hybrid';

    return parsed;
  } catch (error) {
    console.error('[SearchAI] Error parsing natural language query:', error);
    return fallback;
  }
}

/**
 * Generate smart search suggestions based on current query and results
 */
export async function generateSearchSuggestions(
  query: string,
  results: SearchResult[],
  notes: Note[],
  aiService?: AIService
): Promise<SearchSuggestion[]> {
  if (!aiService || !isAIAvailable()) {
    return [];
  }

  try {
    // Extract context from results
    const resultTitles = results
      .slice(0, 10)
      .map(r => {
        const note = notes.find(n => n.id === r.noteId);
        return note?.name || '';
      })
      .filter(Boolean);

    const prompt = `Based on the search query and results, suggest related searches or topics the user might be interested in.

Query: "${query}"
Top Results: ${resultTitles.join(', ')}

Provide 3-5 suggestions. Return ONLY valid JSON array with no markdown:
[
  {
    "type": "query",
    "value": "suggested search term",
    "reason": "why this is relevant",
    "confidence": 0.8
  }
]

Types: "query", "topic", "tag", "folder"
Keep suggestions specific and actionable.`;

    const response = await aiService.chat({
      sessionId: 'search-suggestions',
      message: prompt,
      temperature: 0.3,
      maxTokens: 400,
      includeContext: false,
    });

    if (!response.success || !response.data) {
      throw new Error('AI request failed');
    }

    const suggestions = JSON.parse(response.data.content.trim());
    return Array.isArray(suggestions) ? suggestions.slice(0, 5) : [];
  } catch (error) {
    console.error('[SearchAI] Error generating suggestions:', error);
    return [];
  }
}

/**
 * Analyze query for potential corrections or improvements
 */
export async function analyzeQuery(
  query: string,
  aiService?: AIService
): Promise<QueryCorrection | null> {
  if (!aiService || !isAIAvailable() || query.length < 3) {
    return null;
  }

  try {
    const prompt = `Analyze this search query for potential issues or improvements.

Query: "${query}"

Check for:
- Common typos or misspellings
- Better phrasing
- More effective search terms

If the query looks good, return: { "hasCorrection": false }
If you have a suggestion, return JSON:
{
  "hasCorrection": true,
  "suggested": "corrected query",
  "reason": "brief explanation",
  "confidence": 0.8
}

Return ONLY valid JSON, no markdown.`;

    const response = await aiService.chat({
      sessionId: 'search-analyzer',
      message: prompt,
      temperature: 0.1,
      maxTokens: 200,
      includeContext: false,
    });

    if (!response.success || !response.data) {
      return null;
    }

    const result = JSON.parse(response.data.content.trim());

    if (!result.hasCorrection) {
      return null;
    }

    return {
      original: query,
      suggested: result.suggested,
      reason: result.reason,
      confidence: result.confidence || 0.7,
    };
  } catch (error) {
    console.error('[SearchAI] Error analyzing query:', error);
    return null;
  }
}

/**
 * Perform semantic refinement on search results using AI
 * This is more intelligent than simple text matching
 */
export async function semanticRefinement(
  originalQuery: string,
  refinementQuery: string,
  results: SearchResult[],
  notes: Note[],
  aiService?: AIService
): Promise<SearchResult[]> {
  if (!aiService || !isAIAvailable()) {
    // Fallback to simple text matching
    return results.filter(result => {
      const note = notes.find(n => n.id === result.noteId);
      if (!note) return false;

      const searchText = `${note.name} ${note.content}`.toLowerCase();
      return searchText.includes(refinementQuery.toLowerCase());
    });
  }

  try {
    // Use AI to understand which results are semantically relevant
    const resultDescriptions = results
      .map((r, idx) => {
        const note = notes.find(n => n.id === r.noteId);
        return `${idx}: ${note?.name} - ${note?.content.slice(0, 200)}`;
      })
      .join('\n');

    const prompt = `Given these search results for "${originalQuery}", which ones are relevant to "${refinementQuery}"?

Results:
${resultDescriptions}

Return ONLY a JSON array of relevant result indices: [0, 2, 5, ...]
If none are relevant, return: []`;

    const response = await aiService.chat({
      sessionId: 'search-refinement',
      message: prompt,
      temperature: 0.1,
      maxTokens: 300,
      includeContext: false,
    });

    if (!response.success || !response.data) {
      throw new Error('AI request failed');
    }

    const relevantIndices = JSON.parse(response.data.content.trim());

    if (!Array.isArray(relevantIndices)) {
      throw new Error('Invalid response format');
    }

    return relevantIndices.map(idx => results[idx]).filter(Boolean);
  } catch (error) {
    console.error('[SearchAI] Error in semantic refinement:', error);
    // Fallback to text matching
    return results.filter(result => {
      const note = notes.find(n => n.id === result.noteId);
      if (!note) return false;

      const searchText = `${note.name} ${note.content}`.toLowerCase();
      return searchText.includes(refinementQuery.toLowerCase());
    });
  }
}

/**
 * Re-rank search results using AI for better relevance
 */
export async function reRankResults(
  query: string,
  results: SearchResult[],
  notes: Note[],
  aiService?: AIService
): Promise<SearchResult[]> {
  if (!aiService || !isAIAvailable() || results.length < 2) {
    return results;
  }

  try {
    const resultDescriptions = results
      .map((r, idx) => {
        const note = notes.find(n => n.id === r.noteId);
        return `${idx}: ${note?.name} (score: ${r.score})`;
      })
      .join('\n');

    const prompt = `Rank these search results by relevance to "${query}".

Results:
${resultDescriptions}

Return ONLY a JSON array of indices in order of relevance: [2, 0, 5, 1, ...]
Most relevant first.`;

    const response = await aiService.chat({
      sessionId: 'search-ranker',
      message: prompt,
      temperature: 0.1,
      maxTokens: 300,
      includeContext: false,
    });

    if (!response.success || !response.data) {
      return results;
    }

    const rankedIndices = JSON.parse(response.data.content.trim());

    if (!Array.isArray(rankedIndices) || rankedIndices.length !== results.length) {
      return results;
    }

    return rankedIndices.map(idx => results[idx]).filter(Boolean);
  } catch (error) {
    console.error('[SearchAI] Error re-ranking results:', error);
    return results;
  }
}
