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
  callback: () => void | Promise<void>;
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
}

export interface PluginManifest extends Plugin {
  onLoad?: () => void | Promise<void>;
  onUnload?: () => void | Promise<void>;
  commands?: Command[];
  views?: string[];
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
