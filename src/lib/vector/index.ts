/**
 * Vector Search Module
 *
 * Exports all components for vector-based semantic search:
 * - Vector store (IndexedDB-based)
 * - Embedding generation (local with Transformers.js)
 * - Indexing service (background processing)
 */

export * from './types';
export { BrowserVectorStore } from './browser-vector-store';
export { LocalEmbedder, getLocalEmbedder } from './local-embedder';
export { EmbeddingService } from './embedding-service';
export { VectorIndexingService } from './indexing-service';
