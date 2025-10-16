'use client';

import React, { useState } from 'react';

export interface LinkSuggestion {
  noteId: string;
  noteName: string;
  reason: string;
  confidence: number;
  isBidirectional?: boolean;
  context?: string; // NEW: Text excerpt showing where the link would be inserted
}

interface LinkSuggestionsPanelProps {
  noteName: string;
  suggestions: LinkSuggestion[];
  onAccept: (suggestion: LinkSuggestion) => void;
  onReject: (suggestion: LinkSuggestion) => void;
  onAcceptAll: () => void;
  onClose: () => void;
  onPreview?: (noteId: string) => Promise<string>;
}

export default function LinkSuggestionsPanel({
  noteName,
  suggestions,
  onAccept,
  onReject,
  onAcceptAll,
  onClose,
  onPreview,
}: LinkSuggestionsPanelProps) {
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set());
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());
  const [previewNoteId, setPreviewNoteId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const handleAccept = (suggestion: LinkSuggestion) => {
    setAcceptedSuggestions(prev => new Set(prev).add(suggestion.noteId));
    setRejectedSuggestions(prev => {
      const next = new Set(prev);
      next.delete(suggestion.noteId);
      return next;
    });
    onAccept(suggestion);
  };

  const handleReject = (suggestion: LinkSuggestion) => {
    setRejectedSuggestions(prev => new Set(prev).add(suggestion.noteId));
    setAcceptedSuggestions(prev => {
      const next = new Set(prev);
      next.delete(suggestion.noteId);
      return next;
    });
    onReject(suggestion);
  };

  const handlePreview = async (noteId: string) => {
    if (!onPreview) return;

    if (previewNoteId === noteId) {
      setPreviewNoteId(null);
      setPreviewContent('');
      return;
    }

    setIsLoadingPreview(true);
    setPreviewNoteId(noteId);
    try {
      const content = await onPreview(noteId);
      setPreviewContent(content);
    } catch {
      setPreviewContent('Failed to load preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.7) return 'text-blue-600 dark:text-blue-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getConfidenceStars = (confidence: number) => {
    return '⭐'.repeat(Math.ceil(confidence * 5));
  };

  const activeSuggestions = suggestions.filter(
    s => !acceptedSuggestions.has(s.noteId) && !rejectedSuggestions.has(s.noteId)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🔗 Link Suggestions
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              for &quot;{noteName}&quot;
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              <strong>{suggestions.length}</strong> suggestions found
            </span>
            <span className="text-green-600 dark:text-green-400">
              <strong>{acceptedSuggestions.size}</strong> accepted
            </span>
            <span className="text-red-600 dark:text-red-400">
              <strong>{rejectedSuggestions.size}</strong> rejected
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              <strong>{suggestions.filter(s => s.isBidirectional).length}</strong> bidirectional
            </span>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {acceptedSuggestions.size > 0 || rejectedSuggestions.size > 0
                  ? '✅ All suggestions reviewed!'
                  : 'No suggestions available'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.noteId}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {index + 1}. [[{suggestion.noteName}]]
                        </span>
                        {suggestion.isBidirectional && (
                          <span
                            className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                            title="This note already links back to you"
                          >
                            ↔️ Bidirectional
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}
                        >
                          {getConfidenceStars(suggestion.confidence)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {(suggestion.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        <strong>Reason:</strong> {suggestion.reason}
                      </p>

                      {/* Context Visualization - NEW FEATURE! */}
                      {suggestion.context && (
                        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">
                            💡 LINK CONTEXT:
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                            &quot;...{suggestion.context}...&quot;
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            → Would link to [[{suggestion.noteName}]]
                          </p>
                        </div>
                      )}

                      {/* Preview Section */}
                      {previewNoteId === suggestion.noteId && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            PREVIEW:
                          </p>
                          {isLoadingPreview ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Loading preview...
                            </p>
                          ) : (
                            <div className="text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
                              {previewContent.slice(0, 300)}
                              {previewContent.length > 300 && '...'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAccept(suggestion)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleReject(suggestion)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        ✗ Reject
                      </button>
                      {onPreview && (
                        <button
                          onClick={() => handlePreview(suggestion.noteId)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                        >
                          👁 {previewNoteId === suggestion.noteId ? 'Hide' : 'Preview'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            💡 Higher confidence = stronger connection
          </div>
          <div className="flex gap-3">
            {activeSuggestions.length > 0 && (
              <button
                onClick={onAcceptAll}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
              >
                Accept All Remaining ({activeSuggestions.length})
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
            >
              {acceptedSuggestions.size > 0 ? 'Done' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
