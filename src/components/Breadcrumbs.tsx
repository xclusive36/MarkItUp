'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  Home,
  Folder,
  FileText,
  Network,
  Search,
  Activity,
  Settings,
  Clock,
} from 'lucide-react';

interface BreadcrumbsProps {
  folder?: string;
  fileName?: string;
  currentView?: 'editor' | 'graph' | 'search' | 'analytics' | 'plugins' | 'notes';
  onNavigateHome: () => void;
  onNavigateToFolder: (folderPath: string) => void;
  recentNotes?: Array<{ id: string; name: string; folder?: string }>;
  onSelectRecentNote?: (noteId: string) => void;
  theme: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  folder,
  fileName,
  currentView = 'editor',
  onNavigateHome,
  onNavigateToFolder,
  recentNotes = [],
  onSelectRecentNote,
  theme,
}) => {
  const [showRecentNotes, setShowRecentNotes] = useState(false);

  // Split folder path into segments
  const folderSegments = folder ? folder.split('/').filter(segment => segment.trim() !== '') : [];

  // Get view context label and icon
  const getViewContext = () => {
    switch (currentView) {
      case 'graph':
        return { label: 'Knowledge Graph', icon: Network };
      case 'search':
        return { label: 'Global Search', icon: Search };
      case 'analytics':
        return { label: 'Analytics Dashboard', icon: Activity };
      case 'plugins':
        return { label: 'Plugin Manager', icon: Settings };
      case 'notes':
        return { label: 'All Notes', icon: FileText };
      default:
        return null;
    }
  };

  const viewContext = getViewContext();
  const showRecent = recentNotes.length > 0 && onSelectRecentNote;

  return (
    <nav
      className="flex items-center gap-2 text-sm py-2 px-4 rounded-lg mb-4"
      style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
        color: theme === 'dark' ? '#9ca3af' : '#6b7280',
      }}
      aria-label="Breadcrumb"
    >
      {/* Home */}
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title="Go to home"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </button>

      {/* Folder segments */}
      {folderSegments.map((segment, index) => {
        const folderPath = folderSegments.slice(0, index + 1).join('/');
        const isLast = index === folderSegments.length - 1 && !fileName;

        return (
          <React.Fragment key={folderPath}>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <button
              onClick={() => onNavigateToFolder(folderPath)}
              className={`flex items-center gap-1 transition-colors truncate max-w-[150px] sm:max-w-none ${
                isLast
                  ? 'font-semibold text-gray-900 dark:text-gray-100'
                  : 'hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              title={segment}
            >
              <Folder className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{segment}</span>
            </button>
          </React.Fragment>
        );
      })}

      {/* View Context (for non-editor views) */}
      {viewContext && !fileName && (
        <>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <div
            className="flex items-center gap-1 font-semibold"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            <viewContext.icon className="w-4 h-4 flex-shrink-0" />
            <span>{viewContext.label}</span>
          </div>
        </>
      )}

      {/* Current file */}
      {fileName && (
        <>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <div
            className="flex items-center gap-1 font-semibold truncate max-w-[200px] sm:max-w-none"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            title={fileName}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{fileName.replace('.md', '')}</span>
          </div>
        </>
      )}

      {/* Recent Notes Quick Access */}
      {showRecent && (
        <div className="ml-auto relative">
          <button
            onClick={() => setShowRecentNotes(!showRecentNotes)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            }}
            title="Recent notes"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-medium">Recent</span>
          </button>

          {/* Recent Notes Dropdown */}
          {showRecentNotes && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setShowRecentNotes(false)} />
              {/* Dropdown */}
              <div
                className="absolute right-0 top-full mt-2 w-64 rounded-lg shadow-xl border z-50 py-2 max-h-80 overflow-y-auto"
                style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                }}
              >
                <div
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Recent Notes
                </div>
                {recentNotes.slice(0, 10).map(note => (
                  <button
                    key={note.id}
                    onClick={() => {
                      onSelectRecentNote(note.id);
                      setShowRecentNotes(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm transition-colors flex items-start gap-2"
                    style={{
                      color: theme === 'dark' ? '#f9fafb' : '#111827',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor =
                        theme === 'dark' ? '#374151' : '#f3f4f6';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{note.name.replace('.md', '')}</div>
                      {note.folder && (
                        <div
                          className="truncate text-xs mt-0.5"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          {note.folder}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Breadcrumbs;
