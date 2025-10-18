/**
 * Browser-based Vector Store using IndexedDB
 *
 * This implementation stores vector embeddings in the browser's IndexedDB,
 * providing persistent storage across sessions while keeping data local.
 *
 * Features:
 * - Persistent storage in browser
 * - Cosine similarity search
 * - Efficient batch operations
 * - Automatic indexing
 */

import {
  VectorStore,
  NoteMetadata,
  SimilarNote,
  EmbeddingItem,
  VectorStoreStats,
  FindSimilarOptions,
} from './types';

interface StoredEmbedding {
  noteId: string;
  embedding: number[];
  metadata: NoteMetadata;
  timestamp: number;
}

export class BrowserVectorStore implements VectorStore {
  private dbName = 'markitup-vectors';
  private storeName = 'embeddings';
  private version = 1;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Initialize on construction
    this.initPromise = this.initialize();
  }

  /**
   * Initialize the IndexedDB database
   */
  async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'noteId',
          });

          // Create index on timestamp for efficient queries
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Add a single embedding to the store
   */
  async addEmbedding(noteId: string, embedding: number[], metadata: NoteMetadata): Promise<void> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const item: StoredEmbedding = {
        noteId,
        embedding,
        metadata,
        timestamp: Date.now(),
      };

      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to add embedding'));
    });
  }

  /**
   * Find notes similar to the given embedding using cosine similarity
   */
  async findSimilar(
    queryEmbedding: number[],
    options: FindSimilarOptions = {}
  ): Promise<SimilarNote[]> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    const { limit = 10, threshold = 0.5, excludeIds = [] } = options;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.openCursor();

      const similarities: SimilarNote[] = [];

      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor) {
          const stored = cursor.value as StoredEmbedding;

          // Skip excluded IDs
          if (!excludeIds.includes(stored.noteId)) {
            const similarity = this.cosineSimilarity(queryEmbedding, stored.embedding);

            // Only include if above threshold
            if (similarity >= threshold) {
              similarities.push({
                noteId: stored.noteId,
                similarity,
                metadata: stored.metadata,
              });
            }
          }

          cursor.continue();
        } else {
          // Sort by similarity (descending) and apply limit
          const results = similarities.sort((a, b) => b.similarity - a.similarity).slice(0, limit);

          resolve(results);
        }
      };

      request.onerror = () => reject(new Error('Failed to search embeddings'));
    });
  }

  /**
   * Calculate cosine similarity between two vectors
   * Returns a value between -1 and 1, where 1 means identical direction
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same dimensions');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Update an existing embedding
   */
  async updateEmbedding(
    noteId: string,
    embedding: number[],
    metadata?: NoteMetadata
  ): Promise<void> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    // Get existing embedding to preserve metadata if not provided
    const existing = await this.getEmbedding(noteId);

    if (!existing && !metadata) {
      throw new Error('Metadata required for new embeddings');
    }

    const finalMetadata = metadata || existing!.metadata;

    await this.addEmbedding(noteId, embedding, finalMetadata);
  }

  /**
   * Remove an embedding from the store
   */
  async removeEmbedding(noteId: string): Promise<void> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(noteId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to remove embedding'));
    });
  }

  /**
   * Check if an embedding exists for a note
   */
  async hasEmbedding(noteId: string): Promise<boolean> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(noteId);

      request.onsuccess = () => resolve(request.result !== undefined);
      request.onerror = () => reject(new Error('Failed to check embedding'));
    });
  }

  /**
   * Get an embedding for a specific note
   */
  async getEmbedding(noteId: string): Promise<EmbeddingItem | null> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(noteId);

      request.onsuccess = () => {
        const stored = request.result as StoredEmbedding | undefined;
        if (stored) {
          resolve({
            noteId: stored.noteId,
            embedding: stored.embedding,
            metadata: stored.metadata,
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error('Failed to get embedding'));
    });
  }

  /**
   * Batch add multiple embeddings (more efficient than individual adds)
   */
  async batchAddEmbeddings(items: EmbeddingItem[]): Promise<void> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      let completed = 0;
      const errors: Error[] = [];

      items.forEach(item => {
        const stored: StoredEmbedding = {
          noteId: item.noteId,
          embedding: item.embedding,
          metadata: item.metadata,
          timestamp: Date.now(),
        };

        const request = store.put(stored);

        request.onsuccess = () => {
          completed++;
          if (completed === items.length) {
            if (errors.length > 0) {
              reject(new Error(`Batch add partially failed: ${errors.length} errors`));
            } else {
              resolve();
            }
          }
        };

        request.onerror = () => {
          errors.push(new Error(`Failed to add embedding for ${item.noteId}`));
          completed++;
          if (completed === items.length) {
            reject(new Error(`Batch add failed: ${errors.length} errors`));
          }
        };
      });

      // Handle empty array
      if (items.length === 0) {
        resolve();
      }
    });
  }

  /**
   * Get statistics about the vector store
   */
  async getStats(): Promise<VectorStoreStats> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        const total = countRequest.result;

        // Get a sample embedding to determine dimensions
        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = event => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          const dimensions = cursor ? cursor.value.embedding.length : 0;

          // Estimate storage size (rough approximation)
          // Each float is ~8 bytes, plus metadata overhead
          const storageSize = total * dimensions * 8;

          resolve({
            totalEmbeddings: total,
            dimensions,
            storageSize,
            lastUpdated: new Date().toISOString(),
          });
        };

        cursorRequest.onerror = () => reject(new Error('Failed to get stats'));
      };

      countRequest.onerror = () => reject(new Error('Failed to count embeddings'));
    });
  }

  /**
   * Clear all embeddings from the store
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();

    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear embeddings'));
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
