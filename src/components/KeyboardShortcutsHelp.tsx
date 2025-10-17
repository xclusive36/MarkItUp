'use client';

import { X, Keyboard } from 'lucide-react';
import { getShortcutLabel } from '@/hooks/useKeyboardShortcuts';

interface ShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  {
    category: 'General',
    items: [
      { keys: { meta: true, key: 's' }, description: 'Save current note' },
      { keys: { meta: true, key: 'n' }, description: 'Create new note' },
      { keys: { meta: true, key: 'k' }, description: 'Open command palette' },
      { keys: { key: '?' }, description: 'Show keyboard shortcuts' },
      { keys: { key: 'Escape' }, description: 'Close dialogs/panels' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { keys: { meta: true, key: 'f' }, description: 'Search notes' },
      { keys: { meta: true, key: 'g' }, description: 'Open graph view' },
      { keys: { meta: true, key: 'b' }, description: 'Toggle sidebar' },
      { keys: { meta: true, key: 'e' }, description: 'Toggle editor mode' },
    ],
  },
  {
    category: 'AI Features',
    items: [
      { keys: { meta: true, key: 'i' }, description: 'Open AI chat' },
      { keys: { meta: true, shift: true, key: 'a' }, description: 'Writing assistant' },
      { keys: { meta: true, shift: true, key: 'k' }, description: 'Knowledge discovery' },
      { keys: { meta: true, shift: true, key: 'r' }, description: 'Research assistant' },
    ],
  },
  {
    category: 'Editing',
    items: [
      { keys: { meta: true, key: 'z' }, description: 'Undo' },
      { keys: { meta: true, shift: true, key: 'z' }, description: 'Redo' },
      { keys: { meta: true, key: 'b' }, description: 'Bold (WYSIWYG mode)' },
      { keys: { meta: true, key: 'i' }, description: 'Italic (WYSIWYG mode)' },
    ],
  },
];

export function KeyboardShortcutsHelp({ isOpen, onClose }: ShortcutHelpProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="space-y-6">
            {shortcuts.map(section => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {item.description}
                      </span>
                      <kbd className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                        {getShortcutLabel(item.keys)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Tip */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-semibold">Tip:</span> Press{' '}
              <kbd className="px-2 py-0.5 text-xs font-semibold bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-700 rounded">
                ?
              </kbd>{' '}
              anytime to view this help dialog.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
