/**
 * Embedding Service
 *
 * Coordinates embedding generation using different providers (local or cloud).
 * Handles caching and text preparation for optimal embedding quality.
 */

import { Note } from '../types';
import { Embedder, EmbeddingConfig } from './types';
import { LocalEmbedder } from './local-embedder';

export class EmbeddingService {
  private embedder: Embedder;
  private cache: Map<string, { embedding: number[]; timestamp: number }> = new Map();
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours

  constructor(config: EmbeddingConfig) {
    if (config.provider === 'local') {
      this.embedder = new LocalEmbedder(config.model);
    } else {
      // Cloud embedders will be added in Phase 2
      throw new Error(`Provider ${config.provider} not yet implemented. Use 'local' for now.`);
    }
  }

  /**
   * Generate embedding for a note
   * Combines title, content, and tags with appropriate weighting
   */
  async embedNote(note: Note): Promise<number[]> {
    // Create cache key based on note ID and update time
    const cacheKey = `${note.id}-${note.updatedAt}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.embedding;
    }

    // Prepare text with weighting
    const text = this.prepareNoteText(note);

    // Generate embedding
    const embedding = await this.embedder.embed(text);

    // Cache the result
    this.cache.set(cacheKey, {
      embedding,
      timestamp: Date.now(),
    });

    // Clean old cache entries (simple LRU-like behavior)
    if (this.cache.size > 1000) {
      this.pruneCache();
    }

    return embedding;
  }

  /**
   * Generate embedding for a search query
   */
  async embedQuery(query: string): Promise<number[]> {
    return this.embedder.embed(query);
  }

  /**
   * Batch embed multiple notes (more efficient)
   */
  async batchEmbedNotes(notes: Note[]): Promise<Map<string, number[]>> {
    const results = new Map<string, number[]>();

    for (const note of notes) {
      try {
        const embedding = await this.embedNote(note);
        results.set(note.id, embedding);
      } catch (error) {
        console.error(`Failed to embed note ${note.id}:`, error);
        // Continue with other notes
      }
    }

    return results;
  }

  /**
   * Prepare note text for embedding
   * Combines title, content, and tags with appropriate weighting
   */
  private prepareNoteText(note: Note): string {
    const parts: string[] = [];

    // Title is most important - repeat 3 times for emphasis
    if (note.name) {
      const titleText = note.name.replace(/\.md$/, ''); // Remove .md extension
      parts.push(titleText, titleText, titleText);
    }

    // Add main content
    if (note.content) {
      // Clean markdown syntax for better semantic understanding
      const cleanContent = this.cleanMarkdown(note.content);
      parts.push(cleanContent);
    }

    // Tags are important - repeat 2 times
    if (note.tags && note.tags.length > 0) {
      const tagText = note.tags.map(tag => `#${tag}`).join(' ');
      parts.push(tagText, tagText);
    }

    // Add folder context if available
    if (note.folder) {
      parts.push(`folder: ${note.folder}`);
    }

    return parts.join('\n\n');
  }

  /**
   * Clean markdown syntax to improve semantic understanding
   */
  private cleanMarkdown(content: string): string {
    let cleaned = content;

    // Remove code blocks (keep content but remove markers)
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

    // Remove excessive markdown symbols
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, ''); // Headers
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Bold
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Italic
    cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1'); // Strikethrough

    // Remove links but keep text
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // [text](url)
    cleaned = cleaned.replace(/\[\[([^\]]+)\]\]/g, '$1'); // [[wikilink]]

    // Remove images
    cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

    // Normalize whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Prune old entries from cache
   */
  private pruneCache(): void {
    const now = Date.now();
    const entriesToRemove: string[] = [];

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        entriesToRemove.push(key);
      }
    }

    entriesToRemove.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear the embedding cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: 1000,
    };
  }

  /**
   * Get the embedder being used
   */
  getEmbedder(): Embedder {
    return this.embedder;
  }

  /**
   * Get embedding dimensions
   */
  getDimensions(): number {
    return this.embedder.getDimensions();
  }

  /**
   * Check if embedder is ready
   */
  isReady(): boolean {
    return this.embedder.isReady();
  }

  /**
   * Initialize the embedder (if not already initialized)
   */
  async initialize(): Promise<void> {
    if (this.embedder.initialize) {
      await this.embedder.initialize();
    }
  }
}
