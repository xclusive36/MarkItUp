import React from 'react';
import MainContent from './MainContent';
import NotesPanel from './NotesPanel';
import GraphView from './GraphView';
import SearchBox from './SearchBox';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import UnifiedPluginManager from './UnifiedPluginManager';
import { Hash, Folder } from 'lucide-react';
import { Note, Graph, Tag, GraphEdge } from '@/lib/types';
import { AnalyticsSystem } from '@/lib/analytics';

import type { SearchResult } from '@/lib/types';

// Define SearchOptions type (copied from SearchBox)
type SearchOptions = {
  limit?: number;
  includeContent?: boolean;
  tags?: string[];
  folders?: string[];
};

type MainPanelView = 'editor' | 'graph' | 'search' | 'analytics' | 'plugins' | 'notes';

interface MainPanelProps {
  currentView: MainPanelView;
  // MainContent props
  markdown: string;
  viewMode: 'edit' | 'preview' | 'split';
  setViewMode: (v: 'edit' | 'preview' | 'split') => void;
  handleMarkdownChange: (v: string) => void;
  processedMarkdown: string;
  theme: string;
  analytics: AnalyticsSystem;
  editorRef?: React.RefObject<HTMLTextAreaElement | null>;
  // GraphView props
  graph: Graph;
  activeNote: Note | null;
  handleGraphNodeClick: (id: string) => void;
  // Search props
  handleSearch: (query: string, options?: SearchOptions) => Promise<SearchResult[]>;
  handleNoteSelect: (noteId: string) => void;
  tags: Tag[];
  folders: Array<{ name: string; count: number }>;
  // Analytics props
  notes: Note[];
  // Right panel state
  isRightPanelOpen?: boolean;
  isRightPanelCollapsed?: boolean;
  // Plugins
  // ...add more as needed
  // End of MainPanelProps interface
}

const MainPanel: React.FC<MainPanelProps> = ({
  currentView,
  markdown,
  viewMode,
  setViewMode,
  handleMarkdownChange,
  processedMarkdown,
  theme,
  analytics,
  editorRef,
  graph,
  isRightPanelOpen = false,
  isRightPanelCollapsed = false,
  activeNote,
  handleGraphNodeClick,
  handleSearch,
  handleNoteSelect,
  tags,
  folders,
  notes,
}) => {
  if (currentView === 'notes') {
    return <NotesPanel />;
  }
  if (currentView === 'editor') {
    return (
      <MainContent
        markdown={markdown}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleMarkdownChange={handleMarkdownChange}
        processedMarkdown={processedMarkdown}
        theme={theme}
        analytics={analytics}
        editorRef={editorRef}
        isRightPanelOpen={isRightPanelOpen}
        isRightPanelCollapsed={isRightPanelCollapsed}
      />
    );
  }
  if (currentView === 'graph') {
    return (
      <div
        className="rounded-lg shadow-sm border h-[calc(100vh-280px)] lg:h-[calc(100vh-200px)]"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <GraphView
          graph={graph}
          centerNode={activeNote?.id}
          onNodeClick={handleGraphNodeClick}
          className="w-full h-full"
        />
      </div>
    );
  }
  if (currentView === 'search') {
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6"
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        }}
      >
        <div className="mb-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Advanced Search
          </h2>
          <SearchBox
            onSearch={handleSearch}
            onSelectNote={handleNoteSelect}
            placeholder="Search with advanced syntax..."
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Hash className="w-4 lg:w-5 h-4 lg:h-5" />
              Popular Tags
            </h3>
            <div className="space-y-2">
              {tags.slice(0, 10).map(tag => (
                <div
                  key={tag.name}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">#{tag.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    {tag.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Folder className="w-4 lg:w-5 h-4 lg:h-5" />
              Folders
            </h3>
            <div className="space-y-2">
              {folders.slice(0, 10).map(folder => (
                <div
                  key={folder.name}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">{folder.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    {folder.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (currentView === 'analytics') {
    return (
      <AnalyticsDashboard
        notes={notes}
        links={graph.edges.map((edge: GraphEdge) => ({
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          type: edge.type === 'link' ? 'wikilink' : edge.type === 'tag' ? 'tag' : 'backlink',
          anchorText: undefined,
          blockId: undefined,
        }))}
        tags={tags}
        className="h-[calc(100vh-280px)] lg:h-[calc(100vh-200px)] overflow-y-auto"
      />
    );
  }
  if (currentView === 'plugins') {
    return (
      <div className="h-[calc(100vh-280px)] lg:h-[calc(100vh-200px)] overflow-y-auto">
        <UnifiedPluginManager />
      </div>
    );
  }
  return null;
};

export default MainPanel;
