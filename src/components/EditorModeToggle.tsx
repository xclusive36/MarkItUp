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
  // theme, // No longer needed - using CSS variables
  onModeChange,
}) => (
  <div
    className="inline-flex gap-2 p-1 rounded-lg shadow-sm"
    style={{
      background: 'transparent',
      boxShadow: 'var(--theme-shadow, 0 1px 4px rgba(0,0,0,0.1))',
    }}
  >
    {modes.map(({ key, label }) => (
      <button
        key={key}
        onClick={() => {
          setViewMode(key);
          onModeChange?.(key);
        }}
        className="px-3 py-1 text-xs rounded-md transition-colors shadow-sm font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          minWidth: 70,
          backgroundColor: viewMode === key ? 'var(--bg-secondary)' : 'transparent',
          color: viewMode === key ? 'var(--text-primary)' : 'var(--text-secondary)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: viewMode === key ? 'var(--accent-primary)' : 'transparent',
        }}
        onMouseEnter={e => {
          if (viewMode !== key) {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={e => {
          if (viewMode !== key) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
      >
        {label}
      </button>
    ))}
  </div>
);

export default EditorModeToggle;
