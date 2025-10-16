'use client';

import React, { useState } from 'react';

export interface SuggestionHistoryEntry {
  id: string;
  timestamp: number;
  action: 'accepted' | 'rejected';
  sourceNoteId: string;
  sourceNoteName: string;
  targetNoteId: string;
  targetNoteName: string;
  confidence: number;
  reason: string;
  insertedAt?: string; // Position where link was inserted (for undo)
}

interface SuggestionHistoryPanelProps {
  history: SuggestionHistoryEntry[];
  onUndo: (entry: SuggestionHistoryEntry) => Promise<void>;
  onClearHistory: () => void;
  onClose: () => void;
}

export default function SuggestionHistoryPanel({
  history,
  onUndo,
  onClearHistory,
  onClose,
}: SuggestionHistoryPanelProps) {
  const [undoingId, setUndoingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'rejected'>('all');

  const handleUndo = async (entry: SuggestionHistoryEntry) => {
    setUndoingId(entry.id);
    try {
      await onUndo(entry);
    } finally {
      setUndoingId(null);
    }
  };

  const filteredHistory = history.filter(entry => {
    if (filter === 'all') return true;
    return entry.action === filter;
  });

  const stats = {
    total: history.length,
    accepted: history.filter(e => e.action === 'accepted').length,
    rejected: history.filter(e => e.action === 'rejected').length,
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📜 Suggestion History
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Review and undo past link suggestions
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-700 dark:text-gray-300">
                <strong>{stats.total}</strong> total decisions
              </span>
              <span className="text-green-600 dark:text-green-400">
                <strong>{stats.accepted}</strong> accepted
              </span>
              <span className="text-red-600 dark:text-red-400">
                <strong>{stats.rejected}</strong> rejected
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('accepted')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === 'accepted'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {filter === 'all'
                  ? 'No history yet. Make some link suggestions to see them here!'
                  : `No ${filter} suggestions in history.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(entry => (
                  <div
                    key={entry.id}
                    className={`border rounded-lg p-4 transition-all ${
                      entry.action === 'accepted'
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${
                              entry.action === 'accepted'
                                ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                                : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                            }`}
                          >
                            {entry.action === 'accepted' ? '✓ ACCEPTED' : '✗ REJECTED'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>

                        <div className="mb-2">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">
                            In &quot;{entry.sourceNoteName}&quot; →{' '}
                            <span className="text-blue-600 dark:text-blue-400">
                              [[{entry.targetNoteName}]]
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Confidence: {(entry.confidence * 100).toFixed(0)}%
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {'⭐'.repeat(Math.ceil(entry.confidence * 5))}
                          </span>
                        </div>

                        <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                          &quot;{entry.reason}&quot;
                        </p>
                      </div>

                      {/* Undo Button (only for accepted) */}
                      {entry.action === 'accepted' && (
                        <button
                          onClick={() => handleUndo(entry)}
                          disabled={undoingId === entry.id}
                          className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded text-sm font-medium transition-colors whitespace-nowrap"
                        >
                          {undoingId === entry.id ? '⏳ Undoing...' : '↶ Undo'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            💡 Undo removes the wikilink from your note
          </div>
          <div className="flex gap-3">
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all history? This cannot be undone.')) {
                    onClearHistory();
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
              >
                Clear History
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
