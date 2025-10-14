'use client';

import dynamic from 'next/dynamic';

// React and markdown imports
import { useState, useEffect, useCallback, useRef } from 'react';
// ...existing code...
// MainContent import
import MainPanel from '@/components/MainPanel';

// Component imports
// ...existing code...
import { CollaborationSettings } from '@/components/CollaborationSettings';
import { UserProfile } from '@/components/UserProfile';
import CommandPalette from '@/components/CommandPalette';
import AIChat from '@/components/AIChat';
import WritingAssistant from '@/components/WritingAssistant';
import KnowledgeDiscovery from '@/components/KnowledgeDiscovery';
import ResearchAssistant from '@/components/ResearchAssistant';
import KnowledgeMap from '@/components/KnowledgeMap';
import BatchAnalyzer from '@/components/BatchAnalyzer';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { useCollaboration } from '@/contexts/CollaborationContext';

// PKM imports
import { getPKMSystem } from '@/lib/pkm';
import { Note, Graph, SearchResult } from '@/lib/types';
import { analytics, AnalyticsEventType } from '@/lib/analytics';

// Component imports
// ...existing code...
import { AppHeader } from '@/components/AppHeader';
import Sidebar from '@/components/Sidebar';
import { X } from 'lucide-react';

// Styles
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';
import './highlight.css';
import './manual-theme.css';

export default function Home() {
  const { theme } = useSimpleTheme();
  const { settings, updateSettings } = useCollaboration();

  const NotesComponent = dynamic(() => import('@/components/NotesComponent'), { ssr: false });
  // Notes refresh for NotesComponent
  // const handleNotesComponentRefresh = useCallback(async () => {
  //   // This will reload the notes list and update sidebar, memory, etc.
  //   const notesResponse = await fetch('/api/files');
  //   if (notesResponse.ok) {
  //     const notesData = await notesResponse.json();
  //     setNotes(notesData);
  //   }
  // }, []);

  // Ref for NotesComponent refresh
  const notesComponentRefreshRef = useRef<(() => Promise<void>) | null>(null);

  // Collaboration UI state
  const [showCollabSettings, setShowCollabSettings] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // AI Chat state
  const [showAIChat, setShowAIChat] = useState(false);

  // Writing Assistant state
  const [showWritingAssistant, setShowWritingAssistant] = useState(false);

  // Knowledge Discovery state
  const [showKnowledgeDiscovery, setShowKnowledgeDiscovery] = useState(false);

  // Research Assistant state
  const [showResearchAssistant, setShowResearchAssistant] = useState(false);

  // Knowledge Map state
  const [showKnowledgeMap, setShowKnowledgeMap] = useState(false);

  // Batch Analyzer state
  const [showBatchAnalyzer, setShowBatchAnalyzer] = useState(false);

  // Command Palette state
  const [showCommandPalette, setShowCommandPalette] = useState(false);

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

*Start writing and building your second brain...`);

  // Track markdown editing with debounce
  const [lastEditTrack, setLastEditTrack] = useState(0);
  const handleMarkdownChange = (value: string) => {
    setMarkdown(value);

    // Debounced analytics tracking for editing
    const now = Date.now();
    if (now - lastEditTrack > 5000) {
      analytics.trackEvent('note_edited', {
        wordCount: value.split(/\s+/).filter(word => word.length > 0).length,
        characterCount: value.length,
        hasWikilinks: value.includes('[['),
        tagCount: (value.match(/#\w+/g) || []).length,
      });
      setLastEditTrack(now);
    }
  };

  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [currentView, setCurrentView] = useState<
    'editor' | 'graph' | 'search' | 'analytics' | 'plugins' | 'notes'
  >('editor');

  // Listen for sidebar "All Notes" click event
  useEffect(() => {
    const handler = (e: any) => {
      if (typeof e.detail === 'string') {
        if (e.detail === 'notes') setCurrentView('notes');
        if (e.detail === 'editor') setCurrentView('editor');
      } else if (e.detail && typeof e.detail === 'object' && e.detail.view === 'editor') {
        if (!e.detail.notePath) {
          // New note: clear editor state
          setActiveNote(null);
          setMarkdown('');
          setFileName('');
          setFolder('');
        } else {
          // Find note by path (folder/name or just name)
          const note = notes.find(n => {
            const fullPath = n.folder ? `${n.folder}/${n.name}` : n.name;
            return fullPath === e.detail.notePath;
          });
          if (note) {
            setActiveNote(note);
            setMarkdown(note.content);
            setFileName(note.name.replace('.md', ''));
            setFolder(note.folder || '');
          }
        }
        setCurrentView('editor');
      }
    };
    window.addEventListener('setCurrentView', handler);
    return () => window.removeEventListener('setCurrentView', handler);
  }, [notes]);

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
    orphanCount: 0,
  });

  // Search and organization
  const [tags, setTags] = useState<Array<{ name: string; count: number }>>([]);
  const [folders, setFolders] = useState<Array<{ name: string; count: number }>>([]);

  // Mobile sidebar state
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Simplified button handler with event delegation
  const handleButtonClick = useCallback(
    (buttonType: string) => {
      console.log(`🎯 ${buttonType} button clicked via handleButtonClick`);

      switch (buttonType) {
        case 'command-palette':
          setShowCommandPalette(true);
          break;
        case 'ai-chat':
          setShowAIChat(true);
          analytics.trackEvent('ai_chat', { action: 'open_chat', noteContext: !!activeNote?.id });
          break;
        case 'writing-assistant':
          setShowWritingAssistant(true);
          analytics.trackEvent('ai_analysis', {
            action: 'open_writing_assistant',
            noteContext: !!activeNote?.id,
          });
          break;
        case 'knowledge-discovery':
          setShowKnowledgeDiscovery(true);
          analytics.trackEvent('ai_analysis', {
            action: 'open_knowledge_discovery',
            notesCount: notes.length,
          });
          break;
        case 'research-assistant':
          setShowResearchAssistant(true);
          analytics.trackEvent('ai_analysis', {
            action: 'open_research_assistant',
            notesCount: notes.length,
          });
          break;
        case 'knowledge-map':
          setShowKnowledgeMap(true);
          analytics.trackEvent('ai_analysis', {
            action: 'open_knowledge_map',
            notesCount: notes.length,
          });
          break;
        case 'batch-analyzer':
          setShowBatchAnalyzer(true);
          analytics.trackEvent('ai_analysis', {
            action: 'open_batch_analyzer',
            notesCount: notes.length,
          });
          break;
        case 'user-profile':
          setShowUserProfile(true);
          break;
        case 'collab-settings':
          setShowCollabSettings(true);
          break;
        default:
          console.log(`❌ Unknown button type: ${buttonType}`);
      }
    },
    [activeNote?.id, notes.length]
  );

  // Client-side mounting state to prevent hydration issues
  const [isMounted, setIsMounted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  // const [_initializationComplete, setInitializationComplete] = useState(false); // unused

  // Use ref to prevent double initialization
  const hasInitialized = useRef(false);

  // PKM system
  const [pkm] = useState(() => {
    const pkmSystem = getPKMSystem();

    // Set up UI callbacks for plugin integration
    pkmSystem.setUICallbacks({
      setActiveNote: note => {
        setActiveNote(note);
        setMarkdown(note.content);
        setFileName(note.name.replace('.md', ''));
        setFolder(note.folder || '');
      },
      setMarkdown: setMarkdown,
      setFileName: setFileName,
      setFolder: setFolder,
      refreshNotes: async () => {
        // Refresh notes from API
        const notesResponse = await fetch('/api/files');
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          setNotes(notesData);
        }
      },
      getMarkdown: () => markdown,
      getFileName: () => fileName,
      getFolder: () => folder,
    });

    return pkmSystem;
  });

  // Initialize PKM system on mount
  useEffect(() => {
    // Prevent double initialization
    if (hasInitialized.current) {
      console.log('🚫 Initialization already ran, skipping');
      return;
    }

    // Set mounted state immediately to enable UI interactions
    setIsMounted(true);
    console.log('🔧 Component mounted, isMounted set to true');

    const initializePKM = async () => {
      try {
        hasInitialized.current = true;
        console.log('🚀 Initializing PKM system...');
        console.log('🔧 Setting isInitializing to true');
        setIsInitializing(true);

        // Track session start
        analytics.trackEvent('session_started', {
          timestamp: new Date().toISOString(),
        });

        // Initialize PKM system (this will load plugins)
        console.log('🔧 Calling pkm.initialize()...');
        await pkm.initialize();
        console.log('✅ pkm.initialize() completed');

        // Initialize AI service with PKM system (non-blocking)
        console.log('🔧 Initializing AI service...');
        const { initializeAIService } = await import('@/lib/ai/ai-service');
        initializeAIService(pkm);
        console.log('✅ AI service initialized');

        console.log('✅ PKM system initialization complete');
      } catch (error) {
        console.error('❌ Error initializing PKM system:', error);
      } finally {
        console.log('🔧 Setting isInitializing to false');
        setIsInitializing(false);
        console.log('🔧 Setting initializationComplete to true');
        // setInitializationComplete(true); // removed, variable is unused
        console.log(
          '🎯 Button state should now be: enabled (isMounted=true, isInitializing=false, initializationComplete=true)'
        );
      }
    };

    // Run initialization in next tick to allow UI to render first
    setTimeout(() => {
      console.log('⏰ Starting PKM initialization after timeout');
      initializePKM();
    }, 100); // Increased timeout slightly
  }, [pkm]);

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

  // Load initial data after component is mounted
  useEffect(() => {
    if (isMounted) {
      refreshData();
    }
  }, [isMounted, refreshData]);

  // Command Palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+P or Ctrl+K to open command palette
      if ((e.altKey && e.key === 'p') || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        setShowCommandPalette(true);
        analytics.trackEvent('mode_switched', { action: 'command_palette_opened' });
      }

      // Escape to close command palette
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle search
  type SearchOptions = {
    limit?: number;
    includeContent?: boolean;
    tags?: string[];
    folders?: string[];
  };

  const handleSearch = useCallback(
    async (query: string, options?: SearchOptions): Promise<SearchResult[]> => {
      try {
        // Track search event
        analytics.trackEvent('search_performed', {
          query: query.length > 50 ? query.substring(0, 50) + '...' : query,
          queryLength: query.length,
          hasOptions: !!options,
          timestamp: new Date().toISOString(),
        });

        const params = new URLSearchParams({
          q: query,
          limit: options?.limit?.toString() || '20',
          includeContent: options?.includeContent?.toString() || 'true',
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

          // Track search results
          analytics.trackEvent('search_completed', {
            resultsCount: data.results?.length || 0,
            query: query.length > 50 ? query.substring(0, 50) + '...' : query,
          });

          return data.results || [];
        }
      } catch (error) {
        console.error('Search error:', error);
        analytics.trackEvent('search_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      return [];
    },
    []
  );

  // Handle note selection
  const handleNoteSelect = useCallback(
    (noteId: string) => {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        console.log('[PAGE] handleNoteSelect - note:', note.id, note.name);

        // Track note view
        analytics.trackEvent('note_viewed', {
          noteId: note.id,
          noteName: note.name,
          wordCount: note.wordCount,
          hasLinks: note.content.includes('[['),
          tagCount: note.tags.length,
        });

        setActiveNote(note);
        setMarkdown(note.content);
        setFileName(note.name.replace('.md', ''));
        setFolder(note.folder || '');

        // Update PKM system's active note
        console.log('[PAGE] Setting active note in PKM:', note.id);
        pkm.setActiveNote(note.id);
        console.log('[PAGE] PKM activeNoteId is now:', pkm.viewState.activeNoteId);
      }
    },
    [notes, pkm]
  );

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
        body: JSON.stringify({
          content: markdown,
          overwrite: forceOverwrite,
        }),
      });

      if (response.ok) {
        setSaveStatus('Note saved successfully! 🎉');

        // Track note save
        const wordCount = markdown.split(/\s+/).filter(word => word.length > 0).length;
        const hasWikilinks = markdown.includes('[[');
        const tagMatches = markdown.match(/#\w+/g) || [];

        analytics.trackEvent(activeNote ? 'note_updated' : 'note_created', {
          noteId:
            typeof activeNote === 'object' && activeNote && 'id' in activeNote
              ? activeNote.id
              : 'new',
          fileName: fileName,
          wordCount: wordCount,
          characterCount: markdown.length,
          hasWikilinks: hasWikilinks,
          tagCount: tagMatches.length,
          folder: folder || null,
          isOverwrite: forceOverwrite,
        });

        // Create or update note in PKM system
        if (activeNote) {
          await pkm.updateNote(activeNote.id, {
            content: markdown,
            name: fileName + '.md',
            folder: folder || undefined,
          });
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
    if (
      !window.confirm('Are you sure you want to delete this note? This action cannot be undone.')
    ) {
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
        method: 'DELETE',
      });

      if (response.ok) {
        await pkm.deleteNote(noteId);
        await refreshData();

        // Clear active note if it was deleted
        if (activeNote?.id === noteId) {
          setActiveNote(null);
          pkm.setActiveNote(undefined); // Clear active note in PKM
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
    analytics.trackEvent('note_created', {
      action: 'new_note_button_clicked',
    });

    setActiveNote(null);
    pkm.setActiveNote(undefined); // Clear active note in PKM
    setMarkdown('# New Note\n\nStart writing your thoughts here...');
    setFileName('');
    setFolder('');
    setCurrentView('editor');
  };

  // Graph node click handler
  const handleGraphNodeClick = (nodeId: string) => {
    analytics.trackEvent('link_clicked', {
      linkType: 'graph_node',
      targetNoteId: nodeId,
      source: 'graph_view',
    });

    handleNoteSelect(nodeId);
    setCurrentView('editor');
  };

  // Render wikilinks in markdown
  const processedMarkdown = pkm.renderContent(markdown);

  // Debug logging to see if wikilinks are being processed
  if (markdown !== processedMarkdown) {
    console.log('Original markdown:', markdown.substring(0, 200) + '...');
    console.log('Processed markdown:', processedMarkdown.substring(0, 200) + '...');
  }

  return (
    <>
      <style jsx global>{`
        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          overflow-x: hidden !important;
        }

        * {
          box-sizing: border-box !important;
        }

        .main-container,
        .header-container {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .main-container,
          .header-container {
            width: 100% !important;
            max-width: none !important;
            min-width: 100% !important;
          }
        }
      `}</style>
      <div
        className="min-h-screen"
        style={{
          backgroundColor: 'var(--bg-primary)',
          margin: 0,
          padding: 0,
          width: '100%',
        }}
      >
        {/* Header */}
        <header
          className="shadow-sm border-b header-container"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            width: '100%',
            margin: 0,
          }}
        >
          <div
            className="header-container"
            style={{
              width: '100%',
              margin: 0,
              paddingLeft: '1rem',
              paddingRight: '1rem',
            }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-4 sm:space-y-0">
              <div className="flex flex-row items-center gap-3 lg:gap-4">
                {/* Hamburger menu for mobile */}
                <button
                  className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setShowMobileSidebar(true)}
                  aria-label="Open sidebar menu"
                  type="button"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                {/* Title moved to AppHeader as a link */}
                {/* Quick Stats moved to sidebar below */}
              </div>

              <AppHeader
                theme={theme}
                currentView={currentView}
                viewMode={viewMode}
                settings={settings}
                isMounted={isMounted}
                onViewChange={view =>
                  setCurrentView(view as 'editor' | 'graph' | 'search' | 'analytics' | 'plugins')
                }
                onViewModeChange={mode => setViewMode(mode as 'edit' | 'preview' | 'split')}
                onButtonClick={handleButtonClick}
                onAnalyticsTrack={(event: string, data?: Record<string, unknown>) =>
                  analytics.trackEvent(event as AnalyticsEventType, data)
                }
              />
            </div>
          </div>
        </header>

        <div
          className="main-container"
          style={{
            width: '100%',
            margin: 0,
            paddingLeft: '1rem',
            paddingRight: '1rem',
            paddingTop: '1rem',
            paddingBottom: '1.5rem',
          }}
          data-main-container
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Mobile Sidebar Drawer */}
            {showMobileSidebar && (
              <div className="fixed inset-0 z-40 flex" onClick={() => setShowMobileSidebar(false)}>
                <div
                  className="relative w-72 max-w-full h-full bg-white dark:bg-gray-900 shadow-xl p-4 overflow-y-auto z-50 animate-slide-in-left"
                  onClick={e => e.stopPropagation()}
                >
                  <Sidebar
                    fileName={fileName}
                    setFileName={setFileName}
                    folder={folder}
                    setFolder={setFolder}
                    saveNote={() => {
                      saveNote();
                      setShowMobileSidebar(false);
                    }}
                    saveStatus={saveStatus}
                    createNewNote={() => {
                      createNewNote();
                      setShowMobileSidebar(false);
                    }}
                    graphStats={graphStats}
                    tags={tags}
                    currentView={currentView}
                    handleSearch={handleSearch}
                    handleNoteSelect={noteId => {
                      handleNoteSelect(noteId);
                      setShowMobileSidebar(false);
                    }}
                    notes={notes}
                    activeNote={activeNote}
                    deleteNote={deleteNote}
                    theme={theme}
                  />
                  <button
                    className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-red-500"
                    onClick={() => setShowMobileSidebar(false)}
                    aria-label="Close sidebar"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0 order-2 lg:order-1">
              <Sidebar
                fileName={fileName}
                setFileName={setFileName}
                folder={folder}
                setFolder={setFolder}
                saveNote={saveNote}
                saveStatus={saveStatus}
                createNewNote={createNewNote}
                graphStats={graphStats}
                tags={tags}
                currentView={currentView}
                handleSearch={handleSearch}
                handleNoteSelect={handleNoteSelect}
                notes={notes}
                activeNote={activeNote}
                deleteNote={deleteNote}
                theme={theme}
              />
            </div>
            {/* Main Content Area */}
            <div className="flex-1 min-w-0 order-1 lg:order-2">
              {currentView === 'notes' ? (
                <NotesComponent refreshNotes={notesComponentRefreshRef} />
              ) : (
                <MainPanel
                  currentView={currentView}
                  markdown={markdown}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  handleMarkdownChange={handleMarkdownChange}
                  processedMarkdown={processedMarkdown}
                  theme={theme}
                  analytics={analytics}
                  graph={graph}
                  activeNote={activeNote}
                  handleGraphNodeClick={handleGraphNodeClick}
                  handleSearch={handleSearch}
                  handleNoteSelect={handleNoteSelect}
                  tags={tags}
                  folders={folders}
                  notes={notes}
                />
              )}
            </div>
          </div>
        </div>

        {/* Collaboration Settings Modal */}
        {showCollabSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className="rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
            >
              <div
                className="flex items-center justify-between p-6 border-b"
                style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
              >
                <h2
                  className="text-lg font-semibold"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Collaboration Settings
                </h2>
                <button
                  onClick={() => setShowCollabSettings(false)}
                  className="hover:opacity-70"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <CollaborationSettings settings={settings} onSettingsChange={updateSettings} />
            </div>
          </div>
        )}

        {/* User Profile Modal */}
        {showUserProfile && <UserProfile onClose={() => setShowUserProfile(false)} />}

        {/* AI Chat Panel */}
        <AIChat
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
          currentNoteId={activeNote?.id}
        />

        {/* Writing Assistant Panel */}
        <WritingAssistant
          isOpen={showWritingAssistant}
          onClose={() => setShowWritingAssistant(false)}
          content={activeNote?.content || markdown}
          noteId={activeNote?.id}
          onContentChange={(newContent: string) => {
            if (activeNote) {
              const updatedNote = { ...activeNote, content: newContent };
              setActiveNote(updatedNote);
              setMarkdown(newContent);
              const updatedNotes = notes.map(n => (n.id === activeNote.id ? updatedNote : n));
              setNotes(updatedNotes);
            } else {
              setMarkdown(newContent);
            }
          }}
        />

        {/* Knowledge Discovery Panel */}
        <KnowledgeDiscovery
          isOpen={showKnowledgeDiscovery}
          onClose={() => setShowKnowledgeDiscovery(false)}
          notes={notes}
          tags={tags}
          onCreateNote={async (title, content) => {
            const newFileName = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            setFileName(newFileName);
            setMarkdown(content);
            // Create and save the note
            const pkm = getPKMSystem();
            await pkm.createNote(newFileName, content);
            setShowKnowledgeDiscovery(false);
          }}
          onOpenNote={noteId => {
            handleNoteSelect(noteId);
            setShowKnowledgeDiscovery(false);
          }}
        />

        {/* Research Assistant Panel */}
        <ResearchAssistant
          isOpen={showResearchAssistant}
          onClose={() => setShowResearchAssistant(false)}
          notes={notes}
          onCreateNote={async (title, content) => {
            const newFileName = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            setFileName(newFileName);
            setMarkdown(content);
            // Create and save the note
            const pkm = getPKMSystem();
            await pkm.createNote(newFileName, content);
            setShowResearchAssistant(false);
          }}
          onOpenNote={noteId => {
            handleNoteSelect(noteId);
            setShowResearchAssistant(false);
          }}
        />

        {/* Knowledge Map */}
        <KnowledgeMap
          isOpen={showKnowledgeMap}
          onClose={() => setShowKnowledgeMap(false)}
          notes={notes}
          onOpenNote={noteId => {
            handleNoteSelect(noteId);
            setShowKnowledgeMap(false);
          }}
          onCreateNote={async (title, content) => {
            const newFileName = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            setFileName(newFileName);
            setMarkdown(content);
            // Create and save the note
            const pkm = getPKMSystem();
            await pkm.createNote(newFileName, content);
            setShowKnowledgeMap(false);
          }}
        />

        {/* Batch Analyzer */}
        <BatchAnalyzer
          isOpen={showBatchAnalyzer}
          onClose={() => setShowBatchAnalyzer(false)}
          notes={notes}
          onOpenNote={noteId => {
            handleNoteSelect(noteId);
            setShowBatchAnalyzer(false);
          }}
          onBulkUpdate={async updates => {
            // Handle bulk updates if needed
            console.log('Bulk updates:', updates);
            setShowBatchAnalyzer(false);
          }}
        />

        {/* Command Palette */}
        {isMounted && !isInitializing && (
          <CommandPalette
            isOpen={showCommandPalette}
            onClose={() => setShowCommandPalette(false)}
            onSelectNote={noteId => {
              const note = notes.find(n => n.id === noteId);
              if (note) {
                setActiveNote(note);
                setMarkdown(note.content);
                setFileName(note.name);
              }
            }}
            notes={notes}
            pkm={pkm}
          />
        )}
      </div>
    </>
  );
}
