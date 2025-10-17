'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  List,
  Link2,
  Brain,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { Note } from '@/lib/types';
import DocumentOutlinePanel from './DocumentOutlinePanel';
import BacklinksPanel from './BacklinksPanel';

type PanelTab = 'outline' | 'backlinks' | 'ai';

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
    ...(showAITools ? [{ id: 'ai' as PanelTab, label: 'AI Tools', icon: Brain }] : []),
  ];

  return (
    <div
      className={`fixed right-0 top-0 h-full border-l shadow-lg z-30 flex transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-12' : 'w-80 lg:w-96'
      }`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Collapsed state - vertical tab bar */}
      {isCollapsed ? (
        <div className="flex flex-col items-center w-full py-4 gap-2">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Expand panel"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>

          <div className="h-px w-8 my-2" style={{ backgroundColor: 'var(--border-primary)' }} />

          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  onToggleCollapse();
                }}
                className={`p-2 rounded transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={tab.label}
              >
                <Icon
                  className="w-5 h-5"
                  style={{
                    color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                  }}
                />
              </button>
            );
          })}

          <div className="flex-1" />

          <button
            onClick={onToggleOpen}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Close panel"
          >
            <PanelRightClose className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
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
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    style={{
                      color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-secondary)',
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
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Collapse panel"
              >
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
              <button
                onClick={onToggleOpen}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Close panel"
              >
                <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
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
    </div>
  );
};

export default RightSidePanel;
