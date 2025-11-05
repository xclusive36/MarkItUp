/**
 * Related Notes Component
 *
 * Shows notes that are semantically similar to the current active note.
 * Uses vector embeddings and cosine similarity to find related content.
 *
 * Features:
 * - Real-time similarity detection
 * - Visual similarity scores
 * - Quick navigation to related notes
 * - Dark mode support
 * - Loading and error states
 */

'use client';

import { useState, useEffect } from 'react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { Note } from '@/lib/types';
import { Sparkles, ChevronRight, Loader2, FileText, AlertCircle, X, RefreshCw } from 'lucide-react';
import { BrowserVectorStore } from '@/lib/vector/browser-vector-store';
import { EmbeddingService } from '@/lib/vector/embedding-service';
import { SimilarNote } from '@/lib/vector/types';

interface RelatedNotesProps {
  activeNote: Note | null;
  onNoteClick: (noteId: string) => void;
  onClose?: () => void;
  className?: string;
  maxResults?: number;
  minSimilarity?: number;
}

export default function RelatedNotes({
  activeNote,
  onNoteClick,
  onClose,
  className = '',
  maxResults = 5,
  minSimilarity = 0.5,
}: RelatedNotesProps) {
  const { theme } = useSimpleTheme();
  const [relatedNotes, setRelatedNotes] = useState<SimilarNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vectorStore, setVectorStore] = useState<BrowserVectorStore | null>(null);
  const [embeddingService, setEmbeddingService] = useState<EmbeddingService | null>(null);

  /**
   * Initialize vector services
   */
  useEffect(() => {
    const initServices = async () => {
      try {
        const store = new BrowserVectorStore();
        await store.initialize();
        setVectorStore(store);

        const service = new EmbeddingService({
          provider: 'local',
          model: 'Xenova/all-MiniLM-L6-v2',
        });
        await service.initialize();
        setEmbeddingService(service);
      } catch (err) {
        console.error('[RelatedNotes] Failed to initialize services:', err);
        setError('Failed to initialize vector search');
      }
    };

    initServices();

    return () => {
      if (vectorStore) {
        vectorStore.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Find related notes when active note changes
   */
  useEffect(() => {
    if (!activeNote || !vectorStore || !embeddingService) {
      setRelatedNotes([]);
      return;
    }

    const findRelated = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Generate embedding for the active note
        const embedding = await embeddingService.embedNote(activeNote);

        // Find similar notes
        const similar = await vectorStore.findSimilar(embedding, {
          limit: maxResults + 1, // +1 because we'll filter out the active note
          threshold: minSimilarity,
          excludeIds: [activeNote.id], // Exclude the active note itself
        });

        setRelatedNotes(similar);
      } catch (err) {
        console.error('[RelatedNotes] Failed to find related notes:', err);
        setError('Failed to find related notes');
      } finally {
        setIsLoading(false);
      }
    };

    findRelated();
  }, [activeNote, vectorStore, embeddingService, maxResults, minSimilarity]);

  /**
   * Manual refresh
   */
  const handleRefresh = async () => {
    if (!activeNote || !vectorStore || !embeddingService) return;

    setIsLoading(true);
    setError(null);

    try {
      const embedding = await embeddingService.embedNote(activeNote);
      const similar = await vectorStore.findSimilar(embedding, {
        limit: maxResults + 1,
        threshold: minSimilarity,
        excludeIds: [activeNote.id],
      });
      setRelatedNotes(similar);
    } catch (err) {
      console.error('[RelatedNotes] Refresh failed:', err);
      setError('Failed to refresh');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get similarity color based on score
   */
  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 0.8) return 'text-green-600 dark:text-green-400';
    if (similarity >= 0.6) return 'text-blue-600 dark:text-blue-400';
    if (similarity >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  /**
   * Get similarity label
   */
  const getSimilarityLabel = (similarity: number): string => {
    if (similarity >= 0.8) return 'Very Similar';
    if (similarity >= 0.6) return 'Similar';
    if (similarity >= 0.4) return 'Somewhat Similar';
    return 'Loosely Related';
  };

  /**
   * Format similarity percentage
   */
  const formatSimilarity = (similarity: number): string => {
    return `${Math.round(similarity * 100)}%`;
  };

  if (!activeNote) {
    return (
      <div
        className={`${className} ${
          theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
        } rounded-lg border ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        } p-6 text-center`}
      >
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm">Open a note to see related notes</p>
      </div>
    );
  }

  return (
    <div
      className={`${className} ${
        theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
      } rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`px-4 py-3 border-b ${
          theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
        } flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h3 className="font-semibold text-sm">Related Notes</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Loading State */}
        {isLoading && relatedNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Finding related notes...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && relatedNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="w-8 h-8 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No related notes found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Save more notes or try lowering the similarity threshold
            </p>
          </div>
        )}

        {/* Related Notes List */}
        {!isLoading && !error && relatedNotes.length > 0 && (
          <div className="space-y-2">
            {relatedNotes.slice(0, maxResults).map(note => (
              <button
                key={note.noteId}
                onClick={() => onNoteClick(note.noteId)}
                className={`w-full text-left p-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'border-gray-700 hover:border-purple-500 hover:bg-gray-750'
                    : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                } transition-all group`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 flex-shrink-0 text-gray-400" />
                      <h4 className="font-medium text-sm truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {note.metadata.title}
                      </h4>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {note.metadata.folder && (
                        <span className="truncate">📁 {note.metadata.folder}</span>
                      )}
                      {note.metadata.wordCount && <span>• {note.metadata.wordCount} words</span>}
                    </div>

                    {/* Tags */}
                    {note.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.metadata.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className={`text-xs px-2 py-0.5 rounded ${
                              theme === 'dark'
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                        {note.metadata.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{note.metadata.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Similarity Score */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                          style={{ width: `${note.similarity * 100}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${getSimilarityColor(note.similarity)}`}
                      >
                        {formatSimilarity(note.similarity)}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${getSimilarityColor(note.similarity)}`}>
                      {getSimilarityLabel(note.similarity)}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Info Text */}
        {relatedNotes.length > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            Showing {Math.min(relatedNotes.length, maxResults)} of {relatedNotes.length} related
            notes
          </p>
        )}
      </div>
    </div>
  );
}
