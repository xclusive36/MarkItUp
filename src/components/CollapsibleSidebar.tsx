'use client';

import React, { useState, useEffect } from 'react';
import { PanelLeftOpen, ChevronLeft } from 'lucide-react';
import Sidebar from './Sidebar';
import { Note, Tag } from '@/lib/types';

interface CollapsibleSidebarProps {
  // Sidebar props pass-through
  fileName: string;
  setFileName: (v: string) => void;
  folder: string;
  setFolder: (v: string) => void;
  createNewNote: () => void;
  graphStats: {
    totalNotes: number;
    totalLinks: number;
    avgConnections: number;
    maxConnections: number;
    orphanCount: number;
  };
  tags: Tag[];
  currentView: string;
  handleSearch: (query: string) => void;
  handleNoteSelect: (id: string) => void;
  notes: Note[];
  activeNote: Note | null;
  deleteNote: (id: string) => void;
  theme: string;
  onReorderNotes?: (notes: Note[]) => void;

  // Collapse control (optional - for external control)
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  isCollapsed: externalIsCollapsed,
  onToggleCollapse: externalOnToggle,
  ...sidebarProps
}) => {
  // Internal state (if not controlled externally)
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);

  // Use external state if provided, otherwise use internal
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;

  // Load collapse state from localStorage on mount
  useEffect(() => {
    if (externalIsCollapsed === undefined) {
      const saved = localStorage.getItem('left-sidebar-collapsed');
      if (saved !== null) {
        setInternalIsCollapsed(saved === 'true');
      }
    }
  }, [externalIsCollapsed]);

  // Save collapse state to localStorage
  useEffect(() => {
    if (externalIsCollapsed === undefined) {
      localStorage.setItem('left-sidebar-collapsed', String(internalIsCollapsed));
    }
  }, [internalIsCollapsed, externalIsCollapsed]);

  const handleToggle = () => {
    if (externalOnToggle) {
      externalOnToggle();
    } else {
      setInternalIsCollapsed(prev => !prev);
    }
  };

  // Collapsed state: show minimal button
  if (isCollapsed) {
    return (
      <div
        className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-12 border-r shadow-lg z-20 flex flex-col items-center pt-4 transition-all duration-300"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-opacity-80 transition-colors mb-2"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          }}
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>

        {/* Vertical text label */}
        <div
          className="text-xs font-medium tracking-wider"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            color: 'var(--text-secondary)',
            marginTop: '1rem',
          }}
        >
          NOTES
        </div>
      </div>
    );
  }

  // Expanded state: show full sidebar with collapse button
  return (
    <div
      className="relative w-80 flex-shrink-0 transition-all duration-300"
      style={{
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Collapse button - positioned at top right of sidebar */}
      <button
        onClick={handleToggle}
        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-opacity-80 transition-colors z-10"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
        }}
        title="Collapse sidebar"
        aria-label="Collapse sidebar"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Sidebar content */}
      <div className="h-full overflow-y-auto custom-scrollbar">
        <Sidebar {...sidebarProps} />
      </div>
    </div>
  );
};

export default CollapsibleSidebar;
