import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Note, Graph } from '@/lib/types';
import type { PKMSystem } from '@/lib/pkm';

// ============================================================================
// Type Definitions
// ============================================================================

export type ViewMode = 'edit' | 'preview' | 'split';
export type CurrentView = 'editor' | 'graph' | 'search' | 'analytics' | 'plugins' | 'notes';

export interface ModalState {
  isOpen: boolean;
}

export interface GraphStats {
  totalNotes: number;
  totalLinks: number;
  avgConnections: number;
  maxConnections: number;
  orphanCount: number;
}

export interface TagCount {
  name: string;
  count: number;
}

export interface FolderCount {
  name: string;
  count: number;
}

export interface ConnectionSuggestion {
  source: string;
  target: string;
  sourceName: string;
  targetName: string;
  reason: string;
  similarity: number;
}

export interface MOCSuggestion {
  title: string;
  noteIds: string[];
  noteNames: string[];
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AnalyticsData {
  totalConnections: number;
  totalMOCs: number;
  connectionsByDate: Record<string, number>;
  mocsByDate: Record<string, number>;
  avgConnectionsPerDay: number;
  graphGrowthRate: number;
  mostConnectedNotes: Array<{ id: string; name: string; count: number }>;
  mocEffectiveness: Array<{ name: string; accessCount: number; linkCount: number }>;
}

// ============================================================================
// Store State Interface
// ============================================================================

export interface AppState {
  // ===== Modal State =====
  modals: {
    aiChat: boolean;
    writingAssistant: boolean;
    knowledgeDiscovery: boolean;
    researchAssistant: boolean;
    knowledgeMap: boolean;
    batchAnalyzer: boolean;
    globalSearch: boolean;
    commandPalette: boolean;
    calendar: boolean;
    graphAnalytics: boolean;
    connectionSuggestions: boolean;
    mocSuggestions: boolean;
    keyboardHelp: boolean;
    writingStats: boolean;
    zenMode: boolean;
    collabSettings: boolean;
    userProfile: boolean;
  };

  // ===== Note State =====
  notes: Note[];
  activeNote: Note | null;
  markdown: string;
  fileName: string;
  folder: string;

  // ===== View State =====
  viewMode: ViewMode;
  currentView: CurrentView;
  showMobileSidebar: boolean;
  isLeftSidebarCollapsed: boolean;
  isRightPanelOpen: boolean;
  isRightPanelCollapsed: boolean;
  isMounted: boolean;
  isInitializing: boolean;

  // ===== Graph & Search State =====
  graph: Graph;
  graphStats: GraphStats;
  tags: TagCount[];
  folders: FolderCount[];

  // ===== Save State =====
  saveStatus: string;
  lastSaved: Date | null;
  isSaving: boolean;
  saveError: string | null;

  // ===== Additional Page State =====
  isDailyNotesLoaded: boolean;
  graphAnalyticsData: AnalyticsData | null;
  connectionSuggestionsData: ConnectionSuggestion[];
  mocSuggestionsData: MOCSuggestion[];
  selectedText: string | null;
  selectionPosition: { top: number; left: number } | null;
  lastEditTrack: number;
  pkm: PKMSystem | null;

  // ===== Modal Actions =====
  openModal: (modal: keyof AppState['modals']) => void;
  closeModal: (modal: keyof AppState['modals']) => void;
  toggleModal: (modal: keyof AppState['modals']) => void;
  closeAllModals: () => void;

  // ===== Note Actions =====
  setNotes: (notes: Note[]) => void;
  setActiveNote: (note: Note | null) => void;
  setMarkdown: (markdown: string) => void;
  setFileName: (fileName: string) => void;
  setFolder: (folder: string) => void;
  updateMarkdown: (value: string) => void;
  clearNote: () => void;
  loadNote: (note: Note) => void;

  // ===== View Actions =====
  setViewMode: (mode: ViewMode) => void;
  setCurrentView: (view: CurrentView) => void;
  setShowMobileSidebar: (show: boolean) => void;
  toggleMobileSidebar: () => void;
  setIsLeftSidebarCollapsed: (collapsed: boolean) => void;
  toggleLeftSidebar: () => void;
  setIsRightPanelOpen: (open: boolean) => void;
  toggleRightPanel: () => void;
  setIsRightPanelCollapsed: (collapsed: boolean) => void;
  toggleRightPanelCollapse: () => void;
  setIsInitializing: (initializing: boolean) => void;

  // ===== Graph & Search Actions =====
  setGraph: (graph: Graph) => void;
  setGraphStats: (stats: GraphStats) => void;
  setTags: (tags: TagCount[]) => void;
  setFolders: (folders: FolderCount[]) => void;

  // ===== Save Actions =====
  setSaveStatus: (status: string) => void;
  setLastSaved: (date: Date | null) => void;
  setIsSaving: (saving: boolean) => void;
  setSaveError: (error: string | null) => void;
  clearSaveStatus: () => void;
  setSaveSuccess: (message?: string) => void;
  setSaveErrorWithTimeout: (error: string, timeout?: number) => void;

  // ===== Additional Page Actions =====
  setIsDailyNotesLoaded: (loaded: boolean) => void;
  setGraphAnalyticsData: (data: AnalyticsData | null) => void;
  setConnectionSuggestionsData: (data: ConnectionSuggestion[]) => void;
  setMocSuggestionsData: (data: MOCSuggestion[]) => void;
  setSelectedText: (text: string | null) => void;
  setSelectionPosition: (position: { top: number; left: number } | null) => void;
  setLastEditTrack: (track: number) => void;
  setPkm: (pkm: PKMSystem | null) => void;
}

// ============================================================================
// Default Welcome Markdown
// ============================================================================

const DEFAULT_WELCOME_MARKDOWN = `# Welcome to MarkItUp PKM System 🚀

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

*Start writing and building your second brain...`;

// ============================================================================
// Zustand Store
// ============================================================================

export const useAppStore = create<AppState>()(
  devtools(
    set => ({
      // ===== Initial Modal State =====
      modals: {
        aiChat: false,
        writingAssistant: false,
        knowledgeDiscovery: false,
        researchAssistant: false,
        knowledgeMap: false,
        batchAnalyzer: false,
        globalSearch: false,
        commandPalette: false,
        calendar: false,
        graphAnalytics: false,
        connectionSuggestions: false,
        mocSuggestions: false,
        keyboardHelp: false,
        writingStats: false,
        zenMode: false,
        collabSettings: false,
        userProfile: false,
      },

      // ===== Initial Note State =====
      notes: [],
      activeNote: null,
      markdown: DEFAULT_WELCOME_MARKDOWN,
      fileName: '',
      folder: '',

      // ===== Initial View State =====
      viewMode: 'edit',
      currentView: 'editor',
      showMobileSidebar: false,
      isLeftSidebarCollapsed: false,
      isRightPanelOpen: true,
      isRightPanelCollapsed: true,
      isMounted: true, // Set immediately on initialization
      isInitializing: true,

      // ===== Initial Graph & Search State =====
      graph: { nodes: [], edges: [] },
      graphStats: {
        totalNotes: 0,
        totalLinks: 0,
        avgConnections: 0,
        maxConnections: 0,
        orphanCount: 0,
      },
      tags: [],
      folders: [],

      // ===== Initial Save State =====
      saveStatus: '',
      lastSaved: null,
      isSaving: false,
      saveError: null,

      // ===== Initial Additional Page State =====
      isDailyNotesLoaded: false,
      graphAnalyticsData: null,
      connectionSuggestionsData: [],
      mocSuggestionsData: [],
      selectedText: null,
      selectionPosition: null,
      lastEditTrack: 0,
      pkm: null,

      // ===== Modal Actions =====
      openModal: modal =>
        set(
          state => ({
            modals: { ...state.modals, [modal]: true },
          }),
          false,
          'openModal'
        ),

      closeModal: modal =>
        set(
          state => ({
            modals: { ...state.modals, [modal]: false },
          }),
          false,
          'closeModal'
        ),

      toggleModal: modal =>
        set(
          state => ({
            modals: { ...state.modals, [modal]: !state.modals[modal] },
          }),
          false,
          'toggleModal'
        ),

      closeAllModals: () =>
        set(
          state => ({
            modals: Object.keys(state.modals).reduce(
              (acc, key) => ({ ...acc, [key]: false }),
              {} as AppState['modals']
            ),
          }),
          false,
          'closeAllModals'
        ),

      // ===== Note Actions =====
      setNotes: notes => set({ notes }, false, 'setNotes'),
      setActiveNote: activeNote => set({ activeNote }, false, 'setActiveNote'),
      setMarkdown: markdown => set({ markdown }, false, 'setMarkdown'),
      setFileName: fileName => set({ fileName }, false, 'setFileName'),
      setFolder: folder => set({ folder }, false, 'setFolder'),

      updateMarkdown: value => set({ markdown: value }, false, 'updateMarkdown'),

      clearNote: () =>
        set(
          {
            activeNote: null,
            markdown: '# New Note\n\nStart writing your thoughts here...',
            fileName: '',
            folder: '',
          },
          false,
          'clearNote'
        ),

      loadNote: note =>
        set(
          {
            activeNote: note,
            markdown: note.content,
            fileName: note.name.replace('.md', ''),
            folder: note.folder || '',
          },
          false,
          'loadNote'
        ),

      // ===== View Actions =====
      setViewMode: viewMode => set({ viewMode }, false, 'setViewMode'),
      setCurrentView: currentView => set({ currentView }, false, 'setCurrentView'),
      setShowMobileSidebar: showMobileSidebar =>
        set({ showMobileSidebar }, false, 'setShowMobileSidebar'),
      toggleMobileSidebar: () =>
        set(
          state => ({ showMobileSidebar: !state.showMobileSidebar }),
          false,
          'toggleMobileSidebar'
        ),
      setIsLeftSidebarCollapsed: isLeftSidebarCollapsed =>
        set({ isLeftSidebarCollapsed }, false, 'setIsLeftSidebarCollapsed'),
      toggleLeftSidebar: () =>
        set(
          state => ({ isLeftSidebarCollapsed: !state.isLeftSidebarCollapsed }),
          false,
          'toggleLeftSidebar'
        ),
      setIsRightPanelOpen: isRightPanelOpen =>
        set({ isRightPanelOpen }, false, 'setIsRightPanelOpen'),
      toggleRightPanel: () =>
        set(state => ({ isRightPanelOpen: !state.isRightPanelOpen }), false, 'toggleRightPanel'),
      setIsRightPanelCollapsed: isRightPanelCollapsed =>
        set({ isRightPanelCollapsed }, false, 'setIsRightPanelCollapsed'),
      toggleRightPanelCollapse: () =>
        set(
          state => ({ isRightPanelCollapsed: !state.isRightPanelCollapsed }),
          false,
          'toggleRightPanelCollapse'
        ),
      setIsInitializing: isInitializing => set({ isInitializing }, false, 'setIsInitializing'),

      // ===== Graph & Search Actions =====
      setGraph: graph => set({ graph }, false, 'setGraph'),
      setGraphStats: graphStats => set({ graphStats }, false, 'setGraphStats'),
      setTags: tags => set({ tags }, false, 'setTags'),
      setFolders: folders => set({ folders }, false, 'setFolders'),

      // ===== Save Actions =====
      setSaveStatus: saveStatus => set({ saveStatus }, false, 'setSaveStatus'),
      setLastSaved: lastSaved => set({ lastSaved }, false, 'setLastSaved'),
      setIsSaving: isSaving => set({ isSaving }, false, 'setIsSaving'),
      setSaveError: saveError => set({ saveError }, false, 'setSaveError'),

      clearSaveStatus: () => set({ saveStatus: '', saveError: null }, false, 'clearSaveStatus'),

      setSaveSuccess: (message = 'Note saved successfully! 🎉') =>
        set(
          {
            saveStatus: message,
            lastSaved: new Date(),
            saveError: null,
            isSaving: false,
          },
          false,
          'setSaveSuccess'
        ),

      setSaveErrorWithTimeout: (error, timeout = 3000) => {
        set(
          {
            saveStatus: error,
            saveError: error,
            isSaving: false,
          },
          false,
          'setSaveErrorWithTimeout'
        );

        setTimeout(() => {
          set({ saveStatus: '', saveError: null }, false, 'clearSaveErrorTimeout');
        }, timeout);
      },

      // ===== Additional Page Actions =====
      setIsDailyNotesLoaded: isDailyNotesLoaded =>
        set({ isDailyNotesLoaded }, false, 'setIsDailyNotesLoaded'),
      setGraphAnalyticsData: graphAnalyticsData =>
        set({ graphAnalyticsData }, false, 'setGraphAnalyticsData'),
      setConnectionSuggestionsData: connectionSuggestionsData =>
        set({ connectionSuggestionsData }, false, 'setConnectionSuggestionsData'),
      setMocSuggestionsData: mocSuggestionsData =>
        set({ mocSuggestionsData }, false, 'setMocSuggestionsData'),
      setSelectedText: selectedText => set({ selectedText }, false, 'setSelectedText'),
      setSelectionPosition: selectionPosition =>
        set({ selectionPosition }, false, 'setSelectionPosition'),
      setLastEditTrack: lastEditTrack => set({ lastEditTrack }, false, 'setLastEditTrack'),
      setPkm: pkm => set({ pkm }, false, 'setPkm'),
    }),
    {
      name: 'MarkItUp-Store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================================================
// Selector Hooks (Optimized for re-render prevention)
// ============================================================================

/**
 * Get modal state with open/close/toggle methods
 * Returns an object compatible with the old useModalState API
 */
export const useModalState = () => {
  const modals = useAppStore(state => state.modals);
  const openModal = useAppStore(state => state.openModal);
  const closeModal = useAppStore(state => state.closeModal);
  const toggleModal = useAppStore(state => state.toggleModal);

  // Return object matching old useModalState interface
  return {
    aiChat: {
      isOpen: modals.aiChat,
      open: () => openModal('aiChat'),
      close: () => closeModal('aiChat'),
      toggle: () => toggleModal('aiChat'),
    },
    writingAssistant: {
      isOpen: modals.writingAssistant,
      open: () => openModal('writingAssistant'),
      close: () => closeModal('writingAssistant'),
      toggle: () => toggleModal('writingAssistant'),
    },
    knowledgeDiscovery: {
      isOpen: modals.knowledgeDiscovery,
      open: () => openModal('knowledgeDiscovery'),
      close: () => closeModal('knowledgeDiscovery'),
      toggle: () => toggleModal('knowledgeDiscovery'),
    },
    researchAssistant: {
      isOpen: modals.researchAssistant,
      open: () => openModal('researchAssistant'),
      close: () => closeModal('researchAssistant'),
      toggle: () => toggleModal('researchAssistant'),
    },
    knowledgeMap: {
      isOpen: modals.knowledgeMap,
      open: () => openModal('knowledgeMap'),
      close: () => closeModal('knowledgeMap'),
      toggle: () => toggleModal('knowledgeMap'),
    },
    batchAnalyzer: {
      isOpen: modals.batchAnalyzer,
      open: () => openModal('batchAnalyzer'),
      close: () => closeModal('batchAnalyzer'),
      toggle: () => toggleModal('batchAnalyzer'),
    },
    globalSearch: {
      isOpen: modals.globalSearch,
      open: () => openModal('globalSearch'),
      close: () => closeModal('globalSearch'),
      toggle: () => toggleModal('globalSearch'),
    },
    commandPalette: {
      isOpen: modals.commandPalette,
      open: () => openModal('commandPalette'),
      close: () => closeModal('commandPalette'),
      toggle: () => toggleModal('commandPalette'),
    },
    calendar: {
      isOpen: modals.calendar,
      open: () => openModal('calendar'),
      close: () => closeModal('calendar'),
      toggle: () => toggleModal('calendar'),
    },
    graphAnalytics: {
      isOpen: modals.graphAnalytics,
      open: () => openModal('graphAnalytics'),
      close: () => closeModal('graphAnalytics'),
      toggle: () => toggleModal('graphAnalytics'),
    },
    connectionSuggestions: {
      isOpen: modals.connectionSuggestions,
      open: () => openModal('connectionSuggestions'),
      close: () => closeModal('connectionSuggestions'),
      toggle: () => toggleModal('connectionSuggestions'),
    },
    mocSuggestions: {
      isOpen: modals.mocSuggestions,
      open: () => openModal('mocSuggestions'),
      close: () => closeModal('mocSuggestions'),
      toggle: () => toggleModal('mocSuggestions'),
    },
    keyboardHelp: {
      isOpen: modals.keyboardHelp,
      open: () => openModal('keyboardHelp'),
      close: () => closeModal('keyboardHelp'),
      toggle: () => toggleModal('keyboardHelp'),
    },
    writingStats: {
      isOpen: modals.writingStats,
      open: () => openModal('writingStats'),
      close: () => closeModal('writingStats'),
      toggle: () => toggleModal('writingStats'),
    },
    zenMode: {
      isOpen: modals.zenMode,
      open: () => openModal('zenMode'),
      close: () => closeModal('zenMode'),
      toggle: () => toggleModal('zenMode'),
    },
    collabSettings: {
      isOpen: modals.collabSettings,
      open: () => openModal('collabSettings'),
      close: () => closeModal('collabSettings'),
      toggle: () => toggleModal('collabSettings'),
    },
    userProfile: {
      isOpen: modals.userProfile,
      open: () => openModal('userProfile'),
      close: () => closeModal('userProfile'),
      toggle: () => toggleModal('userProfile'),
    },
  };
};

/**
 * Get note state with all actions
 * Returns object compatible with the old useNoteState API
 */
export const useNoteState = () => {
  return {
    notes: useAppStore(state => state.notes),
    activeNote: useAppStore(state => state.activeNote),
    markdown: useAppStore(state => state.markdown),
    fileName: useAppStore(state => state.fileName),
    folder: useAppStore(state => state.folder),
    setNotes: useAppStore(state => state.setNotes),
    setActiveNote: useAppStore(state => state.setActiveNote),
    setMarkdown: useAppStore(state => state.setMarkdown),
    setFileName: useAppStore(state => state.setFileName),
    setFolder: useAppStore(state => state.setFolder),
    updateMarkdown: useAppStore(state => state.updateMarkdown),
    clearNote: useAppStore(state => state.clearNote),
    loadNote: useAppStore(state => state.loadNote),
    // Note: markdownRef is handled differently in page.tsx now
  };
};

/**
 * Get view state with all actions
 * Returns object compatible with the old useViewState API
 */
export const useViewState = () => {
  return {
    viewMode: useAppStore(state => state.viewMode),
    setViewMode: useAppStore(state => state.setViewMode),
    currentView: useAppStore(state => state.currentView),
    setCurrentView: useAppStore(state => state.setCurrentView),
    showMobileSidebar: useAppStore(state => state.showMobileSidebar),
    setShowMobileSidebar: useAppStore(state => state.setShowMobileSidebar),
    toggleMobileSidebar: useAppStore(state => state.toggleMobileSidebar),
    isLeftSidebarCollapsed: useAppStore(state => state.isLeftSidebarCollapsed),
    setIsLeftSidebarCollapsed: useAppStore(state => state.setIsLeftSidebarCollapsed),
    toggleLeftSidebar: useAppStore(state => state.toggleLeftSidebar),
    isRightPanelOpen: useAppStore(state => state.isRightPanelOpen),
    setIsRightPanelOpen: useAppStore(state => state.setIsRightPanelOpen),
    toggleRightPanel: useAppStore(state => state.toggleRightPanel),
    isRightPanelCollapsed: useAppStore(state => state.isRightPanelCollapsed),
    setIsRightPanelCollapsed: useAppStore(state => state.setIsRightPanelCollapsed),
    toggleRightPanelCollapse: useAppStore(state => state.toggleRightPanelCollapse),
    isMounted: useAppStore(state => state.isMounted),
    isInitializing: useAppStore(state => state.isInitializing),
    setIsInitializing: useAppStore(state => state.setIsInitializing),
  };
};

/**
 * Get graph and search state with all actions
 * Returns object compatible with the old useGraphSearchState API
 */
export const useGraphSearchState = () => {
  return {
    graph: useAppStore(state => state.graph),
    setGraph: useAppStore(state => state.setGraph),
    graphStats: useAppStore(state => state.graphStats),
    setGraphStats: useAppStore(state => state.setGraphStats),
    tags: useAppStore(state => state.tags),
    setTags: useAppStore(state => state.setTags),
    folders: useAppStore(state => state.folders),
    setFolders: useAppStore(state => state.setFolders),
  };
};

/**
 * Get save state with all actions
 * Returns object compatible with the old useSaveState API
 */
export const useSaveState = () => {
  return {
    saveStatus: useAppStore(state => state.saveStatus),
    setSaveStatus: useAppStore(state => state.setSaveStatus),
    lastSaved: useAppStore(state => state.lastSaved),
    setLastSaved: useAppStore(state => state.setLastSaved),
    isSaving: useAppStore(state => state.isSaving),
    setIsSaving: useAppStore(state => state.setIsSaving),
    saveError: useAppStore(state => state.saveError),
    setSaveError: useAppStore(state => state.setSaveError),
    clearSaveStatus: useAppStore(state => state.clearSaveStatus),
    setSaveSuccess: useAppStore(state => state.setSaveSuccess),
    setSaveErrorWithTimeout: useAppStore(state => state.setSaveErrorWithTimeout),
  };
};
