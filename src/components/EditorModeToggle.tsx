import React from 'react';

interface EditorModeToggleProps {
  viewMode: 'edit' | 'preview' | 'split';
  setViewMode: (v: 'edit' | 'preview' | 'split') => void;
  theme: string;
  onModeChange?: (mode: 'edit' | 'preview' | 'split') => void;
}

const modes: Array<{ key: 'edit' | 'preview' | 'split'; label: string }> = [
  { key: 'edit', label: 'Edit' },
  { key: 'preview', label: 'Preview' },
  { key: 'split', label: 'Split' },
];

const EditorModeToggle: React.FC<EditorModeToggleProps> = ({
  viewMode,
  setViewMode,
  theme,
  onModeChange,
}) => (
  <div
    className="inline-flex gap-2 p-1 rounded-lg shadow-sm"
    style={{
      background: 'transparent',
      boxShadow: theme === 'dark' ? '0 1px 4px rgba(0,0,0,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
    }}
  >
    {modes.map(({ key, label }) => (
      <button
        key={key}
        onClick={() => {
          setViewMode(key);
          onModeChange?.(key);
        }}
        className={`px-3 py-1 text-xs rounded-md transition-colors shadow-sm font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
          viewMode === key
            ? theme === 'dark'
              ? 'bg-gray-600 text-gray-100 border border-blue-500'
              : 'bg-white text-gray-900 border border-blue-500'
            : theme === 'dark'
              ? 'bg-transparent text-gray-300 border border-transparent hover:bg-gray-700 hover:text-white'
              : 'bg-transparent text-gray-500 border border-transparent hover:bg-gray-100 hover:text-gray-900'
        }`}
        style={{ minWidth: 70 }}
      >
        {label}
      </button>
    ))}
  </div>
);

export default EditorModeToggle;
