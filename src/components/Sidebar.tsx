import React from 'react';
import { FileText, Link as LinkIcon, Hash, Save, Plus, X, Folder, Clock } from 'lucide-react';
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
}

const Sidebar: React.FC<SidebarProps> = ({
  fileName,
  setFileName,
  folder,
  setFolder,
  saveNote,
  saveStatus,
  createNewNote,
  graphStats,
  tags,
  currentView,
  handleSearch,
  handleNoteSelect,
  notes,
  activeNote,
  deleteNote,
  theme,
}) => (
  <>
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 lg:mb-6"
      style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
          New Note
        </h2>
        <button
          onClick={createNewNote}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
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
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          style={{
            backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
            borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
          }}
        />
        <input
          type="text"
          value={folder}
          onChange={e => setFolder(e.target.value)}
          placeholder="Folder (optional)..."
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          style={{
            backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
            borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
          }}
        />
        <button
          onClick={saveNote}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        onSearch={async (query: string) => {
          handleSearch(query);
          return [];
        }}
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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 lg:mb-6"
      style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      }}
    >
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Knowledge Graph</h3>
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
    </div>
    {/* Notes List - Collapsible on mobile */}
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
      style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      }}
    >
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
      >
        Recent Notes
      </h3>
      <div className="space-y-2 max-h-48 lg:max-h-96 overflow-y-auto">
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
              className="p-2 lg:p-3 rounded-lg cursor-pointer transition-colors border"
              style={{
                backgroundColor:
                  activeNote?.id === note.id
                    ? theme === 'dark'
                      ? 'rgba(59, 130, 246, 0.1)'
                      : '#eff6ff'
                    : 'transparent',
                borderColor:
                  activeNote?.id === note.id
                    ? theme === 'dark'
                      ? '#1e40af'
                      : '#bfdbfe'
                    : theme === 'dark'
                      ? '#374151'
                      : '#f3f4f6',
              }}
              onMouseEnter={e => {
                if (activeNote?.id !== note.id) {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f9fafb';
                }
              }}
              onMouseLeave={e => {
                if (activeNote?.id !== note.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              onClick={() => handleNoteSelect(note.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-xs lg:text-sm font-medium truncate"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    {note.name.replace('.md', '')}
                  </h4>
                  {note.folder && (
                    <p
                      className="text-xs flex items-center gap-1"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
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
            </div>
          ))
        )}
      </div>
    </div>
  </>
);

export default Sidebar;
