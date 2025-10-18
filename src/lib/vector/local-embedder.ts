/**
 * Local Embedding Generator using Transformers.js
 *
 * This implementation generates embeddings entirely in the browser using
 * Transformers.js and WASM-based models. No API keys or external services required.
 *
 * Features:
 * - 100% local and private
 * - Zero cost
 * - Works offline after initial model download
 * - Fast inference (~100-200ms per note)
 *
 * Model: Xenova/all-MiniLM-L6-v2
 * - Dimensions: 384
 * - Quality: Good for most use cases
 * - Size: ~50MB (downloaded once)
 */

import { Embedder } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransformersModel = any;

export class LocalEmbedder implements Embedder {
  private model: TransformersModel = null;
  private modelName = 'Xenova/all-MiniLM-L6-v2';
  private dimensions = 384;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(modelName?: string) {
    if (modelName) {
      this.modelName = modelName;
    }
  }

  /**
   * Initialize the embedding model
   * Downloads and loads the model on first use
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      // Dynamic import to avoid loading in Node.js environment
      const { pipeline } = await import('@xenova/transformers');

      console.log(`Loading embedding model: ${this.modelName}...`);

      // Create the feature-extraction pipeline
      this.model = await pipeline('feature-extraction', this.modelName);

      this.isInitialized = true;
      console.log('Embedding model loaded successfully');
    } catch (error) {
      this.isInitialized = false;
      this.initPromise = null;
      throw new Error(
        `Failed to initialize local embedder: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate an embedding for the given text
   *
   * @param text - Input text to embed (title, content, etc.)
   * @returns 384-dimensional embedding vector
   */
  async embed(text: string): Promise<number[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.model) {
      throw new Error('Model not initialized');
    }

    try {
      // Truncate very long texts (model has max token limit)
      const maxLength = 512;
      const truncatedText = text.length > maxLength * 4 ? text.substring(0, maxLength * 4) : text;

      // Generate embedding
      const output = await this.model(truncatedText, {
        pooling: 'mean', // Mean pooling for better sentence representations
        normalize: true, // Normalize to unit length for cosine similarity
      });

      // Convert tensor to regular array
      const embedding: number[] = Array.from(output.data);

      return embedding;
    } catch (error) {
      throw new Error(
        `Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get the dimensionality of embeddings produced by this model
   */
  getDimensions(): number {
    return this.dimensions;
  }

  /**
   * Get the model name/identifier
   */
  getModel(): string {
    return this.modelName;
  }

  /**
   * Check if the embedder is ready to use
   */
  isReady(): boolean {
    return this.isInitialized && this.model !== null;
  }

  /**
   * Batch embed multiple texts (more efficient)
   *
   * @param texts - Array of texts to embed
   * @returns Array of embedding vectors
   */
  async batchEmbed(texts: string[]): Promise<number[][]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.model) {
      throw new Error('Model not initialized');
    }

    // Process in batches to avoid memory issues
    const batchSize = 10;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(text => this.embed(text)));
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Dispose of the model and free memory
   */
  dispose(): void {
    if (this.model && typeof this.model.dispose === 'function') {
      this.model.dispose();
    }
    this.model = null;
    this.isInitialized = false;
    this.initPromise = null;
  }
}

/**
 * Singleton instance for browser usage
 * Reuses the same model across the application
 */
let globalLocalEmbedder: LocalEmbedder | null = null;

export function getLocalEmbedder(): LocalEmbedder {
  if (!globalLocalEmbedder) {
    globalLocalEmbedder = new LocalEmbedder();
  }
  return globalLocalEmbedder;
}
