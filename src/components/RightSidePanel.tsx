'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  List,
  Link2,
  Brain,
  PanelRightOpen,
  GripVertical,
  Info,
  Sparkles,
} from 'lucide-react';
import { Note } from '@/lib/types';
import DocumentOutlinePanel from './DocumentOutlinePanel';
import BacklinksPanel from './BacklinksPanel';
import MetadataPanel from './MetadataPanel';
import RelatedNotes from './RelatedNotes';
import VectorSearchTooltip from './VectorSearchTooltip';
import { useResizablePanel } from '@/hooks/useResizablePanel';

type PanelTab = 'outline' | 'backlinks' | 'metadata' | 'related' | 'ai';

interface RightSidePanelProps {
  // Panel state
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleOpen: () => void;
  onToggleCollapse: () => void;

  // Content props
  markdown: string;
  currentNote: Note | null;
  allNotes: Note[];

  // Callbacks
  onHeadingClick?: (line: number) => void;
  onNoteClick?: (noteId: string) => void;

  // AI Tools (optional)
  showAITools?: boolean;
  aiToolsContent?: React.ReactNode;

  // Theme
  theme?: 'light' | 'dark';
}

export const RightSidePanel: React.FC<RightSidePanelProps> = ({
  isOpen,
  isCollapsed,
  onToggleOpen,
  onToggleCollapse,
  markdown,
  currentNote,
  allNotes,
  onHeadingClick,
  onNoteClick,
  showAITools = false,
  aiToolsContent,
  theme = 'light',
}) => {
  const [activeTab, setActiveTab] = useState<PanelTab>('outline');
  const [showRelatedTooltip, setShowRelatedTooltip] = useState(false);

  // Show Related tooltip when tab becomes visible
  useEffect(() => {
    if (activeTab === 'related' && currentNote) {
      const hasSeenTooltip = localStorage.getItem('vectorSearchTooltip_related_seen');
      if (!hasSeenTooltip) {
        const timer = setTimeout(() => setShowRelatedTooltip(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [activeTab, currentNote]);

  // Resizable panel hook
  const { width, isResizing, handleMouseDown } = useResizablePanel({
    minWidth: 280,
    maxWidth: 600,
    defaultWidth: 384,
    storageKey: 'right-panel-width',
  });

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed right-4 top-1/2 -translate-y-1/2 p-2 rounded-l-lg shadow-lg border-r-0 z-20 hover:bg-opacity-90 transition-all"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-primary)',
        }}
        title="Open side panel"
      >
        <PanelRightOpen className="w-5 h-5" />
      </button>
    );
  }

  const tabs = [
    { id: 'outline' as PanelTab, label: 'Outline', icon: List },
    { id: 'backlinks' as PanelTab, label: 'Backlinks', icon: Link2 },
    { id: 'related' as PanelTab, label: 'Related', icon: Sparkles },
    { id: 'metadata' as PanelTab, label: 'Metadata', icon: Info },
    ...(showAITools ? [{ id: 'ai' as PanelTab, label: 'AI Tools', icon: Brain }] : []),
  ];

  return (
    <div
      className={`fixed right-0 top-0 h-full border-l shadow-lg z-30 flex transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-12' : ''
      }`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
        width: isCollapsed
          ? '48px'
          : typeof window !== 'undefined'
            ? `${Math.min(width, window.innerWidth * 0.9)}px`
            : `${width}px`,
        maxWidth: isCollapsed ? '48px' : '90vw',
        transition: isResizing ? 'none' : 'all 0.3s ease-in-out',
      }}
    >
      {/* Resize Handle - only show when expanded */}
      {!isCollapsed && (
        <div
          className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 hover:w-1.5 transition-all z-40 group"
          onMouseDown={handleMouseDown}
          style={{
            backgroundColor: isResizing ? '#3b82f6' : 'transparent',
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              color: '#3b82f6',
            }}
          >
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
      )}
      {/* Collapsed state - vertical tab bar */}
      {isCollapsed ? (
        <div className="flex flex-col items-center w-full py-4 gap-2">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded transition-all"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            title="Expand panel"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="h-px w-8 my-2" style={{ backgroundColor: 'var(--border-primary)' }} />

          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  onToggleCollapse();
                }}
                className="p-2 rounded transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                  color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                title={tab.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      ) : (
        /* Expanded state - full panel */
        <div className="flex flex-col w-full">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                    style={{
                      backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                      color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded transition-all"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                title="Collapse panel"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleOpen}
                className="p-1.5 rounded transition-all"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'outline' && (
              <DocumentOutlinePanel
                markdown={markdown}
                onHeadingClick={onHeadingClick}
                theme={theme}
              />
            )}

            {activeTab === 'backlinks' && (
              <BacklinksPanel
                currentNote={currentNote}
                allNotes={allNotes}
                onNoteClick={onNoteClick}
                theme={theme}
              />
            )}

            {activeTab === 'related' && (
              <div className="h-full overflow-y-auto p-4">
                <RelatedNotes
                  activeNote={currentNote}
                  onNoteClick={noteId => onNoteClick?.(noteId)}
                  maxResults={8}
                  minSimilarity={0.3}
                  className="h-full"
                />
              </div>
            )}

            {activeTab === 'metadata' && (
              <MetadataPanel note={currentNote} allNotes={allNotes} theme={theme} />
            )}

            {activeTab === 'ai' && showAITools && (
              <div className="h-full overflow-y-auto">
                {aiToolsContent || (
                  <div className="flex items-center justify-center h-full p-8 text-center">
                    <div>
                      <Brain
                        className="w-12 h-12 mx-auto mb-3 opacity-30"
                        style={{ color: 'var(--text-secondary)' }}
                      />
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        AI Tools coming soon...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Discovery Tooltip for Related Notes */}
      {showRelatedTooltip && (
        <VectorSearchTooltip trigger="related" onDismiss={() => setShowRelatedTooltip(false)} />
      )}
    </div>
  );
};

export default RightSidePanel;
