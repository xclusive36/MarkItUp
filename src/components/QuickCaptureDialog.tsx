'use client';

import React, { useState } from 'react';

interface QuickCaptureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (content: string, addTimestamp: boolean) => void;
}

export default function QuickCaptureDialog({
  isOpen,
  onClose,
  onCapture,
}: QuickCaptureDialogProps) {
  const [content, setContent] = useState('');
  const [addTimestamp, setAddTimestamp] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onCapture(content, addTimestamp);
      setContent('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
    // Escape to close
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <h2 className="text-xl font-bold text-white">Quick Capture</h2>
                <p className="text-sm text-blue-100">Add to today&apos;s note instantly</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl leading-none p-1"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <textarea
              autoFocus
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind? Type your thoughts here..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500
                       resize-none transition-all"
              rows={6}
            />
          </div>

          {/* Options */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={addTimestamp}
                onChange={e => setAddTimestamp(e.target.checked)}
                className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span>Add timestamp</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs">
                ({new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Cmd/Ctrl + Enter</kbd>
              <span className="ml-1">to save</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg 
                         hover:from-blue-600 hover:to-purple-600 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 font-medium shadow-lg"
              >
                Capture
              </button>
            </div>
          </div>
        </form>

        {/* Shortcuts hint */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>💡 Tip: Use Ctrl+Shift+Q anytime to quick capture</span>
          </div>
        </div>
      </div>
    </div>
  );
}
