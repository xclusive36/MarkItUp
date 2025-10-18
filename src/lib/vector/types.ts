/**
 * Vector Search Type Definitions
 *
 * This module defines the core types and interfaces for the vector search system,
 * including vector storage, embeddings, and similarity search.
 */

/**
 * Metadata associated with a note's embedding
 */
export interface NoteMetadata {
  title: string;
  tags: string[];
  folder?: string;
  updatedAt: string;
  wordCount?: number;
}

/**
 * A note that is similar to a query, with similarity score
 */
export interface SimilarNote {
  noteId: string;
  similarity: number; // 0-1 cosine similarity score
  metadata: NoteMetadata;
}

/**
 * An item to be batch-added to the vector store
 */
export interface EmbeddingItem {
  noteId: string;
  embedding: number[];
  metadata: NoteMetadata;
}

/**
 * Statistics about the vector store
 */
export interface VectorStoreStats {
  totalEmbeddings: number;
  dimensions: number;
  storageSize: number; // bytes
  lastUpdated: string;
}

/**
 * Options for finding similar notes
 */
export interface FindSimilarOptions {
  limit?: number;
  threshold?: number; // Minimum similarity score (0-1)
  excludeIds?: string[]; // Note IDs to exclude from results
}

/**
 * Abstract interface for vector storage backends
 *
 * Implementations:
 * - BrowserVectorStore: IndexedDB-based storage for browser
 * - MemoryVectorStore: In-memory storage for testing
 */
export interface VectorStore {
  /**
   * Store a note embedding with metadata
   */
  addEmbedding(noteId: string, embedding: number[], metadata: NoteMetadata): Promise<void>;

  /**
   * Find notes similar to the given embedding
   */
  findSimilar(embedding: number[], options?: FindSimilarOptions): Promise<SimilarNote[]>;

  /**
   * Update an existing note's embedding
   */
  updateEmbedding(noteId: string, embedding: number[], metadata?: NoteMetadata): Promise<void>;

  /**
   * Remove a note's embedding from the store
   */
  removeEmbedding(noteId: string): Promise<void>;

  /**
   * Check if an embedding exists for a note
   */
  hasEmbedding(noteId: string): Promise<boolean>;

  /**
   * Get an embedding for a specific note
   */
  getEmbedding(noteId: string): Promise<EmbeddingItem | null>;

  /**
   * Batch add multiple embeddings (more efficient)
   */
  batchAddEmbeddings(items: EmbeddingItem[]): Promise<void>;

  /**
   * Get statistics about the vector store
   */
  getStats(): Promise<VectorStoreStats>;

  /**
   * Clear all embeddings from the store
   */
  clear(): Promise<void>;

  /**
   * Initialize the store (if needed)
   */
  initialize(): Promise<void>;
}

/**
 * Configuration for embedding generation
 */
export interface EmbeddingConfig {
  provider: 'local' | 'openai' | 'gemini' | 'anthropic';
  apiKey?: string; // Required for cloud providers
  model?: string; // Specific model to use
  dimensions?: number; // Target embedding dimensions
}

/**
 * Interface for embedding generators
 */
export interface Embedder {
  /**
   * Generate an embedding for the given text
   */
  embed(text: string): Promise<number[]>;

  /**
   * Get the dimensionality of embeddings produced
   */
  getDimensions(): number;

  /**
   * Get the model name/identifier
   */
  getModel(): string;

  /**
   * Initialize the embedder (load models, etc.)
   */
  initialize?(): Promise<void>;

  /**
   * Check if the embedder is ready to use
   */
  isReady(): boolean;
}

/**
 * Cache entry for embeddings
 */
export interface EmbeddingCacheEntry {
  noteId: string;
  updatedAt: string;
  embedding: number[];
  model: string;
  dimensions: number;
}

/**
 * Options for embedding cache
 */
export interface EmbeddingCacheOptions {
  maxSize?: number; // Maximum cache entries
  ttl?: number; // Time-to-live in milliseconds
}

/**
 * Search mode for unified search
 */
export type SearchMode = 'keyword' | 'semantic' | 'hybrid';

/**
 * Options for unified search
 */
export interface UnifiedSearchOptions {
  mode?: SearchMode;
  limit?: number;
  includeContent?: boolean;
  tags?: string[];
  folders?: string[];
  threshold?: number; // For semantic search
}

/**
 * Result from unified search with metadata
 */
export interface UnifiedSearchResult {
  results: import('../types').SearchResult[];
  metadata: {
    keywordResultsCount: number;
    semanticResultsCount: number;
    mode: SearchMode;
    query: string;
    executionTime?: number;
  };
}

/**
 * Progress callback for indexing operations
 */
export type IndexingProgressCallback = (
  current: number,
  total: number,
  currentNote?: string
) => void;

/**
 * Options for indexing service
 */
export interface IndexingOptions {
  batchSize?: number; // Number of notes to process at once
  onProgress?: IndexingProgressCallback;
  forceReindex?: boolean; // Re-index even if embeddings exist
}

/**
 * Status of the indexing service
 */
export interface IndexingStatus {
  isIndexing: boolean;
  queueLength: number;
  totalProcessed: number;
  lastError?: string;
}
