import React, { useRef } from 'react';
// import Link from 'next/link';
import {
  FileText,
  Link as LinkIcon,
  Hash,
  Save,
  Plus,
  X,
  Folder,
  Clock,
  File as FileIcon,
  FileCode,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
// Helper to get icon by file type
const getFileIcon = (name: string) => {
  if (name.endsWith('.md'))
    return <FileText className="w-4 h-4 mr-1 inline-block align-text-bottom" />;
  if (name.endsWith('.js') || name.endsWith('.ts'))
    return <FileCode className="w-4 h-4 mr-1 inline-block align-text-bottom" />;
  return <FileIcon className="w-4 h-4 mr-1 inline-block align-text-bottom" />;
};
import SearchBox from './SearchBox';
import { Note, Tag, Graph } from '@/lib/types';

interface SidebarProps {
  fileName: string;
  setFileName: (v: string) => void;
  folder: string;
  setFolder: (v: string) => void;
  saveNote: () => void;
  saveStatus: string;
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
}

import { useEffect, useState } from 'react';
import FolderTree from './FolderTree';

const Sidebar: React.FC<SidebarProps> = ({
  fileName,
  setFileName,
  folder,
  setFolder,
  saveNote,
  saveStatus,
  createNewNote,
  graphStats: initialGraphStats,
  tags,
  currentView,
  handleSearch,
  handleNoteSelect,
  notes: notesProp,
  activeNote,
  deleteNote,
  theme,
  onReorderNotes,
}) => {
  console.log('Sidebar initialGraphStats prop:', initialGraphStats);
  const [graphStats, setGraphStats] = useState(initialGraphStats);
  const [loadingStats, setLoadingStats] = useState(false);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);

  // Collapsible sections state
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  const [isNotesExpanded, setIsNotesExpanded] = useState(true);
  const [showFolderTree, setShowFolderTree] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    note: Note | null;
  } | null>(null);
  const notesListRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<Note[]>(notesProp);
  const [renamingNoteId, setRenamingNoteId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');

  // Keep local notes in sync with prop
  React.useEffect(() => {
    setNotes(notesProp);
  }, [notesProp]);
  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    setDraggedNoteId(noteId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent, _noteId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e: React.DragEvent, targetNoteId: string) => {
    e.preventDefault();
    if (draggedNoteId && draggedNoteId !== targetNoteId) {
      const fromIdx = notes.findIndex(n => n.id === draggedNoteId);
      const toIdx = notes.findIndex(n => n.id === targetNoteId);
      if (fromIdx !== -1 && toIdx !== -1) {
        const updated = [...notes];
        const [moved] = updated.splice(fromIdx, 1);
        updated.splice(toIdx, 0, moved);
        setNotes(updated);
        if (onReorderNotes) onReorderNotes(updated);
      }
    }
    setDraggedNoteId(null);
  };
  const handleDragEnd = () => setDraggedNoteId(null);

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, note });
  };
  const handleCloseContextMenu = () => setContextMenu(null);
  // Inline rename logic
  const handleRename = () => {
    if (contextMenu?.note) {
      setRenamingNoteId(contextMenu.note.id);
      setRenameValue(contextMenu.note.name.replace('.md', ''));
    }
    setContextMenu(null);
  };
  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRenameValue(e.target.value);
  };
  const handleRenameSubmit = async (note: Note) => {
    const newName = renameValue.trim();
    if (newName && newName !== note.name.replace('.md', '')) {
      // Call backend API to rename file
      const oldName = note.name;
      const folder = note.folder || '';
      const res = await fetch('/api/files/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: newName + '.md', folder }),
      });
      if (res.ok) {
        // Optionally show a toast here
        // Refresh notes list (emit event or call prop)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('refreshNotes'));
        }
      } else {
        // Optionally show error toast
      }
    }
    setRenamingNoteId(null);
    setRenameValue('');
  };
  // Listen for refreshNotes event to reload notes from parent
  useEffect(() => {
    function handleRefreshNotes() {
      if (typeof window !== 'undefined') {
        window.location.reload(); // simplest way to ensure all components reload
      }
    }
    window.addEventListener('refreshNotes', handleRefreshNotes);
    return () => window.removeEventListener('refreshNotes', handleRefreshNotes);
  }, []);
  const handleRenameKeyDown = (e: React.KeyboardEvent, note: Note) => {
    if (e.key === 'Enter') handleRenameSubmit(note);
    if (e.key === 'Escape') {
      setRenamingNoteId(null);
      setRenameValue('');
    }
  };

  // Duplicate logic
  const handleDuplicate = async () => {
    if (contextMenu?.note) {
      const note = contextMenu.note;
      const baseName = note.name.replace('.md', '');
      let newName = baseName + ' (Copy)';
      let i = 2;
      while (notes.some(n => n.name === newName + '.md')) {
        newName = baseName + ` (Copy ${i})`;
        i++;
      }
      const folder = note.folder || '';
      // Call backend API to duplicate file
      const res = await fetch('/api/files/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceName: note.name, targetName: newName + '.md', folder }),
      });
      if (res.ok) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('refreshNotes'));
        }
      } else {
        // Optionally show error toast
      }
    }
    setContextMenu(null);
  };
  const handleDelete = () => {
    if (contextMenu?.note) {
      deleteNote(contextMenu.note.id);
    }
    setContextMenu(null);
  };

  useEffect(() => {
    setLoadingStats(true);
    fetch('/api/graph')
      .then(res => res.json())
      .then(data => {
        console.log('Sidebar /api/graph response:', data);
        if (data && data.stats) setGraphStats(data.stats);
        setLoadingStats(false);
      })
      .catch(() => setLoadingStats(false));
    function handleKGUpdate() {
      setLoadingStats(true);
      fetch('/api/graph')
        .then(res => res.json())
        .then(data => {
          console.log('Sidebar /api/graph response (event):', data);
          if (data && data.stats) setGraphStats(data.stats);
          setLoadingStats(false);
        })
        .catch(() => setLoadingStats(false));
    }
    window.addEventListener('knowledgeGraphUpdate', handleKGUpdate);
    return () => window.removeEventListener('knowledgeGraphUpdate', handleKGUpdate);
  }, [initialGraphStats]);

  return (
    <>
      <div
        className="rounded-lg shadow-sm border p-4 mb-4 lg:mb-6"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-base lg:text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            New Note
          </h2>
          <button
            onClick={createNewNote}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            disabled={currentView !== 'editor'}
            style={currentView !== 'editor' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            placeholder="Note title..."
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border-secondary)',
              color: 'var(--text-primary)',
              opacity: currentView !== 'editor' ? 0.5 : 1,
              cursor: currentView !== 'editor' ? 'not-allowed' : 'auto',
            }}
            disabled={currentView !== 'editor'}
          />
          <input
            type="text"
            value={folder}
            onChange={e => setFolder(e.target.value)}
            placeholder="Folder (optional)..."
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border-secondary)',
              color: 'var(--text-primary)',
              opacity: currentView !== 'editor' ? 0.5 : 1,
              cursor: currentView !== 'editor' ? 'not-allowed' : 'auto',
            }}
            disabled={currentView !== 'editor'}
          />
          <button
            onClick={() => saveNote()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={currentView !== 'editor'}
            style={currentView !== 'editor' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <Save className="w-4 h-4" />
            Save Note
          </button>
          {saveStatus && (
            <p
              className={`text-xs text-center ${
                saveStatus.includes('Error') ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {saveStatus}
            </p>
          )}
        </div>
      </div>
      {/* Quick Stats - moved from header for better UX */}
      <div
        className="flex flex-wrap justify-center text-xs sm:text-sm space-x-3 sm:space-x-4 mb-4"
        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
      >
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
          {graphStats.totalNotes} notes
        </span>
        <span className="flex items-center gap-1">
          <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          {graphStats.totalLinks} links
        </span>
        <span className="flex items-center gap-1">
          <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
          {tags.length} tags
        </span>
      </div>
      <div className={`mb-4 lg:mb-6 ${currentView === 'search' ? 'block' : 'hidden lg:block'}`}>
        <SearchBox
          onSearch={handleSearch as any}
          onSelectNote={handleNoteSelect}
          placeholder="Search all notes..."
          className="w-full"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center mx-auto">
          Try: <span className="font-mono">tag:project</span>,{' '}
          <span className="font-mono">folder:notes</span>, or{' '}
          <span className="font-mono">"exact phrase"</span>
        </div>
      </div>
      {/* Quick Stats */}
      <div
        className="rounded-lg shadow-sm border p-4 mb-4 lg:mb-6"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <button
          onClick={() => setIsStatsExpanded(!isStatsExpanded)}
          className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-primary)' }}
        >
          <span>Knowledge Graph</span>
          {isStatsExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {isStatsExpanded &&
          (loadingStats ? (
            <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-6">
              Loading...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 lg:gap-4 text-center">
              <div>
                <div className="text-lg lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {graphStats.totalNotes}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Notes</div>
              </div>
              <div>
                <div className="text-lg lg:text-2xl font-bold text-green-600 dark:text-green-400">
                  {graphStats.totalLinks}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Links</div>
              </div>
              <div>
                <div className="text-lg lg:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {graphStats.avgConnections}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Avg Links</div>
              </div>
              <div>
                <div className="text-lg lg:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {graphStats.orphanCount}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Orphans</div>
              </div>
            </div>
          ))}
      </div>
      {/* All Notes Page Link */}
      <div className="mb-4">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              const event = new CustomEvent('setCurrentView', { detail: 'notes' });
              window.dispatchEvent(event);
            }
          }}
          className="w-full flex items-center justify-center px-3 py-1.5 text-sm rounded-md transition-colors shadow-sm font-medium mb-2 bg-blue-600 text-white hover:bg-blue-700"
          style={{ minHeight: '40px' }}
          title="View All Notes"
        >
          <Folder className="w-4 h-4 mr-1" />
          All Notes
        </button>
      </div>
      {/* Notes List - Collapsible on mobile */}
      <div
        className="rounded-lg shadow-sm border p-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <button
          onClick={() => setIsNotesExpanded(!isNotesExpanded)}
          className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-primary)' }}
        >
          <span>Recent Notes</span>
          {isNotesExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {isNotesExpanded && (
          <div ref={notesListRef} className="space-y-2 max-h-48 lg:max-h-96 overflow-y-auto">
            {notes.length === 0 ? (
              <p
                className="text-xs lg:text-sm text-center py-4"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                No notes yet. Create your first note above!
              </p>
            ) : (
              notes.slice(0, 20).map((note: Note) => (
                <div
                  key={note.id}
                  className={`p-2 lg:p-3 rounded-lg cursor-pointer transition-colors border flex items-center ${draggedNoteId === note.id ? 'opacity-50' : ''} ${activeNote?.id === note.id ? '' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  style={{
                    backgroundColor:
                      activeNote?.id === note.id ? 'var(--accent-bg)' : 'transparent',
                    borderColor:
                      activeNote?.id === note.id
                        ? 'var(--accent-border)'
                        : 'var(--border-secondary)',
                  }}
                  draggable
                  onDragStart={e => handleDragStart(e, note.id)}
                  onDragOver={e => handleDragOver(e, note.id)}
                  onDrop={e => handleDrop(e, note.id)}
                  onDragEnd={handleDragEnd}
                  onContextMenu={e => handleContextMenu(e, note)}
                  onClick={() => {
                    handleNoteSelect(note.id);
                    if (typeof window !== 'undefined') {
                      const event = new CustomEvent('setCurrentView', { detail: 'editor' });
                      window.dispatchEvent(event);
                    }
                  }}
                >
                  {getFileIcon(note.name)}
                  <div className="flex-1 min-w-0">
                    {renamingNoteId === note.id ? (
                      <input
                        className="text-xs lg:text-sm font-medium truncate bg-transparent border-b border-blue-400 outline-none px-1 py-0.5"
                        style={{
                          color: 'var(--text-primary)',
                          minWidth: 0,
                          width: '90%',
                        }}
                        value={renameValue}
                        autoFocus
                        onChange={handleRenameChange}
                        onBlur={() => handleRenameSubmit(note)}
                        onKeyDown={e => handleRenameKeyDown(e, note)}
                      />
                    ) : (
                      <h4
                        className="text-xs lg:text-sm font-medium truncate text-gray-900 dark:text-gray-100"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {note.name.replace('.md', '')}
                      </h4>
                    )}
                    {note.folder && (
                      <p
                        className="text-xs flex items-center gap-1 text-gray-600 dark:text-gray-400"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Folder className="w-3 h-3" />
                        {note.folder}
                      </p>
                    )}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {note.tags.slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                              color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                        {note.tags.length > 2 && (
                          <span
                            className="text-xs"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#9ca3af' }}
                          >
                            +{note.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    <div
                      className="flex items-center gap-2 lg:gap-3 mt-2 text-xs"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {note.readingTime}m
                      </span>
                      <span className="hidden lg:inline">{note.wordCount} words</span>
                    </div>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="p-1 transition-colors"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#9ca3af' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#dc2626';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = theme === 'dark' ? '#9ca3af' : '#9ca3af';
                    }}
                  >
                    <X className="w-3 lg:w-4 h-3 lg:h-4" />
                  </button>
                </div>
              ))
            )}
            {/* Context Menu */}
            {contextMenu && contextMenu.note && (
              <div
                className="fixed z-50 border rounded shadow-lg py-1 text-sm"
                style={{
                  top: contextMenu.y,
                  left: contextMenu.x,
                  minWidth: 120,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
                onMouseLeave={handleCloseContextMenu}
              >
                <button
                  className="block w-full text-left px-4 py-2 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={handleRename}
                >
                  Rename
                </button>
                <button
                  className="block w-full text-left px-4 py-2 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={handleDuplicate}
                >
                  Duplicate
                </button>
                <button
                  className="block w-full text-left px-4 py-2 transition-colors"
                  style={{ color: 'var(--error-color)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
