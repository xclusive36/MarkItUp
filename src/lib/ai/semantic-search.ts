import { Note, SearchResult, SearchMatch } from '../types';
import { analytics } from '../analytics';
import { BrowserVectorStore, EmbeddingService, SimilarNote } from '../vector';

export interface SemanticSearchResult extends SearchResult {
  semanticScore: number;
  conceptualMatches: string[];
  contextualRelevance: number;
}

export interface SearchInsights {
  searchSuggestions: string[];
  relatedTopics: string[];
  conceptualKeywords: string[];
}

export class SemanticSearchEngine {
  private searchCache: Map<string, SemanticSearchResult[]> = new Map();
  private vectorStore: BrowserVectorStore | null = null;
  private embeddingService: EmbeddingService | null = null;
  private isVectorSearchEnabled = false;

  /**
   * Initialize vector search capabilities
   * Call this to enable true semantic search with embeddings
   */
  async initializeVectorSearch(): Promise<void> {
    try {
      this.vectorStore = new BrowserVectorStore();
      await this.vectorStore.initialize();

      this.embeddingService = new EmbeddingService({ provider: 'local' });
      await this.embeddingService.initialize();

      this.isVectorSearchEnabled = true;
      console.log('Vector search initialized successfully');
    } catch (error) {
      console.error('Failed to initialize vector search:', error);
      this.isVectorSearchEnabled = false;
      // Fall back to keyword-based semantic search
    }
  }

  /**
   * Check if vector search is available
   */
  isVectorSearchAvailable(): boolean {
    return (
      this.isVectorSearchEnabled && this.vectorStore !== null && this.embeddingService !== null
    );
  }

  async semanticSearch(
    query: string,
    notes: Note[],
    options: {
      maxResults?: number;
      includeRelated?: boolean;
      searchDepth?: 'shallow' | 'deep' | 'comprehensive';
      contextualBias?: string[];
    } = {}
  ): Promise<{
    results: SemanticSearchResult[];
    insights: SearchInsights;
    suggestions: string[];
  }> {
    const cacheKey = `${query}-${JSON.stringify(options)}`;

    // Check cache first
    if (this.searchCache.has(cacheKey)) {
      return {
        results: this.searchCache.get(cacheKey)!,
        insights: this.generateSearchInsights(query, notes),
        suggestions: this.generateSearchSuggestions(query, notes),
      };
    }

    // Use vector search if available, otherwise fall back to keyword-based
    let semanticResults: SemanticSearchResult[];

    if (this.isVectorSearchAvailable()) {
      semanticResults = await this.vectorBasedSearch(query, notes, options.maxResults || 20);
    } else {
      // Fallback: keyword-based semantic search
      const expandedTerms = this.expandQuery(query);
      const layeredResults = await Promise.all([
        this.exactMatchSearch(query, notes),
        this.expandedTermSearch(expandedTerms, notes),
        this.contextualSearch(query, notes, options.contextualBias || []),
      ]);
      const mergedResults = this.mergeSearchResults(layeredResults.flat());
      semanticResults = this.applySemanticScoring(
        mergedResults,
        query,
        expandedTerms,
        options.maxResults || 20
      );
    }

    // Cache results
    this.searchCache.set(cacheKey, semanticResults);

    // Generate insights
    const insights = this.generateSearchInsights(query, notes);
    const suggestions = this.generateSearchSuggestions(query, notes);

    // Track analytics
    analytics.trackEvent('ai_analysis', {
      action: 'semantic_search',
      query,
      resultsCount: semanticResults.length,
      searchDepth: options.searchDepth || 'shallow',
      hasResults: semanticResults.length > 0,
    });

    return {
      results: semanticResults,
      insights,
      suggestions,
    };
  }

  private expandQuery(query: string): string[] {
    const terms = [query];
    const queryLower = query.toLowerCase();

    // Basic synonym expansion (can be enhanced with AI later)
    const synonymMap: Record<string, string[]> = {
      ai: ['artificial intelligence', 'machine learning', 'ml', 'algorithm'],
      programming: ['coding', 'development', 'software', 'code'],
      design: ['ui', 'ux', 'interface', 'visual', 'layout'],
      project: ['task', 'work', 'assignment', 'initiative'],
      learn: ['study', 'education', 'knowledge', 'understanding'],
      idea: ['concept', 'thought', 'notion', 'insight'],
      problem: ['issue', 'challenge', 'difficulty', 'trouble'],
      solution: ['answer', 'fix', 'resolution', 'approach'],
    };

    for (const [key, synonyms] of Object.entries(synonymMap)) {
      if (queryLower.includes(key)) {
        terms.push(...synonyms);
      }
    }

    return terms;
  }

  /**
   * Vector-based semantic search using real embeddings
   */
  private async vectorBasedSearch(
    query: string,
    notes: Note[],
    maxResults: number
  ): Promise<SemanticSearchResult[]> {
    if (!this.vectorStore || !this.embeddingService) {
      throw new Error('Vector search not initialized');
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.embeddingService.embedQuery(query);

      // Find similar notes using vector similarity
      const similarNotes = await this.vectorStore.findSimilar(queryEmbedding, {
        limit: maxResults * 2, // Get extra for filtering
        threshold: 0.5, // 50% similarity minimum
      });

      // Convert to SemanticSearchResult format
      const results: SemanticSearchResult[] = [];
      const noteMap = new Map(notes.map(n => [n.id, n]));

      for (const similar of similarNotes) {
        const note = noteMap.get(similar.noteId);
        if (!note) continue;

        // Find matches in content for highlighting
        const matches = this.findContentMatches(note.content, query);

        results.push({
          noteId: note.id,
          noteName: note.name,
          matches,
          score: similar.similarity * 10, // Scale to 0-10 range
          semanticScore: similar.similarity,
          conceptualMatches: similar.metadata.tags,
          contextualRelevance: similar.similarity,
        });
      }

      return results.slice(0, maxResults);
    } catch (error) {
      console.error('Vector search failed:', error);
      // Fall back to empty results rather than throwing
      return [];
    }
  }

  private async exactMatchSearch(query: string, notes: Note[]): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const note of notes) {
      const matches: SearchMatch[] = [];

      // Title matches (high priority)
      if (note.name.toLowerCase().includes(queryLower)) {
        const match: SearchMatch = {
          text: note.name,
          start: note.name.toLowerCase().indexOf(queryLower),
          end: note.name.toLowerCase().indexOf(queryLower) + query.length,
          lineNumber: 0,
          context: note.name,
        };
        matches.push(match);
      }

      // Content matches
      const contentMatches = this.findContentMatches(note.content, query);
      matches.push(...contentMatches);

      // Tag matches
      for (const tag of note.tags) {
        if (tag.toLowerCase().includes(queryLower)) {
          const match: SearchMatch = {
            text: tag,
            start: 0,
            end: tag.length,
            lineNumber: 0,
            context: `#${tag}`,
          };
          matches.push(match);
        }
      }

      if (matches.length > 0) {
        results.push({
          noteId: note.id,
          noteName: note.name,
          matches,
          score: this.calculateBasicScore(matches, query),
        });
      }
    }

    return results;
  }

  private async expandedTermSearch(
    expandedTerms: string[],
    notes: Note[]
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const note of notes) {
      const matches: SearchMatch[] = [];
      let score = 0;

      for (const term of expandedTerms) {
        const termMatches = this.findContentMatches(note.content, term);
        if (termMatches.length > 0) {
          matches.push(...termMatches);
          score += 0.5; // Lower score for expanded terms
        }
      }

      if (matches.length > 0) {
        results.push({
          noteId: note.id,
          noteName: note.name,
          matches,
          score,
        });
      }
    }

    return results;
  }

  private async contextualSearch(
    query: string,
    notes: Note[],
    contextualBias: string[]
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const note of notes) {
      let contextScore = 0;

      // Boost score if note contains contextual bias terms
      for (const bias of contextualBias) {
        if (
          note.content.toLowerCase().includes(bias.toLowerCase()) ||
          note.tags.some(tag => tag.toLowerCase().includes(bias.toLowerCase()))
        ) {
          contextScore += 0.3;
        }
      }

      if (contextScore > 0) {
        const basicMatches = this.findContentMatches(note.content, query);
        if (basicMatches.length > 0) {
          results.push({
            noteId: note.id,
            noteName: note.name,
            matches: basicMatches,
            score: this.calculateBasicScore(basicMatches, query) + contextScore,
          });
        }
      }
    }

    return results;
  }

  private findContentMatches(content: string, query: string): SearchMatch[] {
    const matches: SearchMatch[] = [];
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const lines = content.split('\n');

    let index = contentLower.indexOf(queryLower);
    while (index !== -1) {
      // Find which line this match is on
      let lineNumber = 0;
      let lineStart = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const lineEnd = lineStart + line.length;
        if (index >= lineStart && index <= lineEnd) {
          lineNumber = i;
          break;
        }
        lineStart = lineEnd + 1; // +1 for newline character
      }

      const start = Math.max(0, index - 50);
      const end = Math.min(content.length, index + query.length + 50);
      const context = content.substring(start, end);

      matches.push({
        text: content.substring(index, index + query.length),
        start: index,
        end: index + query.length,
        lineNumber,
        context: start > 0 ? '...' + context : context,
      });

      index = contentLower.indexOf(queryLower, index + 1);
    }

    return matches;
  }

  private calculateBasicScore(matches: SearchMatch[], query: string): number {
    let score = 0;

    for (const match of matches) {
      // Higher score for exact matches
      if (match.text.toLowerCase() === query.toLowerCase()) {
        score += 2.0;
      } else {
        score += 1.0;
      }
    }

    return score;
  }

  private mergeSearchResults(results: SearchResult[]): SearchResult[] {
    const merged = new Map<string, SearchResult>();

    for (const result of results) {
      if (merged.has(result.noteId)) {
        const existing = merged.get(result.noteId)!;
        existing.score = Math.max(existing.score, result.score);
        existing.matches.push(...result.matches);
      } else {
        merged.set(result.noteId, { ...result });
      }
    }

    return Array.from(merged.values());
  }

  private applySemanticScoring(
    results: SearchResult[],
    originalQuery: string,
    expandedTerms: string[],
    maxResults: number
  ): SemanticSearchResult[] {
    const semanticResults: SemanticSearchResult[] = [];

    for (const result of results) {
      const semanticScore = this.calculateSemanticScore(result, expandedTerms);

      semanticResults.push({
        ...result,
        semanticScore,
        conceptualMatches: expandedTerms.filter(term =>
          result.matches.some(match => match.text.toLowerCase().includes(term.toLowerCase()))
        ),
        contextualRelevance: semanticScore * result.score,
      });
    }

    return semanticResults
      .sort((a, b) => b.contextualRelevance - a.contextualRelevance)
      .slice(0, maxResults);
  }

  private calculateSemanticScore(result: SearchResult, expandedTerms: string[]): number {
    let score = 0;

    const resultText = result.matches
      .map(m => m.text)
      .join(' ')
      .toLowerCase();

    for (const term of expandedTerms) {
      if (resultText.includes(term.toLowerCase())) {
        score += 0.2;
      }
    }

    return Math.min(score, 1.0);
  }

  private generateSearchInsights(query: string, notes: Note[]): SearchInsights {
    const expandedTerms = this.expandQuery(query);
    const searchSuggestions = this.generateSearchSuggestions(query, notes);

    return {
      searchSuggestions,
      relatedTopics: expandedTerms,
      conceptualKeywords: query.split(/\s+/),
    };
  }

  private generateSearchSuggestions(query: string, notes: Note[]): string[] {
    const availableTopics = new Set<string>();

    // Extract topics from note titles and tags
    notes.forEach(note => {
      availableTopics.add(note.name);
      note.tags.forEach(tag => availableTopics.add(tag));
    });

    // Filter suggestions related to the query
    const suggestions = Array.from(availableTopics)
      .filter(
        topic =>
          topic.toLowerCase().includes(query.toLowerCase()) ||
          query.toLowerCase().includes(topic.toLowerCase())
      )
      .slice(0, 5);

    return suggestions;
  }

  clearCache(): void {
    this.searchCache.clear();
  }
}
