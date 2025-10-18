/**
 * Auto-Indexing Hook for Vector Search
 *
 * This hook monitors file save events and automatically triggers
 * incremental reindexing when markdown files are created or updated.
 *
 * Features:
 * - Detects file save events
 * - Queues notes for incremental reindexing
 * - Debounces rapid updates
 * - Respects user's auto-index setting
 * - Provides status feedback
 */

import { useEffect, useRef, useCallback } from 'react';
import { Note } from '@/lib/types';
import { BrowserVectorStore } from '@/lib/vector/browser-vector-store';
import { EmbeddingService } from '@/lib/vector/embedding-service';
import { VectorIndexingService } from '@/lib/vector/indexing-service';

interface AutoIndexingOptions {
  enabled?: boolean;
  debounceMs?: number;
  onIndexStart?: (noteId: string) => void;
  onIndexComplete?: (noteId: string) => void;
  onIndexError?: (noteId: string, error: Error) => void;
}

interface AutoIndexingStatus {
  isEnabled: boolean;
  isIndexing: boolean;
  queueLength: number;
  lastIndexed?: string;
  lastError?: string;
}

/**
 * Hook to enable automatic reindexing when files are saved
 */
export function useAutoIndexing(options: AutoIndexingOptions = {}) {
  const {
    enabled = false,
    debounceMs = 2000,
    onIndexStart,
    onIndexComplete,
    onIndexError,
  } = options;

  const vectorStoreRef = useRef<BrowserVectorStore | null>(null);
  const indexingServiceRef = useRef<VectorIndexingService | null>(null);
  const debounceTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
  const statusRef = useRef<AutoIndexingStatus>({
    isEnabled: enabled,
    isIndexing: false,
    queueLength: 0,
  });

  /**
   * Initialize vector services
   */
  useEffect(() => {
    if (!enabled) return;

    const initServices = async () => {
      try {
        // Initialize vector store
        vectorStoreRef.current = new BrowserVectorStore();
        await vectorStoreRef.current.initialize();

        // Initialize embedder and indexing service
        const embeddingService = new EmbeddingService({
          provider: 'local',
          model: 'Xenova/all-MiniLM-L6-v2',
        });

        indexingServiceRef.current = new VectorIndexingService(
          embeddingService,
          vectorStoreRef.current
        );

        console.log('[AutoIndexing] Services initialized');
      } catch (error) {
        console.error('[AutoIndexing] Failed to initialize services:', error);
        statusRef.current.lastError = error instanceof Error ? error.message : 'Unknown error';
      }
    };

    initServices();

    // Cleanup on unmount
    return () => {
      if (vectorStoreRef.current) {
        vectorStoreRef.current.close();
      }
    };
  }, [enabled]);

  /**
   * Index a single note with debouncing
   */
  const indexNote = useCallback(
    async (note: Note) => {
      if (!enabled || !indexingServiceRef.current) {
        return;
      }

      // Clear existing debounce timer for this note
      if (debounceTimerRef.current[note.id]) {
        clearTimeout(debounceTimerRef.current[note.id]);
      }

      // Set new debounce timer
      debounceTimerRef.current[note.id] = setTimeout(async () => {
        try {
          statusRef.current.isIndexing = true;
          statusRef.current.queueLength++;

          console.log(`[AutoIndexing] Indexing note: ${note.name}`);
          onIndexStart?.(note.id);

          await indexingServiceRef.current!.updateNote(note);

          statusRef.current.lastIndexed = note.id;
          statusRef.current.queueLength--;
          statusRef.current.isIndexing = statusRef.current.queueLength > 0;

          console.log(`[AutoIndexing] Completed indexing: ${note.name}`);
          onIndexComplete?.(note.id);
        } catch (error) {
          statusRef.current.queueLength--;
          statusRef.current.isIndexing = statusRef.current.queueLength > 0;
          statusRef.current.lastError = error instanceof Error ? error.message : 'Unknown error';

          console.error(`[AutoIndexing] Failed to index note ${note.id}:`, error);
          onIndexError?.(note.id, error as Error);
        } finally {
          delete debounceTimerRef.current[note.id];
        }
      }, debounceMs);
    },
    [enabled, debounceMs, onIndexStart, onIndexComplete, onIndexError]
  );

  /**
   * Remove a note from the index
   */
  const removeNote = useCallback(
    async (noteId: string) => {
      if (!enabled || !indexingServiceRef.current) {
        return;
      }

      try {
        console.log(`[AutoIndexing] Removing note: ${noteId}`);
        await indexingServiceRef.current.removeNote(noteId);
      } catch (error) {
        console.error(`[AutoIndexing] Failed to remove note ${noteId}:`, error);
        statusRef.current.lastError = error instanceof Error ? error.message : 'Unknown error';
      }
    },
    [enabled]
  );

  /**
   * Get current status
   */
  const getStatus = useCallback((): AutoIndexingStatus => {
    return { ...statusRef.current };
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    statusRef.current.lastError = undefined;
  }, []);

  return {
    indexNote,
    removeNote,
    getStatus,
    clearError,
    isEnabled: enabled,
  };
}
