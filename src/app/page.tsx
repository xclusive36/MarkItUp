'use client';

// React and markdown imports
import { useState, useEffect, useCallback, useRef } from 'react';
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
import { CollaborationSettings } from '@/components/CollaborationSettings';
import { UserProfile } from '@/components/UserProfile';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import UnifiedPluginManager from '@/components/UnifiedPluginManager';
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
import { analytics } from '@/lib/analytics';

// Component imports
import { SimpleDropdown } from '@/components/SimpleDropdown';
import { AppHeader } from '@/components/AppHeader';

// Icon imports
import {
  Search,
  Network,
  FileText,
  Hash,
  Folder,
  Plus,
  Save,
  X,
  Link as LinkIcon,
  Clock,
  Users,
  Settings,
  User,
  Activity,
  Brain,
  Compass,
  PenTool,
  Map,
  Command,
  BookOpen,
  BarChart3,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';

// Styles
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';
import './highlight.css';
import './manual-theme.css';

export default function Home() {
  const { theme } = useSimpleTheme();
  const { settings, updateSettings } = useCollaboration();

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

*Start writing and building your second brain...*`);

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
    'editor' | 'graph' | 'search' | 'analytics' | 'plugins'
  >('editor');

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
  const [_initializationComplete, setInitializationComplete] = useState(false);

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
        setInitializationComplete(true);
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
      }
    },
    [notes]
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
          noteId: activeNote?.id || 'new',
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
        className="min-h-screen bg-gray-50 dark:bg-gray-900"
        style={{
          backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
          margin: 0,
          padding: 0,
          width: '100%',
        }}
      >
        {/* Header */}
        <header
          className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 header-container"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
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
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
                <h1
                  className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  MarkItUp PKM
                </h1>
                {/* Quick Stats moved to sidebar below */}
              </div>

              <AppHeader
                theme={theme}
                currentView={currentView}
                viewMode={viewMode}
                settings={settings}
                isMounted={isMounted}
                onViewChange={view => setCurrentView(view as any)}
                onViewModeChange={mode => setViewMode(mode as any)}
                onButtonClick={handleButtonClick}
                onAnalyticsTrack={(event, data) => analytics.trackEvent(event as any, data)}
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
            {/* Sidebar */}
            <div className="w-full lg:w-80 lg:flex-shrink-0 order-2 lg:order-1">
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
                    onClick={() => saveNote()}
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
              <div
                className={`mb-4 lg:mb-6 ${currentView === 'search' ? 'block' : 'hidden lg:block'}`}
              >
                <SearchBox
                  onSearch={handleSearch}
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
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Knowledge Graph
                </h3>
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
                    notes.slice(0, 20).map(note => (
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
                            e.currentTarget.style.backgroundColor =
                              theme === 'dark' ? '#374151' : '#f9fafb';
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
                                {note.tags.slice(0, 2).map(tag => (
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
                              e.currentTarget.style.color =
                                theme === 'dark' ? '#9ca3af' : '#9ca3af';
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
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 order-1 lg:order-2">
              {currentView === 'editor' && (
                <div
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-280px)] lg:h-[calc(100vh-200px)] flex flex-col"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  }}
                >
                  {/* Editor Mode Toggle - Now just above the textarea */}
                  <div className="flex justify-end w-full px-0 pt-4 mb-4 pr-4">
                    <div
                      className="inline-flex gap-2 p-1 rounded-lg shadow-sm"
                      style={{
                        background: 'transparent',
                        boxShadow:
                          theme === 'dark'
                            ? '0 1px 4px rgba(0,0,0,0.25)'
                            : '0 1px 4px rgba(0,0,0,0.06)',
                      }}
                    >
                      <button
                        onClick={() => {
                          setViewMode('edit');
                          analytics.trackEvent('mode_switched', { mode: 'edit' });
                        }}
                        className={`px-3 py-1 text-xs rounded-md transition-colors shadow-sm font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                          viewMode === 'edit'
                            ? theme === 'dark'
                              ? 'bg-gray-600 text-gray-100 border border-blue-500'
                              : 'bg-white text-gray-900 border border-blue-500'
                            : theme === 'dark'
                              ? 'bg-transparent text-gray-300 border border-transparent hover:bg-gray-700 hover:text-white'
                              : 'bg-transparent text-gray-500 border border-transparent hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        style={{ minWidth: 70 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setViewMode('preview');
                          analytics.trackEvent('mode_switched', { mode: 'preview' });
                        }}
                        className={`px-3 py-1 text-xs rounded-md transition-colors shadow-sm font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                          viewMode === 'preview'
                            ? theme === 'dark'
                              ? 'bg-gray-600 text-gray-100 border border-blue-500'
                              : 'bg-white text-gray-900 border border-blue-500'
                            : theme === 'dark'
                              ? 'bg-transparent text-gray-300 border border-transparent hover:bg-gray-700 hover:text-white'
                              : 'bg-transparent text-gray-500 border border-transparent hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        style={{ minWidth: 70 }}
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => {
                          setViewMode('split');
                          analytics.trackEvent('mode_switched', { mode: 'split' });
                        }}
                        className={`px-3 py-1 text-xs rounded-md transition-colors shadow-sm font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                          viewMode === 'split'
                            ? theme === 'dark'
                              ? 'bg-gray-600 text-gray-100 border border-blue-500'
                              : 'bg-white text-gray-900 border border-blue-500'
                            : theme === 'dark'
                              ? 'bg-transparent text-gray-300 border border-transparent hover:bg-gray-700 hover:text-white'
                              : 'bg-transparent text-gray-500 border border-transparent hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        style={{ minWidth: 70 }}
                      >
                        Split
                      </button>
                    </div>
                  </div>
                  {viewMode === 'edit' && (
                    <textarea
                      value={markdown}
                      onChange={e => handleMarkdownChange(e.target.value)}
                      className="w-full h-full p-4 lg:p-6 border-none resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg font-mono text-sm editor-textarea"
                      style={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        color: theme === 'dark' ? '#f9fafb' : '#111827',
                        borderColor: 'transparent',
                      }}
                      placeholder="Start writing your markdown here..."
                    />
                  )}

                  {viewMode === 'preview' && (
                    <div className="h-full p-4 lg:p-6 overflow-y-auto">
                      <div className="prose prose-sm lg:prose prose-slate dark:prose-invert max-w-none">
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
                                    // For simple math expressions, render as KaTeX display math
                                    const isSimpleMath =
                                      !content.includes('\\') &&
                                      !content.includes('\begin') &&
                                      content.trim().length < 200;
                                    if (isSimpleMath) {
                                      return (
                                        <div className="my-4 text-center">
                                          <div className="katex-display">{`$$${content.trim()}$$`}</div>
                                        </div>
                                      );
                                    }
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
                            a(props) {
                              const { href, children } = props;
                              // Handle wikilinks (internal links starting with #note/)
                              if (href?.startsWith('#note/')) {
                                const noteId = href.replace('#note/', '');
                                return (
                                  <button
                                    onClick={e => {
                                      e.preventDefault();
                                      handleNoteSelect(noteId);
                                    }}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer bg-transparent border-none p-0 font-inherit"
                                  >
                                    {children}
                                  </button>
                                );
                              }
                              // Handle broken wikilinks (starting with #broken:)
                              if (href?.startsWith('#broken:')) {
                                const target = href.replace('#broken:', '').replace(/-/g, ' ');
                                return (
                                  <span
                                    className="text-red-500 dark:text-red-400 cursor-help underline decoration-dotted"
                                    title={`Note "${target}" doesn't exist. Click to create it.`}
                                    onClick={() => {
                                      if (window.confirm(`Create note "${target}"?`)) {
                                        setFileName(target);
                                        setMarkdown(`# ${target}\n\nStart writing...`);
                                        setCurrentView('editor');
                                        setViewMode('edit');
                                      }
                                    }}
                                  >
                                    {children}
                                  </span>
                                );
                              }
                              // Handle broken links (spans with broken-link class)
                              if (props.className === 'broken-link') {
                                return (
                                  <span
                                    className="text-red-500 dark:text-red-400 cursor-help"
                                    title="This link doesn't point to an existing note"
                                  >
                                    {children}
                                  </span>
                                );
                              }
                              // Regular external links
                              return (
                                <a {...props} target="_blank" rel="noopener noreferrer">
                                  {children}
                                </a>
                              );
                            },
                          }}
                        >
                          {processedMarkdown}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {viewMode === 'split' && (
                    <div className="h-full flex flex-col lg:flex-row">
                      <div className="w-full lg:w-1/2 h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
                        <textarea
                          value={markdown}
                          onChange={e => handleMarkdownChange(e.target.value)}
                          className="w-full h-full p-3 lg:p-6 border-none resize-none focus:outline-none font-mono text-sm editor-textarea"
                          style={{
                            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                            color: theme === 'dark' ? '#f9fafb' : '#111827',
                            borderColor: 'transparent',
                          }}
                          placeholder="Start writing..."
                        />
                      </div>
                      <div className="w-full lg:w-1/2 h-1/2 lg:h-full p-3 lg:p-6 overflow-y-auto">
                        <div className="prose prose-sm lg:prose prose-slate dark:prose-invert max-w-none">
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
                                      // For simple math expressions, render as KaTeX display math
                                      const isSimpleMath =
                                        !content.includes('\\') &&
                                        !content.includes('\begin') &&
                                        content.trim().length < 200;
                                      if (isSimpleMath) {
                                        return (
                                          <div className="my-4 text-center">
                                            <div className="katex-display">{`$$${content.trim()}$$`}</div>
                                          </div>
                                        );
                                      }
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
                              a(props) {
                                const { href, children } = props;
                                // Handle wikilinks (internal links starting with #note/)
                                if (href?.startsWith('#note/')) {
                                  const noteId = href.replace('#note/', '');
                                  return (
                                    <button
                                      onClick={e => {
                                        e.preventDefault();
                                        handleNoteSelect(noteId);
                                      }}
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer bg-transparent border-none p-0 font-inherit"
                                    >
                                      {children}
                                    </button>
                                  );
                                }
                                // Handle broken links (spans with broken-link class)
                                if (props.className === 'broken-link') {
                                  return (
                                    <span
                                      className="text-red-500 dark:text-red-400 cursor-help"
                                      title="This link doesn't point to an existing note"
                                    >
                                      {children}
                                    </span>
                                  );
                                }
                                // Regular external links
                                return (
                                  <a {...props} target="_blank" rel="noopener noreferrer">
                                    {children}
                                  </a>
                                );
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
                <div
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-280px)] lg:h-[calc(100vh-200px)]"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  }}
                >
                  <GraphView
                    graph={graph}
                    centerNode={activeNote?.id}
                    onNodeClick={handleGraphNodeClick}
                    className="w-full h-full"
                  />
                </div>
              )}

              {currentView === 'search' && (
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
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              #{tag.name}
                            </span>
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
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {folder.name}
                            </span>
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

              {currentView === 'analytics' && (
                <AnalyticsDashboard
                  notes={notes}
                  links={graph.edges.map(edge => ({
                    id: `${edge.source}-${edge.target}`,
                    source: edge.source,
                    target: edge.target,
                    type:
                      edge.type === 'link' ? 'wikilink' : edge.type === 'tag' ? 'tag' : 'backlink',
                    anchorText: undefined,
                    blockId: undefined,
                  }))}
                  tags={tags}
                  className="h-[calc(100vh-280px)] lg:h-[calc(100vh-200px)] overflow-y-auto"
                />
              )}

              {currentView === 'plugins' && (
                <div className="h-[calc(100vh-280px)] lg:h-[calc(100vh-200px)] overflow-y-auto">
                  <UnifiedPluginManager />
                </div>
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
          onCreateNote={async (title, content, _suggestedTags) => {
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
          onCreateNote={async (title, content, _suggestedTags) => {
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
          onCreateNote={async (title, content, _suggestedTags) => {
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
