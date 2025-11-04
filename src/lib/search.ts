import { Note, SearchResult, SearchMatch, SearchIndex } from './types';
import { MarkdownParser } from './parser';

export class SearchEngine {
  private searchIndex: SearchIndex = {
    termToNotes: new Map(),
    noteToTerms: new Map(),
  };
  private notes: Map<string, Note> = new Map();

  // Add note to search index
  addNote(note: Note): void {
    this.notes.set(note.id, note);
    this.indexNote(note);
  }

  // Remove note from search index
  removeNote(noteId: string): void {
    const existingTerms = this.searchIndex.noteToTerms.get(noteId);
    if (existingTerms) {
      // Remove note from all term mappings
      existingTerms.forEach(term => {
        const noteSet = this.searchIndex.termToNotes.get(term);
        if (noteSet) {
          noteSet.delete(noteId);
          if (noteSet.size === 0) {
            this.searchIndex.termToNotes.delete(term);
          }
        }
      });
      this.searchIndex.noteToTerms.delete(noteId);
    }
    this.notes.delete(noteId);
  }

  // Update note in search index
  updateNote(note: Note): void {
    this.removeNote(note.id);
    this.addNote(note);
  }

  // Index a single note
  private indexNote(note: Note): void {
    const terms = this.extractTerms(note);
    this.searchIndex.noteToTerms.set(note.id, new Set(terms));

    terms.forEach(term => {
      if (!this.searchIndex.termToNotes.has(term)) {
        this.searchIndex.termToNotes.set(term, new Set());
      }
      this.searchIndex.termToNotes.get(term)!.add(note.id);
    });
  }

  // Extract searchable terms from a note
  private extractTerms(note: Note): string[] {
    const terms: Set<string> = new Set();

    // Add note name terms
    this.tokenize(note.name).forEach(term => terms.add(term));

    // Add content terms
    const parsed = MarkdownParser.parseNote(note.content);
    this.tokenize(parsed.content).forEach(term => terms.add(term));

    // Add tags as exact terms
    parsed.tags.forEach(tag => {
      terms.add(`tag:${tag.toLowerCase()}`);
      terms.add(tag.toLowerCase());
    });

    // Add folder terms
    if (note.folder) {
      this.tokenize(note.folder).forEach(term => terms.add(term));
      terms.add(`folder:${note.folder.toLowerCase()}`);
    }

    // Add frontmatter terms
    if (parsed.frontmatter.title) {
      this.tokenize(parsed.frontmatter.title).forEach(term => terms.add(term));
    }

    if (parsed.frontmatter.aliases) {
      parsed.frontmatter.aliases.forEach(alias => {
        this.tokenize(alias).forEach(term => terms.add(term));
      });
    }

    return Array.from(terms);
  }

  // Tokenize text into searchable terms
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ') // Replace non-word chars with spaces
      .split(/\s+/) // Split on whitespace
      .filter(term => term.length > 2) // Only terms longer than 2 chars
      .map(term => term.trim())
      .filter(term => term.length > 0);
  }

  // Main search function
  search(query: string, options: SearchOptions = {}): SearchResult[] {
    const { limit = 50, includeContent = true, tags = [], folders = [], fuzzy = false } = options;

    if (!query.trim()) return [];

    // Parse query for special operators
    const parsedQuery = this.parseQuery(query);

    // Get candidate notes
    const candidateNotes = this.getCandidateNotes(parsedQuery, tags, folders);

    // Score and rank results
    const scoredResults: SearchResult[] = [];

    for (const noteId of candidateNotes) {
      const note = this.notes.get(noteId);
      if (!note) continue;

      const result = this.scoreNote(note, parsedQuery, includeContent);
      if (result.score > 0) {
        scoredResults.push(result);
      }
    }

    // Sort by score and apply limit
    return scoredResults.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private parseQuery(query: string): ParsedQuery {
    const terms: string[] = [];
    const tags: string[] = [];
    const folders: string[] = [];
    const exact: string[] = [];

    // Split query into parts
    const parts = query.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];

    for (const part of parts) {
      const trimmed = part.trim();

      if (trimmed.startsWith('tag:')) {
        tags.push(trimmed.substring(4).toLowerCase());
      } else if (trimmed.startsWith('folder:')) {
        folders.push(trimmed.substring(7).toLowerCase());
      } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        exact.push(trimmed.slice(1, -1).toLowerCase());
      } else if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
        exact.push(trimmed.slice(1, -1).toLowerCase());
      } else {
        terms.push(...this.tokenize(trimmed));
      }
    }

    return { terms, tags, folders, exact };
  }

  private getCandidateNotes(
    query: ParsedQuery,
    filterTags: string[],
    filterFolders: string[]
  ): Set<string> {
    let candidates: Set<string> | null = null;

    // Start with term matches
    for (const term of query.terms) {
      const noteSet = this.searchIndex.termToNotes.get(term);
      if (noteSet) {
        if (candidates === null) {
          candidates = new Set(noteSet);
        } else {
          // Intersection for AND behavior
          candidates = new Set([...candidates].filter((id: string) => noteSet.has(id)));
        }
      }
    }

    // Add tag matches
    for (const tag of [...query.tags, ...filterTags]) {
      const noteSet = this.searchIndex.termToNotes.get(`tag:${tag}`);
      if (noteSet) {
        if (candidates === null) {
          candidates = new Set(noteSet);
        } else {
          candidates = new Set([...candidates].filter(id => noteSet.has(id)));
        }
      }
    }

    // Add folder matches
    for (const folder of [...query.folders, ...filterFolders]) {
      const noteSet = this.searchIndex.termToNotes.get(`folder:${folder}`);
      if (noteSet) {
        if (candidates === null) {
          candidates = new Set(noteSet);
        } else {
          candidates = new Set([...candidates].filter(id => noteSet.has(id)));
        }
      }
    }

    // If no specific matches, return all notes for broad search
    if (candidates === null) {
      return new Set(this.notes.keys());
    }

    return candidates;
  }

  private scoreNote(note: Note, query: ParsedQuery, includeContent: boolean): SearchResult {
    let score = 0;
    const matches: SearchMatch[] = [];
    const content = note.content.toLowerCase();
    const name = note.name.toLowerCase();

    // Score term matches
    for (const term of query.terms) {
      // Title matches get higher score
      if (name.includes(term)) {
        score += 10;
      }

      // Content matches
      const contentMatches = this.findMatches(note.content, term);
      matches.push(...contentMatches);
      score += contentMatches.length * 2;
    }

    // Score exact phrase matches
    for (const phrase of query.exact) {
      if (name.includes(phrase)) {
        score += 20;
      }

      const phraseMatches = this.findMatches(note.content, phrase);
      matches.push(...phraseMatches);
      score += phraseMatches.length * 5;
    }

    // Boost score for tag and folder matches
    for (const tag of query.tags) {
      if (note.tags.some(t => t.toLowerCase().includes(tag))) {
        score += 15;
      }
    }

    if (note.folder) {
      for (const folder of query.folders) {
        if (note.folder.toLowerCase().includes(folder)) {
          score += 10;
        }
      }
    }

    return {
      noteId: note.id,
      noteName: note.name,
      matches: includeContent ? matches : [],
      score,
    };
  }

  private findMatches(content: string, searchTerm: string): SearchMatch[] {
    const matches: SearchMatch[] = [];
    const lines = content.split('\n');
    const lowerSearchTerm = searchTerm.toLowerCase();

    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber];
      if (!line) continue;

      const lowerLine = line.toLowerCase();

      let index = 0;
      while ((index = lowerLine.indexOf(lowerSearchTerm, index)) !== -1) {
        const start = Math.max(0, index - 20);
        const end = Math.min(line.length, index + searchTerm.length + 20);
        const context = line.substring(start, end);

        matches.push({
          text: line.substring(index, index + searchTerm.length),
          start: index,
          end: index + searchTerm.length,
          lineNumber: lineNumber + 1,
          context: start > 0 ? '...' + context : context,
        });

        index += searchTerm.length;
      }
    }

    return matches;
  }

  // Get all tags with counts
  getAllTags(): Array<{ name: string; count: number }> {
    const tagCounts = new Map<string, number>();

    for (const [term, noteSet] of this.searchIndex.termToNotes) {
      if (term.startsWith('tag:')) {
        const tagName = term.substring(4);
        tagCounts.set(tagName, noteSet.size);
      }
    }

    return Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Get all folders with counts
  getAllFolders(): Array<{ name: string; count: number }> {
    const folderCounts = new Map<string, number>();

    for (const [term, noteSet] of this.searchIndex.termToNotes) {
      if (term.startsWith('folder:')) {
        const folderName = term.substring(7);
        folderCounts.set(folderName, noteSet.size);
      }
    }

    return Array.from(folderCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Rebuild entire index
  rebuildIndex(notes: Note[]): void {
    this.searchIndex = {
      termToNotes: new Map(),
      noteToTerms: new Map(),
    };
    this.notes.clear();

    notes.forEach(note => this.addNote(note));
  }
}

interface SearchOptions {
  limit?: number;
  includeContent?: boolean;
  tags?: string[];
  folders?: string[];
  fuzzy?: boolean;
}

interface ParsedQuery {
  terms: string[];
  tags: string[];
  folders: string[];
  exact: string[];
}
