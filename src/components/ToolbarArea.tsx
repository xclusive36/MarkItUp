'use client';

import React from 'react';
import { Save, Eye, Edit, Columns } from 'lucide-react';

interface ToolbarAreaProps {
  onSave: () => void;
  viewMode: 'edit' | 'preview' | 'split';
  onViewModeChange: (mode: 'edit' | 'preview' | 'split') => void;
  isSaving?: boolean;
  canSave?: boolean;
  theme?: 'light' | 'dark';
  isLeftSidebarCollapsed?: boolean;
}

export default function ToolbarArea({
  onSave,
  viewMode,
  onViewModeChange,
  isSaving = false,
  canSave = true,
  theme = 'light',
  isLeftSidebarCollapsed = false,
}: ToolbarAreaProps) {
  const viewModes = [
    { id: 'edit', label: 'Edit', icon: Edit, shortcut: 'Cmd+E' },
    { id: 'preview', label: 'Preview', icon: Eye, shortcut: 'Cmd+P' },
    { id: 'split', label: 'Split', icon: Columns, shortcut: 'Cmd+\\' },
  ] as const;

  return (
    <div
      className="border-b px-4 py-2 flex items-center justify-between"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
        paddingLeft: isLeftSidebarCollapsed ? '4rem' : '1rem', // Extra padding to avoid overlap with collapsed left sidebar
        paddingRight: '4rem', // Extra padding to avoid overlap with collapsed right panel
      }}
    >
      {/* Left: Primary Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={!canSave || isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
            color: '#ffffff',
          }}
          title="Save note (Cmd+S)"
        >
          <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>

      {/* Right: View Mode Toggle */}
      <div
        className="flex items-center rounded-lg border overflow-hidden"
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        }}
      >
        {viewModes.map(mode => {
          const Icon = mode.icon;
          const isActive = viewMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onViewModeChange(mode.id)}
              className="flex items-center gap-2 px-3 py-1.5 transition-all duration-200 border-r last:border-r-0"
              style={{
                backgroundColor: isActive
                  ? theme === 'dark'
                    ? '#3b82f6'
                    : '#2563eb'
                  : 'transparent',
                color: isActive ? '#ffffff' : theme === 'dark' ? '#9ca3af' : '#6b7280',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              }}
              title={`${mode.label} mode (${mode.shortcut})`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline text-sm font-medium">{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
