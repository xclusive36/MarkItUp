import { useState, useRef, useEffect, useCallback } from 'react';
import { Note } from '@/lib/types';

export interface UseNoteStateReturn {
  // State
  notes: Note[];
  activeNote: Note | null;
  markdown: string;
  fileName: string;
  folder: string;

  // Setters
  setNotes: (notes: Note[]) => void;
  setActiveNote: (note: Note | null) => void;
  setMarkdown: (markdown: string) => void;
  setFileName: (fileName: string) => void;
  setFolder: (folder: string) => void;

  // Ref for immediate access to latest markdown (used in save operations)
  markdownRef: React.MutableRefObject<string>;

  // Helper methods
  updateMarkdown: (value: string) => void;
  clearNote: () => void;
  loadNote: (note: Note) => void;
}

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

/**
 * Custom hook to manage all note-related state
 * Consolidates notes, activeNote, markdown, fileName, and folder state
 */
export function useNoteState(): UseNoteStateReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [markdown, setMarkdown] = useState(DEFAULT_WELCOME_MARKDOWN);
  const [fileName, setFileName] = useState('');
  const [folder, setFolder] = useState('');

  // Ref to track the latest markdown content for immediate access in callbacks
  const markdownRef = useRef(markdown);

  // Update ref whenever markdown changes
  useEffect(() => {
    markdownRef.current = markdown;
  }, [markdown]);

  // Update markdown with the value
  const updateMarkdown = useCallback((value: string) => {
    setMarkdown(value);
  }, []);

  // Clear the current note (for creating new note)
  const clearNote = useCallback(() => {
    setActiveNote(null);
    setMarkdown('# New Note\n\nStart writing your thoughts here...');
    setFileName('');
    setFolder('');
  }, []);

  // Load a note into the editor
  const loadNote = useCallback((note: Note) => {
    setActiveNote(note);
    setMarkdown(note.content);
    setFileName(note.name.replace('.md', ''));
    setFolder(note.folder || '');
  }, []);

  return {
    // State
    notes,
    activeNote,
    markdown,
    fileName,
    folder,

    // Setters
    setNotes,
    setActiveNote,
    setMarkdown,
    setFileName,
    setFolder,

    // Ref
    markdownRef,

    // Helpers
    updateMarkdown,
    clearNote,
    loadNote,
  };
}
