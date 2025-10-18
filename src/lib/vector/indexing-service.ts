/**
 * Vector Indexing Service
 *
 * Manages background indexing of notes into the vector store.
 * Handles queuing, progress tracking, and incremental updates.
 */

import { Note } from '../types';
import { VectorStore } from './types';
import { EmbeddingService } from './embedding-service';
import { IndexingOptions, IndexingStatus } from './types';

export class VectorIndexingService {
  private queue: Note[] = [];
  private processing = false;
  private totalProcessed = 0;
  private lastError?: string;
  private abortController?: AbortController;

  constructor(
    private embeddingService: EmbeddingService,
    private vectorStore: VectorStore
  ) {}

  /**
   * Index a single note (adds to queue)
   */
  async indexNote(note: Note): Promise<void> {
    this.queue.push(note);

    if (!this.processing) {
      await this.processQueue();
    }
  }

  /**
   * Index all notes with progress tracking
   */
  async indexAllNotes(notes: Note[], options: IndexingOptions = {}): Promise<void> {
    const { batchSize = 10, onProgress, forceReindex = false } = options;

    this.processing = true;
    this.totalProcessed = 0;
    this.lastError = undefined;
    this.abortController = new AbortController();

    console.log(`Starting indexing of ${notes.length} notes...`);

    try {
      // Initialize embedder first
      await this.embeddingService.initialize();

      // Filter notes that need indexing
      const notesToIndex: Note[] = [];

      if (forceReindex) {
        notesToIndex.push(...notes);
      } else {
        // Check which notes need indexing
        for (const note of notes) {
          const hasEmbedding = await this.vectorStore.hasEmbedding(note.id);
          if (!hasEmbedding) {
            notesToIndex.push(note);
          }
        }
      }

      console.log(`${notesToIndex.length} notes need indexing`);

      // Process in batches
      for (let i = 0; i < notesToIndex.length; i += batchSize) {
        // Check if aborted
        if (this.abortController.signal.aborted) {
          console.log('Indexing aborted');
          break;
        }

        const batch = notesToIndex.slice(i, i + batchSize);

        // Process batch
        await this.processBatch(batch);

        this.totalProcessed += batch.length;

        // Report progress
        if (onProgress) {
          onProgress(this.totalProcessed, notesToIndex.length, batch[batch.length - 1]?.name);
        }

        // Log progress periodically
        if ((i + batchSize) % 50 === 0 || i + batchSize >= notesToIndex.length) {
          console.log(`Indexed ${this.totalProcessed}/${notesToIndex.length} notes`);
        }
      }

      console.log('Indexing complete!');
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      console.error('Indexing failed:', this.lastError);
      throw error;
    } finally {
      this.processing = false;
      this.abortController = undefined;
    }
  }

  /**
   * Process a batch of notes
   */
  private async processBatch(notes: Note[]): Promise<void> {
    const items = [];

    for (const note of notes) {
      try {
        // Generate embedding
        const embedding = await this.embeddingService.embedNote(note);

        // Prepare item for storage
        items.push({
          noteId: note.id,
          embedding,
          metadata: {
            title: note.name,
            tags: note.tags,
            folder: note.folder,
            updatedAt: note.updatedAt,
            wordCount: note.wordCount,
          },
        });
      } catch (error) {
        console.error(`Failed to embed note ${note.id}:`, error);
        // Continue with other notes
      }
    }

    // Batch add to vector store
    if (items.length > 0) {
      await this.vectorStore.batchAddEmbeddings(items);
    }
  }

  /**
   * Process the queue (for single-note additions)
   */
  private async processQueue(): Promise<void> {
    this.processing = true;

    try {
      // Initialize embedder if needed
      if (!this.embeddingService.isReady()) {
        await this.embeddingService.initialize();
      }

      while (this.queue.length > 0) {
        const note = this.queue.shift()!;

        try {
          const embedding = await this.embeddingService.embedNote(note);

          await this.vectorStore.addEmbedding(note.id, embedding, {
            title: note.name,
            tags: note.tags,
            folder: note.folder,
            updatedAt: note.updatedAt,
            wordCount: note.wordCount,
          });

          this.totalProcessed++;
        } catch (error) {
          this.lastError = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Failed to index note ${note.id}:`, error);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Update a note's embedding (when note is edited)
   */
  async updateNote(note: Note): Promise<void> {
    try {
      // Generate new embedding
      const embedding = await this.embeddingService.embedNote(note);

      // Update in vector store
      await this.vectorStore.updateEmbedding(note.id, embedding, {
        title: note.name,
        tags: note.tags,
        folder: note.folder,
        updatedAt: note.updatedAt,
        wordCount: note.wordCount,
      });
    } catch (error) {
      console.error(`Failed to update note ${note.id}:`, error);
      throw error;
    }
  }

  /**
   * Remove a note's embedding (when note is deleted)
   */
  async removeNote(noteId: string): Promise<void> {
    try {
      await this.vectorStore.removeEmbedding(noteId);
    } catch (error) {
      console.error(`Failed to remove note ${noteId}:`, error);
      throw error;
    }
  }

  /**
   * Abort ongoing indexing operation
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * Get current indexing status
   */
  getStatus(): IndexingStatus {
    return {
      isIndexing: this.processing,
      queueLength: this.queue.length,
      totalProcessed: this.totalProcessed,
      lastError: this.lastError,
    };
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Check if currently processing
   */
  isProcessing(): boolean {
    return this.processing;
  }

  /**
   * Clear the queue
   */
  clearQueue(): void {
    this.queue = [];
  }

  /**
   * Get total processed count
   */
  getTotalProcessed(): number {
    return this.totalProcessed;
  }

  /**
   * Reset processed counter
   */
  resetProcessedCount(): void {
    this.totalProcessed = 0;
  }
}
