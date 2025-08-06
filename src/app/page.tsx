'use client';

// React and markdown imports
import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

// Component imports
import ThemeToggle from '@/components/ThemeToggle';
import LaTeXRenderer from '@/components/LaTeXRenderer';
import TikZRenderer from '@/components/TikZRenderer';
import GraphView from '@/components/GraphView';
import SearchBox from '@/components/SearchBox';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';

// PKM imports
import { getPKMSystem } from '@/lib/pkm';
import { Note, Graph, SearchResult } from '@/lib/types';
import { MarkdownParser } from '@/lib/parser';

// Icon imports
import { 
  Search, Network, FileText, Hash, Folder, Plus, Edit3, Eye, 
  GitBranch, BarChart3, ArrowLeft, Save, X, Tags, Link as LinkIcon,
  Users, Clock, BookOpen, Zap
} from 'lucide-react';

// Styles
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';
import './highlight.css';
import './manual-theme.css';

export default function Home() {
  const { theme } = useSimpleTheme();
  
  // Core PKM state
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [markdown, setMarkdown] = useState(`# Welcome to MarkItUp PKM System 🚀

This is your **Personal Knowledge Management** system, now powered with advanced features that rival Obsidian!

## Key Features ✨

### 🔗 Wikilinks & Bidirectional Linking
Create connections between notes using [[Note Name]] syntax. The system automatically tracks backlinks and builds your knowledge graph.

### 🏷️ Smart Tagging
Use #tags to organize your thoughts. Tags are automatically indexed and searchable.

### 🕸️ Interactive Graph View  
Visualize your knowledge network with an interactive force-directed graph showing all connections between notes.

### 🔍 Powerful Search
- Full-text search across all notes
- Search by tags: \`tag:project\`
- Search by folders: \`folder:work\`
- Exact phrase search: \`"specific phrase"\`

### 📊 Real-time Analytics
Track your knowledge growth with statistics on notes, links, and connections.

## Getting Started 🎯

1. **Create notes** with the form on the left
2. **Link notes** using [[Note Name]] syntax
3. **Add tags** like #idea #project #important
4. **Explore connections** in the Graph View
5. **Search everything** with the powerful search

Try creating a note about a project and linking it to other notes. Watch your knowledge graph grow!

---

*Start writing and building your second brain...*`);
  
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [currentView, setCurrentView] = useState<'editor' | 'graph' | 'search'>('editor');
  
  // File management
  const [fileName, setFileName] = useState('');
  const [folder, setFolder] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  
  // Graph state
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
  const [graphStats, setGraphStats] = useState({
    totalNotes: 0,
    totalLinks: 0,
    avgConnections: 0,
    maxConnections: 0,
    orphanCount: 0
  });
  
  // Search and organization
  const [tags, setTags] = useState<Array<{ name: string; count: number }>>([]);
  const [folders, setFolders] = useState<Array<{ name: string; count: number }>>([]);
  
  // PKM system
  const [pkm] = useState(() => getPKMSystem());

  // Initialize PKM system on mount
  useEffect(() => {
    const initializePKM = async () => {
      try {
        console.log('Initializing PKM system...');
        
        // Load initial data directly
        await refreshData();
        
        console.log('PKM system initialization complete');
      } catch (error) {
        console.error('Error initializing PKM system:', error);
      }
    };

    initializePKM();
  }, []); // Remove refreshData dependency to avoid circular reference

  // Refresh all PKM data
  const refreshData = useCallback(async () => {
    try {
      console.log('Refreshing PKM data...');
      
      // Update notes list
      const notesResponse = await fetch('/api/files');
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        console.log('Loaded notes:', notesData.length);
        setNotes(notesData);
      } else {
        console.error('Failed to fetch notes:', notesResponse.status);
      }

      // Update graph
      const graphResponse = await fetch('/api/graph');
      if (graphResponse.ok) {
        const graphData = await graphResponse.json();
        console.log('Graph stats:', graphData.stats);
        setGraph(graphData.graph);
        setGraphStats(graphData.stats);
      } else {
        console.error('Failed to fetch graph:', graphResponse.status);
      }

      // Update tags and folders
      const tagsResponse = await fetch('/api/tags');
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        console.log('Tags data:', tagsData.tags?.length, 'folders:', tagsData.folders?.length);
        setTags(tagsData.tags || []);
        setFolders(tagsData.folders || []);
      } else {
        console.error('Failed to fetch tags:', tagsResponse.status);
      }
      
      console.log('PKM data refresh complete');
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, []);

  // Handle search
  const handleSearch = useCallback(async (query: string, options?: any): Promise<SearchResult[]> => {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: options?.limit?.toString() || '20',
        includeContent: options?.includeContent?.toString() || 'true'
      });

      if (options?.tags?.length) {
        params.set('tags', options.tags.join(','));
      }
      if (options?.folders?.length) {
        params.set('folders', options.folders.join(','));
      }

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        return data.results || [];
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    return [];
  }, []);

  // Handle note selection
  const handleNoteSelect = useCallback((noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setActiveNote(note);
      setMarkdown(note.content);
      setFileName(note.name.replace('.md', ''));
      setFolder(note.folder || '');
    }
  }, [notes]);

  // Save note
  const saveNote = async (forceOverwrite = false) => {
    if (!fileName.trim()) {
      setSaveStatus('Please enter a filename');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    try {
      const fullPath = folder.trim()
        ? `${folder.trim().replace(/\/+$/, '')}/${fileName.trim().replace(/\/+$/, '')}.md`
        : `${fileName.trim().replace(/\/+$/, '')}.md`;

      const response = await fetch(`/api/files/${encodeURIComponent(fullPath)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: markdown, overwrite: forceOverwrite }),
      });

      if (response.ok) {
        setSaveStatus('Note saved successfully! 🎉');
        
        // Create or update note in PKM system
        if (activeNote) {
          await pkm.updateNote(activeNote.id, { content: markdown, name: fileName + '.md', folder: folder || undefined });
        } else {
          await pkm.createNote(fileName, markdown, folder || undefined);
        }
        
        // Refresh data
        await refreshData();
        
        setTimeout(() => setSaveStatus(''), 3000);
      } else if (response.status === 409) {
        const data = await response.json();
        if (data.requiresOverwrite) {
          if (window.confirm(data.prompt || 'File exists. Overwrite?')) {
            await saveNote(true);
          } else {
            setSaveStatus('File not overwritten.');
            setTimeout(() => setSaveStatus(''), 3000);
          }
        } else {
          setSaveStatus(data.error || 'Error saving file');
          setTimeout(() => setSaveStatus(''), 3000);
        }
      } else {
        setSaveStatus('Error saving file');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      setSaveStatus('Error saving file');
      setTimeout(() => setSaveStatus(''), 3000);
      console.error('Error saving file:', error);
    }
  };

  // Delete note
  const deleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) {
        alert('Note not found!');
        return;
      }

      const fullPath = note.folder ? `${note.folder}/${note.name}` : note.name;
      const response = await fetch(`/api/files/${encodeURIComponent(fullPath)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await pkm.deleteNote(noteId);
        await refreshData();
        
        // Clear active note if it was deleted
        if (activeNote?.id === noteId) {
          setActiveNote(null);
          setMarkdown('');
          setFileName('');
          setFolder('');
        }
        
        // Show success message
        setSaveStatus('Note deleted successfully! 🗑️');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        // Handle HTTP error responses
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Failed to delete note: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      // Handle network errors (like server not running)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        alert('Cannot connect to server. Please make sure the development server is running.');
      } else {
        alert('An unexpected error occurred while deleting the note.');
      }
    }
  };

  // Create new note
  const createNewNote = () => {
    setActiveNote(null);
    setMarkdown('# New Note\n\nStart writing your thoughts here...');
    setFileName('');
    setFolder('');
    setCurrentView('editor');
  };

  // Graph node click handler
  const handleGraphNodeClick = (nodeId: string) => {
    handleNoteSelect(nodeId);
    setCurrentView('editor');
  };

  // Render wikilinks in markdown
  const processedMarkdown = pkm.renderContent(markdown);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                MarkItUp PKM
              </h1>
              <div className="hidden md:flex text-sm text-gray-500 dark:text-gray-400 space-x-4">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {graphStats.totalNotes} notes
                </span>
                <span className="flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" />
                  {graphStats.totalLinks} links
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="w-4 h-4" />
                  {tags.length} tags
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* View Switcher */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('editor')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentView === 'editor' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentView('graph')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentView === 'graph' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Network className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentView('search')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentView === 'search' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              
              {currentView === 'editor' && (
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('edit')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === 'edit' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === 'preview' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === 'split' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Split
                  </button>
                </div>
              )}

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Note</h2>
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
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Note title..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  }}
                />
                
                <input
                  type="text"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="Folder (optional)..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  }}
                />

                <button
                  onClick={() => saveNote()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Note
                </button>

                {saveStatus && (
                  <p className={`text-sm text-center ${saveStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {saveStatus}
                  </p>
                )}
              </div>
            </div>

            {/* Global Search */}
            <div className="mb-6">
              <SearchBox
                onSearch={handleSearch}
                onSelectNote={handleNoteSelect}
                placeholder="Search all notes..."
                className="w-full"
              />
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Knowledge Graph</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{graphStats.totalNotes}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Notes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{graphStats.totalLinks}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Links</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{graphStats.avgConnections}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Avg Links</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{graphStats.orphanCount}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Orphans</div>
                </div>
              </div>
            </div>

            {/* Notes List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Notes</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No notes yet. Create your first note above!
                  </p>
                ) : (
                  notes.slice(0, 20).map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        activeNote?.id === note.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-700'
                      }`}
                      onClick={() => handleNoteSelect(note.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {note.name.replace('.md', '')}
                          </h4>
                          {note.folder && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Folder className="w-3 h-3" />
                              {note.folder}
                            </p>
                          )}
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {note.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
                                  #{tag}
                                </span>
                              ))}
                              {note.tags.length > 3 && (
                                <span className="text-xs text-gray-400">+{note.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {note.readingTime}m read
                            </span>
                            <span>{note.wordCount} words</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {currentView === 'editor' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)]" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                {viewMode === 'edit' && (
                  <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    className="w-full h-full p-6 border-none resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg bg-transparent text-gray-900 dark:text-white font-mono text-sm placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Start writing your markdown here..."
                  />
                )}

                {viewMode === 'preview' && (
                  <div className="h-full p-6 overflow-y-auto">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
                        components={{
                          code(props) {
                            const { className, children } = props;
                            const match = /language-(\w+)/.exec(className || '');
                            const content = String(children).replace(/\n$/, '');

                            if (match) {
                              const lang = match[1];
                              switch (lang) {
                                case 'tikz':
                                  return <TikZRenderer content={content} />;
                                case 'latex':
                                  return <LaTeXRenderer content={content} displayMode={true} />;
                                default:
                                  return (
                                    <div className="relative group">
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                      <span className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-bl opacity-75">
                                        {lang}
                                      </span>
                                    </div>
                                  );
                              }
                            }
                            return <code className={className}>{children}</code>;
                          },
                        }}
                      >
                        {processedMarkdown}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {viewMode === 'split' && (
                  <div className="h-full flex">
                    <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
                      <textarea
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        className="w-full h-full p-6 border-none resize-none focus:outline-none bg-transparent text-gray-900 dark:text-white font-mono text-sm placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Start writing..."
                      />
                    </div>
                    <div className="w-1/2 p-6 overflow-y-auto">
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
                          components={{
                            code(props) {
                              const { className, children } = props;
                              const match = /language-(\w+)/.exec(className || '');
                              const content = String(children).replace(/\n$/, '');

                              if (match) {
                                const lang = match[1];
                                switch (lang) {
                                  case 'tikz':
                                    return <TikZRenderer content={content} />;
                                  case 'latex':
                                    return <LaTeXRenderer content={content} displayMode={true} />;
                                  default:
                                    return (
                                      <div className="relative group">
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                        <span className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-bl opacity-75">
                                          {lang}
                                        </span>
                                      </div>
                                    );
                                }
                              }
                              return <code className={className}>{children}</code>;
                            },
                          }}
                        >
                          {processedMarkdown}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentView === 'graph' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)]" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                <GraphView
                  graph={graph}
                  centerNode={activeNote?.id}
                  onNodeClick={handleGraphNodeClick}
                  className="w-full h-full"
                />
              </div>
            )}

            {currentView === 'search' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Advanced Search</h2>
                  <SearchBox
                    onSearch={handleSearch}
                    onSelectNote={handleNoteSelect}
                    placeholder="Search with advanced syntax..."
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Hash className="w-5 h-5" />
                      Popular Tags
                    </h3>
                    <div className="space-y-2">
                      {tags.slice(0, 10).map((tag) => (
                        <div key={tag.name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-gray-300">#{tag.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                            {tag.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Folder className="w-5 h-5" />
                      Folders
                    </h3>
                    <div className="space-y-2">
                      {folders.slice(0, 10).map((folder) => (
                        <div key={folder.name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
