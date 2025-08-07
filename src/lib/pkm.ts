import { Note, SearchResult, Graph, Link, Command, ViewState, SystemEvent } from './types';
import { MarkdownParser } from './parser';
import { SearchEngine } from './search';
import { GraphBuilder } from './graph';

export class PKMSystem {
  private searchEngine: SearchEngine;
  private graphBuilder: GraphBuilder;
  private notes: Map<string, Note> = new Map();
  private eventListeners: Map<string, Array<(event: SystemEvent) => void>> = new Map();
  private commands: Map<string, Command> = new Map();
  private viewState: ViewState = {
    selectedNotes: [],
    searchQuery: '',
    selectedTags: [],
    viewMode: 'edit',
    sidebarWidth: 300,
    graphView: {
      zoom: 1,
      position: { x: 0, y: 0 }
    }
  };

  constructor() {
    this.searchEngine = new SearchEngine();
    this.graphBuilder = new GraphBuilder();
    this.registerDefaultCommands();
  }

  // ===== NOTE MANAGEMENT =====

  async createNote(name: string, content: string, folder?: string): Promise<Note> {
    const id = MarkdownParser.generateNoteId(name, folder);
    const parsed = MarkdownParser.parseNote(content);
    const wordCount = MarkdownParser.calculateWordCount(content);
    const readingTime = MarkdownParser.calculateReadingTime(wordCount);

    const note: Note = {
      id,
      name: name.endsWith('.md') ? name : `${name}.md`,
      content,
      folder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: parsed.tags,
      metadata: parsed.frontmatter,
      wordCount,
      readingTime
    };

    this.notes.set(id, note);
    this.searchEngine.addNote(note);
    this.graphBuilder.addNote(note);

    this.emitEvent({
      type: 'note-created',
      noteId: id,
      timestamp: Date.now()
    });

    return note;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
    const existingNote = this.notes.get(id);
    if (!existingNote) return null;

    const updatedNote: Note = {
      ...existingNote,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Reparse content if it changed
    if (updates.content !== undefined) {
      const parsed = MarkdownParser.parseNote(updates.content);
      updatedNote.tags = parsed.tags;
      updatedNote.metadata = parsed.frontmatter;
      updatedNote.wordCount = MarkdownParser.calculateWordCount(updates.content);
      updatedNote.readingTime = MarkdownParser.calculateReadingTime(updatedNote.wordCount);
    }

    this.notes.set(id, updatedNote);
    this.searchEngine.updateNote(updatedNote);
    this.graphBuilder.updateNote(updatedNote);

    this.emitEvent({
      type: 'note-updated',
      noteId: id,
      data: updates,
      timestamp: Date.now()
    });

    return updatedNote;
  }

  async deleteNote(id: string): Promise<boolean> {
    const note = this.notes.get(id);
    if (!note) return false;

    this.notes.delete(id);
    this.searchEngine.removeNote(id);
    this.graphBuilder.removeNote(id);

    this.emitEvent({
      type: 'note-deleted',
      noteId: id,
      timestamp: Date.now()
    });

    return true;
  }

  getNote(id: string): Note | null {
    return this.notes.get(id) || null;
  }

  getAllNotes(): Note[] {
    return Array.from(this.notes.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getNotesByTag(tag: string): Note[] {
    return Array.from(this.notes.values())
      .filter(note => note.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  }

  getNotesByFolder(folder: string): Note[] {
    return Array.from(this.notes.values())
      .filter(note => note.folder === folder);
  }

  // ===== SEARCH =====

  search(query: string, options?: any): SearchResult[] {
    return this.searchEngine.search(query, options);
  }

  getAllTags(): Array<{ name: string; count: number }> {
    return this.searchEngine.getAllTags();
  }

  getAllFolders(): Array<{ name: string; count: number }> {
    return this.searchEngine.getAllFolders();
  }

  // ===== GRAPH =====

  getGraph(options?: any): Graph {
    return this.graphBuilder.buildGraph(options);
  }

  getBacklinks(noteId: string): Link[] {
    return this.graphBuilder.getBacklinks(noteId);
  }

  getOutgoingLinks(noteId: string): Link[] {
    return this.graphBuilder.getOutgoingLinks(noteId);
  }

  findPath(startNoteId: string, endNoteId: string): string[] | null {
    return this.graphBuilder.findPath(startNoteId, endNoteId);
  }

  getGraphStats() {
    return this.graphBuilder.getStats();
  }

  // ===== COMMANDS =====

  private registerDefaultCommands(): void {
    // Search commands
    this.registerCommand({
      id: 'global-search',
      name: 'Search all notes',
      description: 'Search across all notes',
      keybinding: 'Cmd+Shift+F',
      callback: () => {
        // This would trigger search UI
        console.log('Global search triggered');
      }
    });

    // Quick switcher
    this.registerCommand({
      id: 'quick-switcher',
      name: 'Quick switcher',
      description: 'Quickly switch between notes',
      keybinding: 'Cmd+P',
      callback: () => {
        console.log('Quick switcher triggered');
      }
    });

    // New note
    this.registerCommand({
      id: 'new-note',
      name: 'New note',
      description: 'Create a new note',
      keybinding: 'Cmd+N',
      callback: () => {
        console.log('New note triggered');
      }
    });

    // Toggle graph view
    this.registerCommand({
      id: 'toggle-graph',
      name: 'Toggle graph view',
      description: 'Show/hide the graph view',
      keybinding: 'Cmd+G',
      callback: () => {
        console.log('Toggle graph triggered');
      }
    });

    // View mode commands
    this.registerCommand({
      id: 'toggle-preview',
      name: 'Toggle preview',
      description: 'Switch between edit and preview modes',
      keybinding: 'Cmd+Shift+V',
      callback: () => {
        this.toggleViewMode();
      }
    });
  }

  registerCommand(command: Command): void {
    this.commands.set(command.id, command);
  }

  unregisterCommand(commandId: string): void {
    this.commands.delete(commandId);
  }

  executeCommand(commandId: string): void {
    const command = this.commands.get(commandId);
    if (command && (!command.condition || command.condition())) {
      command.callback();
    }
  }

  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  // ===== VIEW STATE =====

  getViewState(): ViewState {
    return { ...this.viewState };
  }

  updateViewState(updates: Partial<ViewState>): void {
    this.viewState = { ...this.viewState, ...updates };
  }

  setActiveNote(noteId: string | undefined): void {
    this.viewState.activeNoteId = noteId;
  }

  toggleViewMode(): void {
    const modes: ViewState['viewMode'][] = ['edit', 'preview', 'split'];
    const currentIndex = modes.indexOf(this.viewState.viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.viewState.viewMode = modes[nextIndex];
  }

  // ===== EVENT SYSTEM =====

  private emitEvent(event: SystemEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    });
  }

  addEventListener<T extends SystemEvent['type']>(
    type: T,
    listener: (event: Extract<SystemEvent, { type: T }>) => void
  ): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener as any);
  }

  removeEventListener<T extends SystemEvent['type']>(
    type: T,
    listener: (event: Extract<SystemEvent, { type: T }>) => void
  ): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener as any);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // ===== IMPORT/EXPORT =====

  async importNotes(notes: Array<{ name: string; content: string; folder?: string }>): Promise<void> {
    for (const noteData of notes) {
      await this.createNote(noteData.name, noteData.content, noteData.folder);
    }
  }

  exportNotes(): Array<{ name: string; content: string; folder?: string }> {
    return Array.from(this.notes.values()).map(note => ({
      name: note.name,
      content: note.content,
      folder: note.folder
    }));
  }

  // ===== UTILITIES =====

  resolveWikilink(linkText: string): Note | null {
    // Try exact match first
    const exactMatch = Array.from(this.notes.values()).find(
      note => note.name.toLowerCase() === linkText.toLowerCase() ||
               note.name.toLowerCase().replace(/\.md$/, '') === linkText.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    // Try alias match
    for (const note of this.notes.values()) {
      const parsed = MarkdownParser.parseNote(note.content);
      if (parsed.frontmatter.aliases?.some(alias => 
        alias.toLowerCase() === linkText.toLowerCase()
      )) {
        return note;
      }
    }

    // Try partial match
    const partialMatch = Array.from(this.notes.values()).find(
      note => note.name.toLowerCase().includes(linkText.toLowerCase())
    );
    
    return partialMatch || null;
  }

  renderContent(content: string): string {
    // Replace wikilinks with proper links
    return MarkdownParser.replaceWikilinks(content, (target) => {
      const note = this.resolveWikilink(target);
      return note ? `#note/${note.id}` : null;
    });
  }

  // ===== LIFECYCLE =====

  async initialize(notes?: Note[]): Promise<void> {
    if (notes) {
      // Load existing notes
      notes.forEach(note => {
        this.notes.set(note.id, note);
      });
      
      // Rebuild indices
      this.searchEngine.rebuildIndex(notes);
      this.graphBuilder.rebuildGraph(notes);
    }

    console.log('PKM System initialized with', this.notes.size, 'notes');
  }

  async destroy(): Promise<void> {
    this.notes.clear();
    this.eventListeners.clear();
    this.commands.clear();
  }
}

// Singleton instance
let pkmInstance: PKMSystem | null = null;

export function getPKMSystem(): PKMSystem {
  if (!pkmInstance) {
    pkmInstance = new PKMSystem();
  }
  return pkmInstance;
}
