import fs from 'fs';
import path from 'path';
import { Note } from './types';
import { MarkdownParser } from './parser';

const MARKDOWN_DIR = path.join(process.cwd(), 'markdown');

export interface FileNote {
  id: string;
  name: string;
  content: string;
  filePath: string;
}

export function findNoteById(noteId: string): FileNote | null {
  function findNoteRecursive(dir: string): FileNote | null {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        const result = findNoteRecursive(itemPath);
        if (result) return result;
      } else if (item.endsWith('.md')) {
        const fileId = path.relative(MARKDOWN_DIR, itemPath).replace(/\\/g, '/');
        if (
          fileId === noteId ||
          fileId === `${noteId}.md` ||
          item === noteId ||
          item === `${noteId}.md`
        ) {
          return {
            id: fileId,
            name: item.replace('.md', ''),
            content: fs.readFileSync(itemPath, 'utf-8'),
            filePath: itemPath,
          };
        }
      }
    }
    return null;
  }

  return findNoteRecursive(MARKDOWN_DIR);
}

export function getAllNotes(): Note[] {
  function findNotesRecursive(dir: string, folderPrefix: string = ''): Note[] {
    let results: Note[] = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        results = results.concat(findNotesRecursive(itemPath, path.join(folderPrefix, item)));
      } else if (item.endsWith('.md')) {
        const content = fs.readFileSync(itemPath, 'utf-8');
        const parsed = MarkdownParser.parseNote(content);
        const wordCount = MarkdownParser.calculateWordCount(content);
        const readingTime = MarkdownParser.calculateReadingTime(wordCount);

        const note: Note = {
          id: MarkdownParser.generateNoteId(item.replace('.md', ''), folderPrefix || undefined),
          name: item,
          content,
          folder: folderPrefix || undefined,
          createdAt: stats.ctime.toISOString(),
          updatedAt: stats.mtime.toISOString(),
          tags: parsed.tags,
          metadata: parsed.frontmatter,
          wordCount,
          readingTime,
        };

        results.push(note);
      }
    }
    return results;
  }

  return findNotesRecursive(MARKDOWN_DIR, '');
}

export function getAllTags(): string[] {
  const notes = getAllNotes();
  const tags = new Set<string>();

  notes.forEach(note => {
    note.tags?.forEach(tag => tags.add(tag));
    // Also extract tags from content
    const tagMatches = note.content.match(/#[\w-]+/g);
    if (tagMatches) {
      tagMatches.forEach(tag => tags.add(tag.slice(1)));
    }
  });

  return Array.from(tags);
}

export interface RelatedNote {
  id: string;
  name: string;
  content: string;
  relevanceScore: number;
  reason: string;
}

/**
 * Find notes related to the current note based on:
 * - Shared tags
 * - Wikilinks (bidirectional)
 * - Content similarity (keyword matching)
 */
export function findRelatedNotes(noteId: string, maxResults: number = 5): RelatedNote[] {
  const currentNote = findNoteById(noteId);
  if (!currentNote) return [];

  const allNotes = getAllNotes();
  const relatedNotes: RelatedNote[] = [];

  // Extract tags from current note
  const currentTags = new Set<string>();
  const tagMatches = currentNote.content.match(/#[\w-]+/g);
  if (tagMatches) {
    tagMatches.forEach(tag => currentTags.add(tag.slice(1).toLowerCase()));
  }

  // Extract wikilinks from current note
  const currentLinks = new Set<string>();
  const linkMatches = currentNote.content.match(/\[\[([^\]]+)\]\]/g);
  if (linkMatches) {
    linkMatches.forEach(link => {
      const linkName = link.slice(2, -2).toLowerCase();
      currentLinks.add(linkName);
    });
  }

  // Extract keywords from current note (words with 4+ chars, excluding common words)
  const commonWords = new Set([
    'this',
    'that',
    'with',
    'from',
    'have',
    'been',
    'were',
    'their',
    'there',
    'about',
    'would',
    'could',
    'should',
    'which',
    'when',
    'where',
    'what',
    'note',
    'markdown',
  ]);
  const currentKeywords = new Set<string>();
  const words = currentNote.content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  words.forEach(word => {
    if (!commonWords.has(word)) {
      currentKeywords.add(word);
    }
  });

  // Score each note for relevance
  for (const note of allNotes) {
    if (note.id === currentNote.id || !note.name.endsWith('.md')) continue;

    let score = 0;
    const reasons: string[] = [];

    // Check for shared tags
    const noteTags = new Set<string>();
    const noteTagMatches = note.content.match(/#[\w-]+/g);
    if (noteTagMatches) {
      noteTagMatches.forEach(tag => noteTags.add(tag.slice(1).toLowerCase()));
    }
    const sharedTags = Array.from(currentTags).filter(tag => noteTags.has(tag));
    if (sharedTags.length > 0) {
      score += sharedTags.length * 0.3;
      reasons.push(`shared tags: ${sharedTags.map(t => `#${t}`).join(', ')}`);
    }

    // Check for wikilinks (bidirectional)
    const noteLinks = new Set<string>();
    const noteLinkMatches = note.content.match(/\[\[([^\]]+)\]\]/g);
    if (noteLinkMatches) {
      noteLinkMatches.forEach(link => {
        const linkName = link.slice(2, -2).toLowerCase();
        noteLinks.add(linkName);
      });
    }

    // Current note links to this note
    const noteName = note.name.replace('.md', '').toLowerCase();
    if (currentLinks.has(noteName)) {
      score += 0.5;
      reasons.push('linked from current note');
    }

    // This note links to current note
    const currentNoteName = currentNote.name.replace('.md', '').toLowerCase();
    if (noteLinks.has(currentNoteName)) {
      score += 0.5;
      reasons.push('links to current note');
    }

    // Check for keyword overlap
    const noteKeywords = new Set<string>();
    const noteWords = note.content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    noteWords.forEach(word => {
      if (!commonWords.has(word)) {
        noteKeywords.add(word);
      }
    });
    const sharedKeywords = Array.from(currentKeywords).filter(kw => noteKeywords.has(kw));
    const keywordScore = Math.min(sharedKeywords.length * 0.02, 0.4);
    if (keywordScore > 0.1) {
      score += keywordScore;
      reasons.push(`${sharedKeywords.length} shared keywords`);
    }

    // If there's any relevance, add to results
    if (score > 0) {
      relatedNotes.push({
        id: note.id,
        name: note.name.replace('.md', ''),
        content: note.content,
        relevanceScore: score,
        reason: reasons.join(', '),
      });
    }
  }

  // Sort by relevance score and return top results
  return relatedNotes.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, maxResults);
}
