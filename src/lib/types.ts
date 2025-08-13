// Core types for MarkItUp PKM System

export interface Note {
  id: string;
  name: string;
  content: string;
  folder?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  metadata: Record<string, any>;
  wordCount: number;
  readingTime: number;
}

export interface Link {
  id: string;
  source: string;  // Note ID
  target: string;  // Note ID
  type: 'wikilink' | 'backlink' | 'tag' | 'block';
  anchorText?: string;
  blockId?: string;
}

export interface Tag {
  name: string;
  count: number;
  color?: string;
}

export interface SearchResult {
  noteId: string;
  noteName: string;
  matches: SearchMatch[];
  score: number;
}

export interface SearchMatch {
  text: string;
  start: number;
  end: number;
  lineNumber: number;
  context: string;
}

export interface GraphNode {
  id: string;
  name: string;
  group?: string;
  size: number;
  color?: string;
  tags: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'link' | 'tag' | 'folder';
  weight: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Command {
  id: string;
  name: string;
  description: string;
  keybinding?: string;
  callback: (api?: PluginAPI) => void | Promise<void>;
  condition?: () => boolean;
}

export interface ViewState {
  activeNoteId?: string;
  selectedNotes: string[];
  searchQuery: string;
  selectedTags: string[];
  viewMode: 'edit' | 'preview' | 'split';
  sidebarWidth: number;
  graphView: {
    centerNode?: string;
    zoom: number;
    position: { x: number; y: number };
  };
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  dependencies?: string[];
  permissions?: PluginPermission[];
  minVersion?: string; // Minimum MarkItUp version required
  maxVersion?: string; // Maximum MarkItUp version supported
}

export interface PluginManifest extends Plugin {
  onLoad?: () => void | Promise<void>;
  onUnload?: () => void | Promise<void>;
  commands?: Command[];
  views?: PluginView[];
  processors?: ContentProcessor[];
  settings?: PluginSetting[];
}

export interface PluginPermission {
  type: 'file-system' | 'network' | 'clipboard' | 'notifications';
  description: string;
}

export interface PluginView {
  id: string;
  name: string;
  type: 'sidebar' | 'modal' | 'statusbar' | 'toolbar';
  component: React.ComponentType<any>;
  icon?: string;
}

export interface ContentProcessor {
  id: string;
  name: string;
  type: 'markdown' | 'export' | 'import' | 'transform';
  process: (content: string, context?: any) => string | Promise<string>;
  fileExtensions?: string[];
}

export interface PluginSetting {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'file' | 'folder';
  default: any;
  description?: string;
  options?: Array<{ label: string; value: any }>;
}

export interface PluginHealth {
  status: 'healthy' | 'warning' | 'error' | 'disabled';
  lastError?: string;
  errorCount: number;
  responseTime: number;
  memoryUsage: number;
  lastExecuted?: string;
  executionCount: number;
}

export interface PluginUpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  changelogUrl?: string;
  autoUpdate: boolean;
  lastChecked: string;
}

export interface PluginMarketplace {
  name: string;
  url: string;
  trusted: boolean;
  categories: string[];
  searchApi: string;
}

export interface PluginBackup {
  plugins: PluginManifest[];
  settings: Map<string, Record<string, any>>;
  timestamp: string;
  deviceId: string;
  version: string;
}

export interface PluginTest {
  pluginId: string;
  testCases: TestCase[];
  lastRun: string;
  status: 'passed' | 'failed' | 'pending';
  coverage?: number;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  test: () => Promise<boolean>;
  expected: any;
  actual?: any;
}

export interface PermissionRequest {
  pluginId: string;
  permission: PluginPermission;
  reason: string;
  granted: boolean;
  grantedAt?: string;
  grantedBy?: string;
}

export interface PluginAPI {
  // Core system access
  notes: {
    create: (name: string, content: string, folder?: string) => Promise<Note>;
    update: (id: string, updates: Partial<Note>) => Promise<Note | null>;
    delete: (id: string) => Promise<boolean>;
    get: (id: string) => Note | null;
    getAll: () => Note[];
    search: (query: string) => SearchResult[];
  };
  
  // UI interactions
  ui: {
    showNotification: (message: string, type?: 'info' | 'warning' | 'error') => void;
    showModal: (title: string, content: React.ReactNode) => Promise<any>;
    addCommand: (command: Command) => void;
    addView: (view: PluginView) => void;
    setStatusBarText: (text: string) => void;
  };
  
  // Event system
  events: {
    on: (event: string, callback: (data: any) => void) => void;
    off: (event: string, callback: (data: any) => void) => void;
    emit: (event: string, data: any) => void;
  };
  
  // Settings
  settings: {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
  };
  
  // File system (if permitted)
  fs?: {
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    exists: (path: string) => Promise<boolean>;
  };
}

// Frontmatter parsing
export interface FrontMatter {
  title?: string;
  tags?: string[];
  date?: string;
  modified?: string;
  aliases?: string[];
  cssclass?: string;
  [key: string]: any;
}

export interface ParsedNote {
  frontmatter: FrontMatter;
  content: string;
  links: ParsedLink[];
  tags: string[];
  blocks: Block[];
}

export interface ParsedLink {
  type: 'wikilink' | 'markdown' | 'tag';
  target: string;
  displayText?: string;
  start: number;
  end: number;
}

export interface Block {
  id: string;
  content: string;
  start: number;
  end: number;
  type: 'paragraph' | 'heading' | 'list' | 'code' | 'quote';
  level?: number;
}

// Database interfaces
export interface NoteDatabase {
  notes: Map<string, Note>;
  links: Map<string, Link[]>;
  tags: Map<string, Tag>;
  searchIndex: SearchIndex;
}

export interface SearchIndex {
  termToNotes: Map<string, Set<string>>;
  noteToTerms: Map<string, Set<string>>;
}

// Event system
export interface NoteEvent {
  type: 'note-created' | 'note-updated' | 'note-deleted' | 'note-renamed';
  noteId: string;
  data?: any;
  timestamp: number;
}

export interface LinkEvent {
  type: 'link-created' | 'link-removed';
  link: Link;
  timestamp: number;
}

export interface TagEvent {
  type: 'tag-added' | 'tag-removed' | 'tag-renamed';
  tag: string;
  noteId: string;
  timestamp: number;
}

export type SystemEvent = NoteEvent | LinkEvent | TagEvent;

// Collaborative editing types
export interface CollaborativeSession {
  id: string;
  noteId: string;
  participants: Participant[];
  createdAt: string;
  lastActivity: string;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
  cursor?: CursorPosition;
  selection?: SelectionRange;
  lastSeen: string;
  isActive: boolean;
}

export interface CursorPosition {
  line: number;
  column: number;
  timestamp: number;
}

export interface SelectionRange {
  start: CursorPosition;
  end: CursorPosition;
  timestamp: number;
}

export interface CollaborativeOperation {
  id: string;
  type: 'insert' | 'delete' | 'retain' | 'format';
  position: number;
  content?: string;
  length?: number;
  attributes?: Record<string, any>;
  authorId: string;
  timestamp: number;
  vectorClock: Record<string, number>;
}

export interface ConflictResolution {
  operationId: string;
  strategy: 'last-write-wins' | 'operational-transform' | 'merge' | 'manual';
  resolvedOperation: CollaborativeOperation;
  conflictingOperations: CollaborativeOperation[];
  resolvedBy: string;
  resolvedAt: string;
}

export interface CollaborativeEvent {
  type: 'user-joined' | 'user-left' | 'operation' | 'cursor-move' | 'selection-change' | 'save' | 'conflict';
  sessionId: string;
  userId: string;
  data: any;
  timestamp: number;
}

export interface CollaborativeSettings {
  enableCollaboration: boolean;
  autoSaveInterval: number; // milliseconds
  conflictResolutionStrategy: 'last-write-wins' | 'operational-transform' | 'merge';
  showOtherCursors: boolean;
  showOtherSelections: boolean;
  maxParticipants: number;
  sessionTimeout: number; // milliseconds
}
