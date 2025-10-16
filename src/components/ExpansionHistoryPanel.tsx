'use client';

import React, { useState } from 'react';

export interface ExpansionHistoryEntry {
  id: string;
  timestamp: number;
  type: 'expand' | 'compress' | 'expandMore' | 'section' | 'draft';
  noteName: string;
  beforeText: string;
  afterText: string;
  wordCountBefore: number;
  wordCountAfter: number;
}

interface ExpansionHistoryPanelProps {
  history: ExpansionHistoryEntry[];
  onUndo: (entry: ExpansionHistoryEntry) => Promise<void>;
  onClearHistory: () => void;
  onClose: () => void;
}

export default function ExpansionHistoryPanel({
  history,
  onUndo,
  onClearHistory,
  onClose,
}: ExpansionHistoryPanelProps) {
  const [undoingId, setUndoingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'expand' | 'compress'>('all');
  const [selectedEntry, setSelectedEntry] = useState<ExpansionHistoryEntry | null>(null);

  const handleUndo = async (entry: ExpansionHistoryEntry) => {
    setUndoingId(entry.id);
    try {
      await onUndo(entry);
    } finally {
      setUndoingId(null);
    }
  };

  // Removed unused handleRedo - can be added back if needed

  const filteredHistory = history.filter(entry => {
    if (filter === 'all') return true;
    if (filter === 'expand')
      return ['expand', 'expandMore', 'section', 'draft'].includes(entry.type);
    if (filter === 'compress') return entry.type === 'compress';
    return true;
  });

  const stats = {
    total: history.length,
    expansions: history.filter(e => ['expand', 'expandMore', 'section', 'draft'].includes(e.type))
      .length,
    compressions: history.filter(e => e.type === 'compress').length,
    totalWordsAdded: history.reduce((sum, e) => sum + (e.wordCountAfter - e.wordCountBefore), 0),
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'expand':
        return '✨';
      case 'compress':
        return '📝';
      case 'expandMore':
        return '🔍';
      case 'section':
        return '📄';
      case 'draft':
        return '📖';
      default:
        return '📌';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'expand':
        return 'Bullet Expansion';
      case 'compress':
        return 'Compression';
      case 'expandMore':
        return 'Progressive Expansion';
      case 'section':
        return 'Section Expansion';
      case 'draft':
        return 'Draft Generation';
      default:
        return 'Transformation';
    }
  };

  const getWordChangeDisplay = (entry: ExpansionHistoryEntry) => {
    const diff = entry.wordCountAfter - entry.wordCountBefore;
    const isIncrease = diff > 0;
    const percent = Math.abs((diff / entry.wordCountBefore) * 100).toFixed(0);

    return {
      diff,
      isIncrease,
      percent,
      color: isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📜 Expansion History
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Review and undo past content transformations
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
                <strong>{stats.total}</strong> transformations
              </span>
              <span className="text-green-600 dark:text-green-400">
                <strong>{stats.expansions}</strong> expansions
              </span>
              <span className="text-red-600 dark:text-red-400">
                <strong>{stats.compressions}</strong> compressions
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                <strong>
                  {stats.totalWordsAdded > 0 ? '+' : ''}
                  {stats.totalWordsAdded}
                </strong>{' '}
                total words
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
                onClick={() => setFilter('expand')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === 'expand'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Expansions
              </button>
              <button
                onClick={() => setFilter('compress')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === 'compress'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Compressions
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
                  ? 'No history yet. Start expanding or compressing content to see history here!'
                  : `No ${filter} operations in history.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(entry => {
                  const wordChange = getWordChangeDisplay(entry);
                  const isSelected = selectedEntry?.id === entry.id;

                  return (
                    <div key={entry.id}>
                      <div
                        onClick={() => setSelectedEntry(isSelected ? null : entry)}
                        className={`border rounded-lg p-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{getTypeIcon(entry.type)}</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {getTypeLabel(entry.type)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                in &quot;{entry.noteName}&quot;
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(entry.timestamp)}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                {entry.wordCountBefore} → {entry.wordCountAfter} words
                              </span>
                              <span className={`font-medium ${wordChange.color}`}>
                                {wordChange.isIncrease ? '+' : ''}
                                {wordChange.diff} words ({wordChange.isIncrease ? '+' : '-'}
                                {wordChange.percent}%)
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleUndo(entry);
                              }}
                              disabled={undoingId === entry.id}
                              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded text-sm font-medium transition-colors whitespace-nowrap"
                            >
                              {undoingId === entry.id ? '⏳' : '↶'} Undo
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedEntry(isSelected ? null : entry);
                              }}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                            >
                              {isSelected ? 'Hide' : 'View'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Detail */}
                      {isSelected && (
                        <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                📄 Before ({entry.wordCountBefore} words):
                              </h4>
                              <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded max-h-48 overflow-y-auto">
                                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                                  {entry.beforeText.substring(0, 500)}
                                  {entry.beforeText.length > 500 && '...'}
                                </pre>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                ✨ After ({entry.wordCountAfter} words):
                              </h4>
                              <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded max-h-48 overflow-y-auto">
                                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                                  {entry.afterText.substring(0, 500)}
                                  {entry.afterText.length > 500 && '...'}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            💡 Click any entry to view details • Undo restores the original text
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
