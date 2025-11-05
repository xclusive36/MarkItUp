'use client';

import { useState } from 'react';

interface ExpansionPreviewPanelProps {
  original: string;
  expanded: string;
  wordCount: { before: number; after: number };
  type: 'expand' | 'compress' | 'expandMore' | 'section' | 'draft';
  onAccept: (finalText?: string) => void;
  onReject: () => void;
  onClose: () => void;
}

export default function ExpansionPreviewPanel({
  original,
  expanded,
  wordCount,
  type,
  onAccept,
  onReject,
  onClose,
}: ExpansionPreviewPanelProps) {
  const [editedText, setEditedText] = useState(expanded);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'diff'>('side-by-side');

  const increase = (((wordCount.after - wordCount.before) / wordCount.before) * 100).toFixed(0);
  const isIncrease = wordCount.after > wordCount.before;

  const getTypeLabel = () => {
    switch (type) {
      case 'expand':
        return '✨ Bullet Point Expansion';
      case 'compress':
        return '📝 Compression to Bullets';
      case 'expandMore':
        return '🔍 Progressive Expansion';
      case 'section':
        return '📄 Section Expansion';
      case 'draft':
        return '📖 Draft Generation';
      default:
        return 'Preview';
    }
  };

  const getTypeIcon = () => {
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
        return '👁';
    }
  };

  const handleAccept = () => {
    onAccept(isEditing ? editedText : expanded);
  };

  const currentWordCount = isEditing
    ? editedText
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 0).length
    : wordCount.after;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getTypeIcon()} Preview Changes
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getTypeLabel()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Stats & Controls */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-700 dark:text-gray-300">
                <strong>{wordCount.before}</strong> → <strong>{currentWordCount}</strong> words
              </span>
              <span
                className={
                  isIncrease
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }
              >
                <strong>
                  {isIncrease ? '+' : ''}
                  {increase}%
                </strong>{' '}
                change
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'side-by-side'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Side by Side
              </button>
              <button
                onClick={() => setViewMode('diff')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'diff'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Full View
              </button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'side-by-side' ? (
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Original */}
              <div className="flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    📄 Original
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {wordCount.before} words
                  </span>
                </div>
                <div className="flex-1 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg overflow-y-auto">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                    {original}
                  </pre>
                </div>
              </div>

              {/* Expanded */}
              <div className="flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {isEditing ? '✏️ Edited Version' : '✨ Expanded Version'}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {currentWordCount} words
                  </span>
                </div>
                {isEditing ? (
                  <textarea
                    value={editedText}
                    onChange={e => setEditedText(e.target.value)}
                    className="flex-1 p-4 bg-white dark:bg-gray-900 border border-blue-300 dark:border-blue-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-sans resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex-1 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg overflow-y-auto">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                      {expanded}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Original Section */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    📄 Original ({wordCount.before} words)
                  </h3>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                    {original}
                  </pre>
                </div>
              </div>

              {/* Arrow */}
              <div className="text-center text-2xl text-gray-400">↓</div>

              {/* Expanded Section */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {isEditing
                      ? `✏️ Edited Version (${currentWordCount} words)`
                      : `✨ Expanded Version (${wordCount.after} words)`}
                  </h3>
                </div>
                {isEditing ? (
                  <textarea
                    value={editedText}
                    onChange={e => setEditedText(e.target.value)}
                    rows={15}
                    className="w-full p-4 bg-white dark:bg-gray-900 border border-blue-300 dark:border-blue-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-sans resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                      {expanded}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              {isEditing ? '👁 Preview' : '✏️ Edit'}
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {isEditing ? 'Make changes before accepting' : 'Click Edit to modify the result'}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onReject}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
            >
              ✗ Reject
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
            >
              ✓ Accept{isEditing ? ' Changes' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
