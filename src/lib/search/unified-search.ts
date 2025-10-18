/**
 * Unified Search Orchestrator
 *
 * Combines keyword search and vector-based semantic search to provide
 * the best search experience. Supports three modes:
 * - keyword: Traditional text matching
 * - semantic: Vector similarity search
 * - hybrid: Combines both with weighted scoring
 */

import { SearchEngine } from '../search';
import { SemanticSearchEngine } from '../ai/semantic-search';
import { Note, SearchResult } from '../types';
import { SearchMode, UnifiedSearchOptions, UnifiedSearchResult } from '../vector/types';

export class UnifiedSearchEngine {
  private keywordSearch: SearchEngine;
  private vectorSearch: SemanticSearchEngine;
  private isVectorSearchAvailable = false;

  constructor(keywordSearch?: SearchEngine, vectorSearch?: SemanticSearchEngine) {
    this.keywordSearch = keywordSearch || new SearchEngine();
    this.vectorSearch = vectorSearch || new SemanticSearchEngine();
  }

  /**
   * Initialize vector search capabilities
   */
  async initialize(): Promise<void> {
    try {
      await this.vectorSearch.initializeVectorSearch();
      this.isVectorSearchAvailable = this.vectorSearch.isVectorSearchAvailable();
      console.log(
        `Unified search initialized. Vector search: ${this.isVectorSearchAvailable ? 'enabled' : 'disabled'}`
      );
    } catch (error) {
      console.error('Failed to initialize unified search:', error);
      this.isVectorSearchAvailable = false;
    }
  }

  /**
   * Perform unified search across notes
   */
  async search(
    query: string,
    notes: Note[],
    options: UnifiedSearchOptions = {}
  ): Promise<UnifiedSearchResult> {
    const startTime = Date.now();
    const {
      mode = 'hybrid',
      limit = 20,
      includeContent = true,
      tags = [],
      folders = [],
      threshold = 0.5,
    } = options;

    if (!query.trim()) {
      return {
        results: [],
        metadata: {
          keywordResultsCount: 0,
          semanticResultsCount: 0,
          mode,
          query,
          executionTime: 0,
        },
      };
    }

    // Add notes to keyword search index
    notes.forEach(note => this.keywordSearch.addNote(note));

    let keywordResults: SearchResult[] = [];
    let semanticResults: SearchResult[] = [];

    // Perform searches based on mode
    if (mode === 'keyword' || mode === 'hybrid') {
      keywordResults = this.keywordSearch.search(query, {
        limit: limit * 2, // Get extra for merging
        includeContent,
        tags,
        folders,
      });
    }

    if ((mode === 'semantic' || mode === 'hybrid') && this.isVectorSearchAvailable) {
      try {
        const semanticResponse = await this.vectorSearch.semanticSearch(query, notes, {
          maxResults: limit * 2,
        });
        semanticResults = semanticResponse.results;
      } catch (error) {
        console.error('Semantic search failed:', error);
        // Continue with keyword results only
      }
    }

    // Merge and rank results
    const mergedResults = this.mergeResults(keywordResults, semanticResults, mode, threshold);

    const executionTime = Date.now() - startTime;

    return {
      results: mergedResults.slice(0, limit),
      metadata: {
        keywordResultsCount: keywordResults.length,
        semanticResultsCount: semanticResults.length,
        mode,
        query,
        executionTime,
      },
    };
  }

  /**
   * Merge results from keyword and semantic search
   */
  private mergeResults(
    keywordResults: SearchResult[],
    semanticResults: SearchResult[],
    mode: SearchMode,
    threshold: number
  ): SearchResult[] {
    // If only one type of search was performed, return those results
    if (mode === 'keyword') {
      return keywordResults;
    }

    if (mode === 'semantic') {
      return semanticResults.filter(r => r.score >= threshold);
    }

    // Hybrid mode: Combine with weighted scoring
    const resultMap = new Map<string, SearchResult>();

    // Add keyword results with 60% weight
    for (const result of keywordResults) {
      resultMap.set(result.noteId, {
        ...result,
        score: result.score * 0.6,
      });
    }

    // Add or boost with semantic results (40% weight)
    for (const result of semanticResults) {
      // Only include results above threshold
      if (result.score < threshold) continue;

      if (resultMap.has(result.noteId)) {
        // Boost existing result
        const existing = resultMap.get(result.noteId)!;
        existing.score += result.score * 0.4;

        // Merge matches
        existing.matches = [
          ...existing.matches,
          ...result.matches.filter(
            m => !existing.matches.some(em => em.lineNumber === m.lineNumber && em.text === m.text)
          ),
        ];
      } else {
        // Add new result
        resultMap.set(result.noteId, {
          ...result,
          score: result.score * 0.4,
        });
      }
    }

    // Sort by combined score
    return Array.from(resultMap.values()).sort((a, b) => b.score - a.score);
  }

  /**
   * Check if vector search is available
   */
  isVectorEnabled(): boolean {
    return this.isVectorSearchAvailable;
  }

  /**
   * Get the keyword search engine
   */
  getKeywordEngine(): SearchEngine {
    return this.keywordSearch;
  }

  /**
   * Get the semantic search engine
   */
  getSemanticEngine(): SemanticSearchEngine {
    return this.vectorSearch;
  }

  /**
   * Clear search caches
   */
  clearCaches(): void {
    this.vectorSearch.clearCache();
  }
}
