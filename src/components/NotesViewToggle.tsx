'use client';

import React from 'react';
import { List, Grid3x3, Rows3 } from 'lucide-react';

export type NotesViewMode = 'list' | 'grid' | 'compact';

interface NotesViewToggleProps {
  view: NotesViewMode;
  onViewChange: (view: NotesViewMode) => void;
  theme?: string;
}

const NotesViewToggle: React.FC<NotesViewToggleProps> = ({
  view,
  onViewChange,
  theme = 'light',
}) => {
  const views: Array<{ id: NotesViewMode; icon: React.ReactNode; label: string }> = [
    { id: 'list', icon: <List className="w-4 h-4" />, label: 'List view' },
    { id: 'grid', icon: <Grid3x3 className="w-4 h-4" />, label: 'Grid view' },
    { id: 'compact', icon: <Rows3 className="w-4 h-4" />, label: 'Compact view' },
  ];

  return (
    <div
      className="inline-flex rounded-lg border"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {views.map(v => (
        <button
          key={v.id}
          onClick={() => onViewChange(v.id)}
          className={`p-2 transition-all ${
            view === v.id
              ? 'bg-blue-600 text-white'
              : theme === 'dark'
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
          } ${v.id === 'list' ? 'rounded-l-lg' : ''} ${v.id === 'compact' ? 'rounded-r-lg' : ''}`}
          title={v.label}
          aria-label={v.label}
          aria-pressed={view === v.id}
        >
          {v.icon}
        </button>
      ))}
    </div>
  );
};

export default NotesViewToggle;
