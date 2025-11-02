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
import GlobalSearchPanel from '@/components/GlobalSearchPanel';
import DailyNotesCalendarModal from '@/components/DailyNotesCalendarModal';
import { AnalyticsDashboard as KnowledgeGraphAnalytics } from '@/components/KnowledgeGraphAnalytics';
import ConnectionSuggestionsModal from '@/components/ConnectionSuggestionsModal';
import MOCSuggestionsModal from '@/components/MOCSuggestionsModal';
import Breadcrumbs from '@/components/Breadcrumbs';
import WritingStatsModal from '@/components/WritingStatsModal';
import ToolbarArea from '@/components/ToolbarArea';
import BottomNav from '@/components/BottomNav';
import SelectionActionBar from '@/components/SelectionActionBar';
import MobileEditorToolbar from '@/components/MobileEditorToolbar';
import ZenMode from '@/components/ZenMode';
import NotificationQueue from '@/components/NotificationQueue';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { useToast } from '@/components/ToastProvider';
import { useAutoIndexing } from '@/hooks/useAutoIndexing';
import { useAutoSave } from '@/hooks/useAutoSave';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PageSkeleton, NotesListSkeleton, EditorSkeleton } from '@/components/SkeletonLoader';
import { useModalState } from '@/hooks/useModalState';
import { useNoteState } from '@/hooks/useNoteState';
import { useViewState } from '@/hooks/useViewState';
import { useGraphSearchState } from '@/hooks/useGraphSearchState';
import { useSaveState } from '@/hooks/useSaveState';

// PKM imports
import { getPKMSystem } from '@/lib/pkm';
import { Note, Graph, SearchResult, SearchMatch } from '@/lib/types';
import { analytics, AnalyticsEventType } from '@/lib/analytics';
import { ViewMode, MainView, ButtonAction } from '@/types/ui';

// Component imports
// ...existing code...
import { AppHeader } from '@/components/AppHeader';
import Sidebar from '@/components/Sidebar';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { QuickActionsMenu } from '@/components/QuickActionsMenu';
import { X } from 'lucide-react';
import StatusBar from '@/components/StatusBar';
import RightSidePanel from '@/components/RightSidePanel';

// Styles
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';
import './highlight.css';
import './manual-theme.css';

export default function Home() {
  const { theme } = useSimpleTheme();
  const { settings, updateSettings } = useCollaboration();
  const toast = useToast();

  // Auto-indexing hook (enabled based on user setting)
  const autoIndexEnabled =
    typeof window !== 'undefined'
      ? localStorage.getItem('vectorSearchAutoIndex') === 'true'
      : false;

  const { indexNote, removeNote: removeNoteFromIndex } = useAutoIndexing({
    enabled: autoIndexEnabled,
    debounceMs: 3000, // Wait 3 seconds after save before indexing
    onIndexComplete: noteId => {
      console.log(`[AutoIndex] Completed indexing: ${noteId}`);
    },
    onIndexError: (noteId, error) => {
      console.error(`[AutoIndex] Failed to index ${noteId}:`, error);
    },
  });

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

  // Ref for editor textarea (for plugin selection support)
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  // Modal state management (consolidated)
  const modals = useModalState();

  // Plugin state - track if Daily Notes plugin is loaded
  const [isDailyNotesLoaded, setIsDailyNotesLoaded] = useState(false);

  // Knowledge Graph Auto-Mapper data state (modal visibility handled by useModalState)
  const [graphAnalyticsData, setGraphAnalyticsData] = useState<any>(null);
  const [connectionSuggestionsData, setConnectionSuggestionsData] = useState<any[]>([]);
  const [mocSuggestionsData, setMOCSuggestionsData] = useState<any[]>([]);

  // Text selection state for SelectionActionBar
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  // Note state management (consolidated)
  const noteState = useNoteState();
  const {
    notes,
    activeNote,
    markdown,
    fileName,
    folder,
    setNotes,
    setActiveNote,
    setMarkdown,
    setFileName,
    setFolder,
    markdownRef,
    updateMarkdown,
    clearNote,
    loadNote,
  } = noteState;

  // Track markdown editing with debounce
  const [lastEditTrack, setLastEditTrack] = useState(0);
  const handleMarkdownChange = (value: string) => {
    updateMarkdown(value);

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

  // View state management (consolidated)
  const viewState = useViewState();
  const {
    viewMode,
    setViewMode,
    currentView,
    setCurrentView,
    showMobileSidebar,
    setShowMobileSidebar,
    toggleMobileSidebar,
    isLeftSidebarCollapsed,
    setIsLeftSidebarCollapsed,
    toggleLeftSidebar,
    isRightPanelOpen,
    setIsRightPanelOpen,
    toggleRightPanel,
    isRightPanelCollapsed,
    setIsRightPanelCollapsed,
    toggleRightPanelCollapse,
    isMounted,
    isInitializing,
    setIsInitializing,
  } = viewState;

  // Listen for sidebar "All Notes" click event
  useEffect(() => {
    const handler = (e: any) => {
      if (typeof e.detail === 'string') {
        if (e.detail === 'notes') setCurrentView('notes');
        if (e.detail === 'editor') setCurrentView('editor');
      } else if (e.detail && typeof e.detail === 'object' && e.detail.view === 'editor') {
        if (!e.detail.notePath) {
          // New note: clear editor state
          clearNote();
        } else {
          // Find note by path (folder/name or just name)
          const note = notes.find(n => {
            const fullPath = n.folder ? `${n.folder}/${n.name}` : n.name;
            return fullPath === e.detail.notePath;
          });
          if (note) {
            loadNote(note);
          }
        }
        setCurrentView('editor');
      }
    };
    window.addEventListener('setCurrentView', handler);
    return () => window.removeEventListener('setCurrentView', handler);
  }, [notes, clearNote, loadNote, setCurrentView]);

  // Graph and search state management (consolidated)
  const graphSearchState = useGraphSearchState();
  const { graph, setGraph, graphStats, setGraphStats, tags, setTags, folders, setFolders } =
    graphSearchState;

  // Save state management (consolidated)
  const saveState = useSaveState();
  const {
    saveStatus,
    setSaveStatus,
    lastSaved,
    setLastSaved,
    isSaving,
    setIsSaving,
    saveError,
    setSaveError,
    clearSaveStatus,
    setSaveSuccess,
    setSaveErrorWithTimeout,
  } = saveState;

  // Auto-save with 3 second debounce - only when there's a filename
  useAutoSave(
    markdown,
    async content => {
      if (!fileName.trim() || !activeNote) return; // Only auto-save existing notes

      const fullPath = folder.trim()
        ? `${folder.trim().replace(/\/+$/, '')}/${fileName.trim().replace(/\/+$/, '')}.md`
        : `${fileName.trim().replace(/\/+$/, '')}.md`;

      const response = await fetch(`/api/files/${encodeURIComponent(fullPath)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          overwrite: true, // Auto-save always overwrites
        }),
      });

      if (!response.ok) {
        throw new Error('Auto-save failed');
      }

      // Update PKM system
      if (activeNote) {
        await pkm.updateNote(activeNote.id, {
          content,
          name: fileName + '.md',
          folder: folder || undefined,
        });
      }
    },
    {
      delay: 3000, // 3 second debounce
      enabled: !!fileName.trim() && !!activeNote, // Only enable for existing notes
      onSaveStart: () => {
        setIsSaving(true);
        setSaveError(null);
      },
      onSaveSuccess: () => {
        setIsSaving(false);
        setLastSaved(new Date());
        setSaveError(null);
      },
      onSaveError: error => {
        setIsSaving(false);
        setSaveError(error.message);
        console.error('Auto-save error:', error);
      },
    }
  );

  // Simplified button handler with event delegation
  const handleButtonClick = useCallback(
    (buttonType: ButtonAction) => {
      console.log(`🎯 ${buttonType} button clicked via handleButtonClick`);

      switch (buttonType) {
        case 'command-palette':
          modals.commandPalette.open();
          break;
        case 'calendar':
          modals.calendar.open();
          analytics.trackEvent('mode_switched', { view: 'daily-notes-calendar' });
          break;
        case 'ai-chat':
          modals.aiChat.open();
          analytics.trackEvent('ai_chat', { action: 'open_chat', noteContext: !!activeNote?.id });
          break;
        case 'writing-assistant':
          modals.writingAssistant.open();
          analytics.trackEvent('ai_analysis', {
            action: 'open_writing_assistant',
            noteContext: !!activeNote?.id,
          });
          break;
        case 'knowledge-discovery':
          modals.knowledgeDiscovery.open();
          analytics.trackEvent('ai_analysis', {
            action: 'open_knowledge_discovery',
            notesCount: notes.length,
          });
          break;
        case 'research-assistant':
          modals.researchAssistant.open();
          analytics.trackEvent('ai_analysis', {
            action: 'open_research_assistant',
            notesCount: notes.length,
          });
          break;
        case 'knowledge-map':
          modals.knowledgeMap.open();
          analytics.trackEvent('ai_analysis', {
            action: 'open_knowledge_map',
            notesCount: notes.length,
          });
          break;
        case 'batch-analyzer':
          modals.batchAnalyzer.open();
          analytics.trackEvent('ai_analysis', {
            action: 'open_batch_analyzer',
            notesCount: notes.length,
          });
          break;
        case 'user-profile':
          modals.userProfile.open();
          break;
        case 'collab-settings':
          modals.collabSettings.open();
          break;
        default:
          console.log(`❌ Unknown button type: ${buttonType}`);
      }
    },
    [activeNote?.id, notes.length, modals]
  );

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
      setMarkdown: (content: string) => {
        console.log('[PAGE] setMarkdown called with content length:', content.length);
        console.log('[PAGE] Content preview:', content.substring(0, 100));
        setMarkdown(content);
        // Force textarea to update by directly setting its value
        if (editorRef.current) {
          console.log('[PAGE] Forcing textarea value update');
          editorRef.current.value = content;
        }
      },
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
      // Selection methods for plugin support
      getSelection: () => {
        const textarea = editorRef.current;
        if (!textarea) return null;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value.substring(start, end);
        return { text, start, end };
      },
      replaceSelection: (text: string) => {
        const textarea = editorRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(end);
        const newContent = before + text + after;
        setMarkdown(newContent);
        // Update cursor position after replacement
        setTimeout(() => {
          textarea.focus();
          const newPos = start + text.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
      },
      getCursorPosition: () => {
        return editorRef.current?.selectionStart || 0;
      },
      setCursorPosition: (position: number) => {
        const textarea = editorRef.current;
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(position, position);
        }
      },
      // Notification/Toast methods
      showNotification: (
        message: string,
        type: 'info' | 'success' | 'warning' | 'error' = 'info'
      ) => {
        switch (type) {
          case 'success':
            toast.success(message);
            break;
          case 'error':
            toast.error(message);
            break;
          case 'warning':
            toast.warning(message);
            break;
          case 'info':
          default:
            toast.info(message);
            break;
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

    // Mounted state is already set by useViewState hook
    console.log('🔧 Component mounted, isMounted=', isMounted);

    const initializePKM = async () => {
      try {
        hasInitialized.current = true;
        console.log('🚀 Initializing PKM system...');
        console.log('🔧 Setting isInitializing to true');
        setIsInitializing(true);

        // Session tracking is now handled automatically by AnalyticsSystem
        // No need to manually track session_started here

        // Load notes first
        console.log('🔧 Loading notes from API...');
        const notesResponse = await fetch('/api/files');
        let loadedNotes: Note[] = [];
        if (notesResponse.ok) {
          loadedNotes = await notesResponse.json();
          console.log('✅ Loaded', loadedNotes.length, 'notes from API');
        } else {
          console.error('❌ Failed to fetch notes:', notesResponse.status);
        }

        // Initialize PKM system with notes (this will load plugins)
        console.log('🔧 Calling pkm.initialize() with', loadedNotes.length, 'notes...');
        await pkm.initialize(loadedNotes);
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
  }, [pkm, isMounted, setIsInitializing]);

  // Check if Daily Notes plugin is loaded
  useEffect(() => {
    const checkDailyNotesPlugin = () => {
      try {
        // Check localStorage for enabled plugins (stored as array of plugin IDs)
        const enabledPluginsData = localStorage.getItem('markitup-enabled-plugins');
        if (enabledPluginsData) {
          const enabledPluginIds: string[] = JSON.parse(enabledPluginsData);
          const isDailyNotesActive = enabledPluginIds.includes('daily-notes');
          setIsDailyNotesLoaded(isDailyNotesActive);
        } else {
          setIsDailyNotesLoaded(false);
        }
      } catch (error) {
        console.error('Error checking Daily Notes plugin:', error);
        setIsDailyNotesLoaded(false);
      }
    };

    // Check on mount and after a delay to ensure plugins are loaded
    checkDailyNotesPlugin();
    const interval = setInterval(checkDailyNotesPlugin, 1000);

    return () => clearInterval(interval);
  }, []);

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
  }, [setNotes, setGraph, setGraphStats, setTags, setFolders]);

  // Reload the currently active note from the server
  const reloadCurrentNote = useCallback(async () => {
    if (!activeNote?.id) return;

    try {
      console.log('[Page] Reloading current note:', activeNote.id);
      // Ensure the filename has .md extension for the API call
      const filename = activeNote.id.endsWith('.md') ? activeNote.id : `${activeNote.id}.md`;
      const response = await fetch(`/api/files/${encodeURIComponent(filename)}`);
      if (response.ok) {
        const data = await response.json();
        const updatedNote = {
          ...activeNote,
          content: data.content,
        };
        setActiveNote(updatedNote);
        setMarkdown(data.content);
        console.log('[Page] Current note reloaded successfully');
      } else {
        console.error('[Page] Failed to reload note:', response.status);
      }
    } catch (error) {
      console.error('[Page] Error reloading current note:', error);
    }
  }, [activeNote, setActiveNote, setMarkdown]);

  // Load initial data after component is mounted
  useEffect(() => {
    if (isMounted) {
      refreshData();
    }
  }, [isMounted, refreshData]);

  // Knowledge Graph Auto-Mapper event listeners
  useEffect(() => {
    const handleShowAnalytics = (event: CustomEvent) => {
      setGraphAnalyticsData(event.detail.analytics);
      modals.graphAnalytics.open();
    };

    const handleShowConnectionSuggestions = (event: CustomEvent) => {
      setConnectionSuggestionsData(event.detail.connections || []);
      modals.connectionSuggestions.open();
    };

    const handleShowMOCSuggestions = (event: CustomEvent) => {
      setMOCSuggestionsData(event.detail.suggestions || []);
      modals.mocSuggestions.open();
    };

    window.addEventListener('showAnalyticsDashboard', handleShowAnalytics as EventListener);
    window.addEventListener(
      'showConnectionSuggestions',
      handleShowConnectionSuggestions as EventListener
    );
    window.addEventListener('showMOCSuggestions', handleShowMOCSuggestions as EventListener);

    return () => {
      window.removeEventListener('showAnalyticsDashboard', handleShowAnalytics as EventListener);
      window.removeEventListener(
        'showConnectionSuggestions',
        handleShowConnectionSuggestions as EventListener
      );
      window.removeEventListener('showMOCSuggestions', handleShowMOCSuggestions as EventListener);
    };
  }, [modals]);

  // Command Palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const metaKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl+K to open command palette
      if (metaKey && e.key === 'k') {
        e.preventDefault();
        modals.commandPalette.open();
        analytics.trackEvent('mode_switched', { action: 'command_palette_opened' });
        return;
      }

      // Cmd/Ctrl+S to save
      if (metaKey && e.key === 's') {
        e.preventDefault();
        saveNote();
        toast.success('Note saved');
        return;
      }

      // Cmd/Ctrl+I to toggle AI Chat
      if (metaKey && e.key === 'i') {
        e.preventDefault();
        modals.aiChat.toggle();
        return;
      }

      // Cmd/Ctrl+Shift+F to toggle Zen Mode
      if (metaKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        modals.zenMode.toggle();
        analytics.trackEvent('mode_switched', { action: 'zen_mode_toggled' });
        return;
      }

      // ? to show keyboard shortcuts
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        modals.keyboardHelp.open();
        return;
      }

      // Ctrl+Shift+F or Cmd+Shift+F to show global search
      if (e.key === 'F' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        modals.globalSearch.open();
        analytics.trackEvent('global_search_opened', { trigger: 'keyboard_shortcut' });
        return;
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        modals.commandPalette.close();
        modals.keyboardHelp.close();
        modals.aiChat.close();
        modals.writingAssistant.close();
        modals.knowledgeDiscovery.close();
        modals.researchAssistant.close();
        modals.knowledgeMap.close();
        modals.batchAnalyzer.close();
        modals.globalSearch.close();
        modals.zenMode.close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown, fileName, folder, modals]);

  // Command Palette custom event listeners
  useEffect(() => {
    const handleOpenAIChat = () => modals.aiChat.open();
    const handleOpenWritingAssistant = () => modals.writingAssistant.open();
    const handleOpenKnowledgeDiscovery = () => modals.knowledgeDiscovery.open();
    const handleOpenResearchAssistant = () => modals.researchAssistant.open();
    const handleOpenKnowledgeMap = () => modals.knowledgeMap.open();
    const handleOpenBatchAnalyzer = () => modals.batchAnalyzer.open();
    const handleOpenGlobalSearch = () => {
      modals.globalSearch.open();
      analytics.trackEvent('global_search_opened', { trigger: 'event' });
    };
    const handleToggleRightPanel = toggleRightPanel;
    const handleToggleSidebar = toggleMobileSidebar;
    const handleToggleLeftSidebar = toggleLeftSidebar;

    const handleRefreshNotes = async () => {
      // Refresh notes from API without reloading the page
      console.log('[Page] handleRefreshNotes called');
      try {
        const notesResponse = await fetch('/api/files');
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          console.log('[Page] Notes refreshed, count:', notesData.length);
          setNotes(notesData);
        }
      } catch (error) {
        console.error('Failed to refresh notes:', error);
      }
    };

    window.addEventListener('openAIChat', handleOpenAIChat);
    window.addEventListener('openWritingAssistant', handleOpenWritingAssistant);
    window.addEventListener('openKnowledgeDiscovery', handleOpenKnowledgeDiscovery);
    window.addEventListener('openResearchAssistant', handleOpenResearchAssistant);
    window.addEventListener('openKnowledgeMap', handleOpenKnowledgeMap);
    window.addEventListener('openBatchAnalyzer', handleOpenBatchAnalyzer);
    window.addEventListener('openGlobalSearch', handleOpenGlobalSearch);
    window.addEventListener('toggleRightPanel', handleToggleRightPanel);
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    window.addEventListener('toggleLeftSidebar', handleToggleLeftSidebar);
    window.addEventListener('refreshNotes', handleRefreshNotes);

    return () => {
      window.removeEventListener('openAIChat', handleOpenAIChat);
      window.removeEventListener('openWritingAssistant', handleOpenWritingAssistant);
      window.removeEventListener('openKnowledgeDiscovery', handleOpenKnowledgeDiscovery);
      window.removeEventListener('openResearchAssistant', handleOpenResearchAssistant);
      window.removeEventListener('openKnowledgeMap', handleOpenKnowledgeMap);
      window.removeEventListener('openBatchAnalyzer', handleOpenBatchAnalyzer);
      window.removeEventListener('openGlobalSearch', handleOpenGlobalSearch);
      window.removeEventListener('toggleRightPanel', handleToggleRightPanel);
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
      window.removeEventListener('toggleLeftSidebar', handleToggleLeftSidebar);
      window.removeEventListener('refreshNotes', handleRefreshNotes);
    };
  }, [modals, toggleRightPanel, toggleMobileSidebar, toggleLeftSidebar, setNotes]); // Handle search
  type SearchOptions = {
    limit?: number;
    includeContent?: boolean;
    tags?: string[];
    folders?: string[];
    mode?: 'keyword' | 'semantic' | 'hybrid' | 'regex';
  };

  const handleSearch = useCallback(
    async (query: string, options?: SearchOptions): Promise<SearchResult[]> => {
      try {
        // Track search event
        analytics.trackEvent('search_performed', {
          query: query.length > 50 ? query.substring(0, 50) + '...' : query,
          queryLength: query.length,
          hasOptions: !!options,
          searchMode: options?.mode || 'keyword',
          timestamp: new Date().toISOString(),
        });

        // Handle regex mode client-side
        if (options?.mode === 'regex') {
          try {
            const regex = new RegExp(query, 'gi');
            const results: SearchResult[] = [];

            notes.forEach(note => {
              const matches: SearchMatch[] = [];
              const lines = note.content.split('\n');

              lines.forEach((line, lineNumber) => {
                const lineMatches = line.matchAll(regex);
                for (const match of lineMatches) {
                  matches.push({
                    text: match[0],
                    start: match.index || 0,
                    end: (match.index || 0) + match[0].length,
                    lineNumber: lineNumber + 1,
                    context: line,
                  });
                }
              });

              if (matches.length > 0) {
                results.push({
                  noteId: note.id,
                  noteName: note.name,
                  matches,
                  score: matches.length / 10, // Simple score based on match count
                });
              }
            });

            analytics.trackEvent('search_completed', {
              resultsCount: results.length,
              query: query.length > 50 ? query.substring(0, 50) + '...' : query,
              searchMode: 'regex',
            });

            return results.sort((a, b) => b.score - a.score).slice(0, options?.limit || 50);
          } catch (error) {
            console.error('Regex error:', error);
            return [];
          }
        }

        // Use vector search API if mode is specified (semantic or hybrid)
        const useVectorSearch = options?.mode && ['semantic', 'hybrid'].includes(options.mode);
        const apiEndpoint = useVectorSearch ? '/api/vector/search' : '/api/search';

        const params = new URLSearchParams({
          q: query,
          limit: options?.limit?.toString() || '20',
          includeContent: options?.includeContent?.toString() || 'true',
        });

        if (options?.mode) {
          params.set('mode', options.mode);
        }
        if (options?.tags?.length) {
          params.set('tags', options.tags.join(','));
        }
        if (options?.folders?.length) {
          params.set('folders', options.folders.join(','));
        }

        const response = await fetch(`${apiEndpoint}?${params}`);
        if (response.ok) {
          const data = await response.json();

          // Track search results
          analytics.trackEvent('search_completed', {
            resultsCount: data.results?.length || 0,
            query: query.length > 50 ? query.substring(0, 50) + '...' : query,
            searchMode: options?.mode || 'keyword',
          });

          return data.results || [];
        }
      } catch (error) {
        console.error('Search error:', error);
        analytics.trackEvent('search_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          searchMode: options?.mode || 'keyword',
        });
      }
      return [];
    },
    [notes]
  );

  // Handle note selection
  const handleNoteSelect = useCallback(
    async (noteId: string) => {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        console.log('[PAGE] handleNoteSelect - note:', note.id, note.name);

        // Fetch the latest content from server to ensure auto-saved changes are loaded
        try {
          const filename = note.folder ? `${note.folder}/${note.name}` : note.name;
          const response = await fetch(`/api/files/${encodeURIComponent(filename)}`);

          if (response.ok) {
            const data = await response.json();
            console.log('[PAGE] Loaded fresh content from server');

            // Use the fresh content from the server
            const updatedNote = {
              ...note,
              content: data.content,
              updatedAt: data.updatedAt,
            };

            // Track note view
            analytics.trackEvent('note_viewed', {
              noteId: updatedNote.id,
              noteName: updatedNote.name,
              wordCount: updatedNote.wordCount,
              hasLinks: updatedNote.content.includes('[['),
              tagCount: updatedNote.tags.length,
            });

            // Load the note using helper
            loadNote(updatedNote);

            // Update PKM system's active note
            console.log('[PAGE] Setting active note in PKM:', updatedNote.id);
            pkm.setActiveNote(updatedNote.id);
            console.log('[PAGE] PKM activeNoteId is now:', pkm.viewState.activeNoteId);
          } else {
            console.error('[PAGE] Failed to fetch note content:', response.status);
            // Fallback to cached content if fetch fails
            loadNote(note);
            pkm.setActiveNote(note.id);
          }
        } catch (error) {
          console.error('[PAGE] Error fetching note content:', error);
          // Fallback to cached content if fetch fails
          loadNote(note);
          pkm.setActiveNote(note.id);
        }
      }
    },
    [notes, pkm, loadNote]
  );

  // Save note
  const saveNote = async (forceOverwrite: boolean | React.MouseEvent = false) => {
    // If forceOverwrite is an event object, treat it as false
    const shouldOverwrite = typeof forceOverwrite === 'boolean' ? forceOverwrite : false;

    if (!fileName.trim()) {
      setSaveErrorWithTimeout('Please enter a filename');
      return;
    }

    setIsSaving(true);
    clearSaveStatus();

    try {
      const fullPath = folder.trim()
        ? `${folder.trim().replace(/\/+$/, '')}/${fileName.trim().replace(/\/+$/, '')}.md`
        : `${fileName.trim().replace(/\/+$/, '')}.md`;

      // Use the ref to get the latest content (important for WritingAssistant auto-save)
      const currentMarkdown = markdownRef.current;
      console.log('[saveNote] Using markdown from ref, length:', currentMarkdown.length);

      // Ensure markdown is a string to prevent circular reference errors
      const cleanMarkdown =
        typeof currentMarkdown === 'string' ? currentMarkdown : String(currentMarkdown);

      const response = await fetch(`/api/files/${encodeURIComponent(fullPath)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: cleanMarkdown,
          overwrite: shouldOverwrite,
        }),
      });

      if (response.ok) {
        setSaveSuccess();

        // Show success toast
        if (shouldOverwrite) {
          toast.success('File overwritten successfully! 🎉');
        } else {
          toast.success('Note saved successfully! 🎉');
        }

        // Track note save
        const wordCount = currentMarkdown.split(/\s+/).filter(word => word.length > 0).length;
        const hasWikilinks = currentMarkdown.includes('[[');
        const tagMatches = currentMarkdown.match(/#\w+/g) || [];

        analytics.trackEvent(activeNote ? 'note_updated' : 'note_created', {
          noteId:
            typeof activeNote === 'object' && activeNote && 'id' in activeNote
              ? activeNote.id
              : 'new',
          fileName: fileName,
          wordCount: wordCount,
          characterCount: currentMarkdown.length,
          hasWikilinks: hasWikilinks,
          tagCount: tagMatches.length,
          folder: folder || null,
          isOverwrite: shouldOverwrite,
        });

        // Create or update note in PKM system
        if (activeNote) {
          await pkm.updateNote(activeNote.id, {
            content: currentMarkdown,
            name: fileName + '.md',
            folder: folder || undefined,
          });
        } else {
          await pkm.createNote(fileName, currentMarkdown, folder || undefined);
        }

        // Refresh data
        await refreshData();

        // Trigger auto-indexing if enabled
        if (autoIndexEnabled && indexNote) {
          // Get the updated note for indexing
          const updatedNote = await pkm.getNote(fileName + '.md');
          if (updatedNote) {
            indexNote(updatedNote);
          }
        }

        setTimeout(() => setSaveStatus(''), 3000);
      } else if (response.status === 409) {
        const data = await response.json();
        if (data.requiresOverwrite) {
          // Show toast with action button to overwrite
          toast.warning(
            data.prompt || 'File already exists. Click Overwrite to replace it.',
            'Overwrite',
            () => {
              saveNote(true);
            }
          );
          setSaveErrorWithTimeout('File already exists');
        } else {
          setSaveErrorWithTimeout(data.error || 'Error saving file');
        }
      } else {
        setSaveErrorWithTimeout('Error saving file');
      }
    } catch (error) {
      setSaveErrorWithTimeout('Network error');
      console.error('Error saving file:', error);
    } finally {
      setIsSaving(false);
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
        toast.error('Note not found!');
        return;
      }

      const fullPath = note.folder ? `${note.folder}/${note.name}` : note.name;
      const response = await fetch(`/api/files/${encodeURIComponent(fullPath)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await pkm.deleteNote(noteId);
        await refreshData();

        // Remove from vector index if auto-indexing is enabled
        if (autoIndexEnabled && removeNoteFromIndex) {
          await removeNoteFromIndex(noteId);
        }

        // Clear active note if it was deleted
        if (activeNote?.id === noteId) {
          clearNote();
          pkm.setActiveNote(undefined); // Clear active note in PKM
        }

        // Show success message
        toast.success('Note deleted successfully! 🗑️');
      } else {
        // Handle HTTP error responses
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        toast.error(`Failed to delete note: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      // Handle network errors (like server not running)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error(
          'Cannot connect to server. Please make sure the development server is running.'
        );
      } else {
        toast.error('An unexpected error occurred while deleting the note.');
      }
    }
  };

  // Create new note
  const createNewNote = () => {
    analytics.trackEvent('note_created', {
      action: 'new_note_button_clicked',
    });

    clearNote();
    pkm.setActiveNote(undefined); // Clear active note in PKM
    setCurrentView('editor');
  };

  // Graph node click handler
  const handleGraphNodeClick = useCallback(
    (nodeId: string) => {
      analytics.trackEvent('link_clicked', {
        linkType: 'graph_node',
        targetNoteId: nodeId,
        source: 'graph_view',
      });

      handleNoteSelect(nodeId);
      setCurrentView('editor');
    },
    [handleNoteSelect, setCurrentView]
  );

  // Render wikilinks in markdown
  const processedMarkdown = pkm.renderContent(markdown);

  // Debug logging to see if wikilinks are being processed
  if (markdown !== processedMarkdown) {
    console.log('Original markdown:', markdown.substring(0, 200) + '...');
    console.log('Processed markdown:', processedMarkdown.substring(0, 200) + '...');
  }

  // Show skeleton during initial load
  if (!isMounted || isInitializing) {
    return <PageSkeleton />;
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
          className="shadow-sm border-b header-container transition-all duration-300"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            width: '100%',
            margin: 0,
            paddingRight: isRightPanelOpen ? (isRightPanelCollapsed ? '48px' : '0') : '0',
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 lg:py-4 space-y-4 sm:space-y-0">
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
                isDailyNotesLoaded={isDailyNotesLoaded}
                onViewChange={(view: MainView) => setCurrentView(view)}
                onViewModeChange={(mode: ViewMode) => setViewMode(mode)}
                onButtonClick={handleButtonClick}
                onAnalyticsTrack={(event: string, data?: Record<string, unknown>) =>
                  analytics.trackEvent(event as AnalyticsEventType, data)
                }
              />
            </div>
          </div>
        </header>

        {/* Toolbar Area - shown when in editor view */}
        {currentView === 'editor' && (
          <ToolbarArea
            onSave={saveNote}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isSaving={isSaving}
            canSave={!!fileName.trim() && !!markdown.trim()}
            theme={theme as 'light' | 'dark'}
            isLeftSidebarCollapsed={isLeftSidebarCollapsed}
          />
        )}

        <div
          className="main-container"
          style={{
            width: '100%',
            margin: 0,
            paddingLeft: '1rem',
            paddingRight: '1rem',
            paddingTop: '1rem',
            paddingBottom: '5rem', // Extra padding for status bar + bottom nav on mobile
          }}
          data-main-container
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Mobile Sidebar Drawer */}
            {showMobileSidebar && (
              <div
                className="fixed inset-0 z-40 flex backdrop-blur-custom bg-black bg-opacity-20"
                onClick={() => setShowMobileSidebar(false)}
              >
                <div
                  className="relative w-72 max-w-full h-full shadow-xl p-4 overflow-y-auto z-50 animate-slide-in-left custom-scrollbar"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <Sidebar
                    fileName={fileName}
                    setFileName={setFileName}
                    folder={folder}
                    setFolder={setFolder}
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
            <div className="hidden lg:block order-2 lg:order-1">
              <CollapsibleSidebar
                fileName={fileName}
                setFileName={setFileName}
                folder={folder}
                setFolder={setFolder}
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
                isCollapsed={isLeftSidebarCollapsed}
                onToggleCollapse={toggleLeftSidebar}
              />
            </div>
            {/* Main Content Area */}
            <div
              className="flex-1 min-w-0 order-1 lg:order-2 transition-all duration-300"
              style={{
                paddingRight: isRightPanelOpen ? (isRightPanelCollapsed ? '48px' : '0') : '0',
                paddingLeft: isLeftSidebarCollapsed ? '48px' : '0',
              }}
            >
              {/* Breadcrumbs - show when in editor view with active note */}
              {currentView === 'editor' && activeNote && (
                <Breadcrumbs
                  folder={activeNote.folder || ''}
                  fileName={activeNote.name}
                  onNavigateHome={() => {
                    setCurrentView('editor');
                    setActiveNote(null);
                    setMarkdown('');
                    setFileName('');
                    setFolder('');
                  }}
                  onNavigateToFolder={folderPath => {
                    // Set current view to notes and filter by folder
                    setCurrentView('notes');
                    setFolder(folderPath);
                  }}
                  theme={theme}
                />
              )}

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
                  editorRef={editorRef}
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
        {modals.collabSettings.isOpen && (
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
                  onClick={modals.collabSettings.close}
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
        {modals.userProfile.isOpen && <UserProfile onClose={modals.userProfile.close} />}

        {/* AI Chat Panel */}
        <AIChat
          isOpen={modals.aiChat.isOpen}
          onClose={modals.aiChat.close}
          currentNoteId={activeNote?.id}
          currentNoteContent={activeNote?.content}
          currentNoteName={activeNote?.name}
          onRefreshData={refreshData}
          onReloadCurrentNote={reloadCurrentNote}
        />

        {/* Writing Assistant Panel */}
        <WritingAssistant
          isOpen={modals.writingAssistant.isOpen}
          onClose={modals.writingAssistant.close}
          content={activeNote?.content || markdown}
          noteId={activeNote?.id}
          onContentChange={(newContent: string) => {
            console.log('[PAGE] WritingAssistant onContentChange called');
            console.log('[PAGE] New content length:', newContent.length);
            console.log('[PAGE] Old markdown length:', markdown.length);
            if (activeNote) {
              console.log('[PAGE] Updating active note:', activeNote.id);
              const updatedNote = { ...activeNote, content: newContent };
              setActiveNote(updatedNote);
              setMarkdown(newContent);
              const updatedNotes = notes.map(n => (n.id === activeNote.id ? updatedNote : n));
              setNotes(updatedNotes);
            } else {
              console.log('[PAGE] No active note, updating markdown only');
              setMarkdown(newContent);
            }
            console.log('[PAGE] State updates queued');
          }}
          onSave={async () => {
            console.log('[PAGE] WritingAssistant onSave called');
            console.log('[PAGE] Using markdownRef.current length:', markdownRef.current.length);
            console.log('[PAGE] markdown state length:', markdown.length);
            // The ref should have the latest value even if state hasn't updated yet
            // Auto-save from WritingAssistant should force overwrite (file already exists)
            await saveNote(true);
          }}
        />

        {/* Knowledge Discovery Panel */}
        <KnowledgeDiscovery
          isOpen={modals.knowledgeDiscovery.isOpen}
          onClose={modals.knowledgeDiscovery.close}
          notes={notes}
          tags={tags}
          onCreateNote={async (title, content) => {
            try {
              toast.info('Creating note...');

              // Save current note first if there's content
              if (fileName && markdown.trim()) {
                try {
                  const fullPath = folder.trim()
                    ? `${folder.trim().replace(/\/+$/, '')}/${fileName.trim().replace(/\/+$/, '')}.md`
                    : `${fileName.trim().replace(/\/+$/, '')}.md`;

                  await fetch(`/api/files/${encodeURIComponent(fullPath)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      content: markdown,
                      overwrite: true, // Allow overwriting existing file
                    }),
                  });
                  console.log('✅ Current note saved before creating new note');
                } catch (error) {
                  console.error('Failed to save current note:', error);
                  toast.error('Failed to save current note');
                }
              }

              // Create the new suggested note
              const newFileName = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
              const newFilePath = `${newFileName}.md`;

              // Save the new note file to disk via API
              const createResponse = await fetch(`/api/files/${encodeURIComponent(newFilePath)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: content,
                  overwrite: false, // Don't overwrite if it already exists
                }),
              });

              if (!createResponse.ok) {
                throw new Error(`Failed to create note file: ${createResponse.statusText}`);
              }
              console.log('✅ New note file created:', newFilePath);

              // Refresh ALL data (notes list, graph, tags, etc.)
              console.log('🔄 Refreshing all PKM data...');
              await refreshData();
              console.log('✅ PKM data refreshed');

              // Also refresh the NotesComponent sidebar
              if (notesComponentRefreshRef.current) {
                console.log('🔄 Refreshing notes sidebar...');
                await notesComponentRefreshRef.current();
                console.log('✅ Notes sidebar refreshed');
              }

              // Give the UI a moment to update
              await new Promise(resolve => setTimeout(resolve, 100));

              // Update PKM system
              const pkm = getPKMSystem();
              await pkm.createNote(newFileName, content);

              // Switch to the new note
              setFileName(newFileName);
              setMarkdown(content);
              modals.knowledgeDiscovery.close();

              toast.success(`Note "${title}" created successfully! 📝`);
            } catch (error) {
              console.error('Failed to create note:', error);
              toast.error('Failed to create note');
            }
          }}
          onOpenNote={noteId => {
            handleNoteSelect(noteId);
            modals.knowledgeDiscovery.close();
          }}
        />

        {/* Research Assistant Panel */}
        <ResearchAssistant
          isOpen={modals.researchAssistant.isOpen}
          onClose={modals.researchAssistant.close}
          notes={notes}
          onCreateNote={async (title, content) => {
            try {
              toast.info('Creating note...');

              // Save current note first if there's content
              if (fileName && markdown.trim()) {
                try {
                  const fullPath = folder.trim()
                    ? `${folder.trim().replace(/\/+$/, '')}/${fileName.trim().replace(/\/+$/, '')}.md`
                    : `${fileName.trim().replace(/\/+$/, '')}.md`;

                  await fetch(`/api/files/${encodeURIComponent(fullPath)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      content: markdown,
                      overwrite: true, // Allow overwriting existing file
                    }),
                  });
                  console.log('✅ Current note saved before creating new note');
                } catch (error) {
                  console.error('Failed to save current note:', error);
                  toast.error('Failed to save current note');
                }
              }

              // Create the new suggested note
              const newFileName = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
              const newFilePath = `${newFileName}.md`;

              // Save the new note file to disk via API
              const createResponse = await fetch(`/api/files/${encodeURIComponent(newFilePath)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: content,
                  overwrite: false, // Don't overwrite if it already exists
                }),
              });

              if (!createResponse.ok) {
                throw new Error(`Failed to create note file: ${createResponse.statusText}`);
              }
              console.log('✅ New note file created:', newFilePath);

              // Refresh ALL data (notes list, graph, tags, etc.)
              console.log('🔄 Refreshing all PKM data...');
              await refreshData();
              console.log('✅ PKM data refreshed');

              // Also refresh the NotesComponent sidebar
              if (notesComponentRefreshRef.current) {
                console.log('🔄 Refreshing notes sidebar...');
                await notesComponentRefreshRef.current();
                console.log('✅ Notes sidebar refreshed');
              }

              // Give the UI a moment to update
              await new Promise(resolve => setTimeout(resolve, 100));

              // Update PKM system
              const pkm = getPKMSystem();
              await pkm.createNote(newFileName, content);

              // Switch to the new note
              setFileName(newFileName);
              setMarkdown(content);
              modals.researchAssistant.close();

              toast.success(`Note "${title}" created successfully! 📝`);
            } catch (error) {
              console.error('Failed to create note:', error);
              toast.error('Failed to create note');
            }
          }}
          onOpenNote={noteId => {
            handleNoteSelect(noteId);
            modals.researchAssistant.close();
          }}
        />

        {/* Knowledge Map */}
        <KnowledgeMap
          isOpen={modals.knowledgeMap.isOpen}
          onClose={modals.knowledgeMap.close}
          notes={notes}
          onOpenNote={noteId => {
            handleNoteSelect(noteId);
            modals.knowledgeMap.close();
          }}
          onCreateNote={async (title, content) => {
            const newFileName = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            setFileName(newFileName);
            setMarkdown(content);
            // Create and save the note
            const pkm = getPKMSystem();
            await pkm.createNote(newFileName, content);
            modals.knowledgeMap.close();
          }}
        />

        {/* Batch Analyzer */}
        <BatchAnalyzer
          isOpen={modals.batchAnalyzer.isOpen}
          onClose={modals.batchAnalyzer.close}
          notes={notes}
          onOpenNote={noteId => {
            handleNoteSelect(noteId);
            modals.batchAnalyzer.close();
          }}
          onBulkUpdate={async updates => {
            // Handle bulk updates if needed
            console.log('Bulk updates:', updates);
            modals.batchAnalyzer.close();
          }}
        />

        {/* Global Search Panel */}
        <GlobalSearchPanel
          isOpen={modals.globalSearch.isOpen}
          onClose={modals.globalSearch.close}
          onSearch={handleSearch}
          onSelectNote={noteId => {
            handleNoteSelect(noteId);
            modals.globalSearch.close();
          }}
          onUpdateNote={async (noteId, content) => {
            const note = notes.find(n => n.id === noteId);
            if (note) {
              await pkm.updateNote(noteId, { content });
              await refreshData();
            }
          }}
          onBulkUpdateNotes={async updates => {
            for (const update of updates) {
              const note = notes.find(n => n.id === update.noteId);
              if (note) {
                await pkm.updateNote(update.noteId, {
                  tags: update.tags,
                  folder: update.folder,
                });
              }
            }
            await refreshData();
          }}
          onBulkDeleteNotes={async noteIds => {
            for (const noteId of noteIds) {
              await pkm.deleteNote(noteId);
            }
            await refreshData();
          }}
          notes={notes}
        />

        {/* Command Palette */}
        {isMounted && !isInitializing && (
          <CommandPalette
            isOpen={modals.commandPalette.isOpen}
            onClose={modals.commandPalette.close}
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

        {/* Daily Notes Calendar */}
        <DailyNotesCalendarModal
          isOpen={modals.calendar.isOpen}
          onClose={modals.calendar.close}
          onDateSelect={async dateStr => {
            // Find or create the note for this date
            const note = notes.find(n => n.name.includes(dateStr));
            if (note) {
              setActiveNote(note);
              setMarkdown(note.content);
              setFileName(note.name);
              setFolder(note.folder || '');
            } else {
              // Create a new daily note
              const noteName = `${dateStr}.md`;
              setFileName(noteName);
              setFolder('Daily Notes');
              setMarkdown(
                `# ${dateStr}\n\n## Today's Goals\n- [ ] \n\n## Notes\n\n\n## Reflection\n\n`
              );
              setActiveNote(null);
            }
            setCurrentView('editor');
          }}
          theme={theme}
        />

        {/* Knowledge Graph Auto-Mapper Modals */}
        {graphAnalyticsData && (
          <KnowledgeGraphAnalytics
            analytics={graphAnalyticsData}
            isOpen={modals.graphAnalytics.isOpen}
            onClose={() => {
              modals.graphAnalytics.close();
              setGraphAnalyticsData(null);
            }}
          />
        )}

        {connectionSuggestionsData.length > 0 && (
          <ConnectionSuggestionsModal
            connections={connectionSuggestionsData}
            isOpen={modals.connectionSuggestions.isOpen}
            onClose={() => {
              modals.connectionSuggestions.close();
              setConnectionSuggestionsData([]);
            }}
            onApply={async (source, target, reason) => {
              // This will be handled by the plugin via events
              window.dispatchEvent(
                new CustomEvent('applyConnection', {
                  detail: { source, target, reason },
                })
              );
            }}
            onApplyAll={async minConfidence => {
              // This will be handled by the plugin via events
              window.dispatchEvent(
                new CustomEvent('applyAllConnections', {
                  detail: { minConfidence },
                })
              );
            }}
          />
        )}

        {mocSuggestionsData.length > 0 && (
          <MOCSuggestionsModal
            suggestions={mocSuggestionsData}
            isOpen={modals.mocSuggestions.isOpen}
            onClose={() => {
              modals.mocSuggestions.close();
              setMOCSuggestionsData([]);
            }}
            onCreate={async (title, noteIds, reason) => {
              // This will be handled by the plugin via events
              window.dispatchEvent(
                new CustomEvent('createMOC', {
                  detail: { title, noteIds, reason },
                })
              );
            }}
            onCreateAll={async () => {
              // This will be handled by the plugin via events
              window.dispatchEvent(new CustomEvent('createAllMOCs'));
            }}
          />
        )}

        {/* Keyboard Shortcuts Help */}
        <KeyboardShortcutsHelp
          isOpen={modals.keyboardHelp.isOpen}
          onClose={modals.keyboardHelp.close}
        />

        {/* Quick Actions Menu (Mobile-friendly FAB) */}
        <QuickActionsMenu
          onNewNote={() => {
            setFileName('');
            setMarkdown('# ');
            setFolder('');
            setActiveNote(null);
            setCurrentView('editor');
          }}
          onSearch={modals.commandPalette.open}
          onGraphView={() => setCurrentView('graph')}
          onAIChat={modals.aiChat.open}
          onKeyboardHelp={modals.keyboardHelp.open}
        />

        {/* Right Side Panel */}
        <RightSidePanel
          isOpen={isRightPanelOpen}
          isCollapsed={isRightPanelCollapsed}
          onToggleOpen={() => setIsRightPanelOpen(!isRightPanelOpen)}
          onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          markdown={markdown}
          currentNote={activeNote}
          allNotes={notes}
          onHeadingClick={line => {
            // Scroll to heading line in editor
            const textarea = editorRef.current;
            if (textarea) {
              const lines = textarea.value.split('\n');
              let charCount = 0;
              for (let i = 0; i < line && i < lines.length; i++) {
                charCount += lines[i].length + 1; // +1 for newline
              }
              textarea.focus();
              textarea.setSelectionRange(charCount, charCount);
              textarea.scrollTop = (line / lines.length) * textarea.scrollHeight;
            }
          }}
          onNoteClick={handleNoteSelect}
          theme={theme}
        />

        {/* Status Bar */}
        <StatusBar
          markdown={markdown}
          currentView={currentView}
          isCollaborationActive={settings.enableCollaboration}
          collaboratorCount={0}
          isOnline={true}
          aiProvider={undefined}
          aiStatus="idle"
          lastSaved={lastSaved}
          isSaving={isSaving}
          saveError={saveError}
          linkCount={(markdown.match(/\[\[([^\]]+)\]\]/g) || []).length}
          backlinksCount={notes.filter(n => n.content.includes(`[[${fileName}`)).length}
          currentNoteName={fileName || activeNote?.name.replace('.md', '')}
          currentFolder={folder || activeNote?.folder}
          theme={theme}
          onStatsClick={modals.writingStats.open}
        />

        {/* Mobile Bottom Navigation */}
        <BottomNav
          currentView={currentView}
          onViewChange={view => setCurrentView(view)}
          onNewNote={createNewNote}
          onAIChat={modals.aiChat.open}
          theme={theme as 'light' | 'dark'}
        />

        {/* Writing Stats Modal */}
        <WritingStatsModal
          isOpen={modals.writingStats.isOpen}
          onClose={modals.writingStats.close}
          stats={{
            wordCount: markdown.split(/\s+/).filter(word => word.length > 0).length,
            characterCount: markdown.length,
            readingTime: Math.ceil(
              markdown.split(/\s+/).filter(word => word.length > 0).length / 200
            ),
            linkCount: (markdown.match(/\[\[([^\]]+)\]\]/g) || []).length,
            tagCount: (markdown.match(/#\w+/g) || []).length,
            headingCount: (markdown.match(/^#{1,6}\s/gm) || []).length,
            paragraphCount: markdown.split(/\n\n+/).filter(p => p.trim().length > 0).length,
            sentenceCount: (markdown.match(/[.!?]+/g) || []).length,
          }}
          theme={theme as 'light' | 'dark'}
        />

        {/* Zen Mode */}
        {modals.zenMode.isOpen && (
          <ZenMode
            markdown={markdown}
            onMarkdownChange={handleMarkdownChange}
            onClose={modals.zenMode.close}
            theme={theme}
          />
        )}

        {/* Notification Queue */}
        <NotificationQueue maxNotifications={5} />
      </div>
    </>
  );
}
