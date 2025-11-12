import { Note } from './types';
import { fileService } from './services/fileService';

export interface FileNote {
  id: string;
  name: string;
  content: string;
  filePath: string;
}

/**
 * Find a note by ID for a specific user
 * @param userId - The user ID to scope the search to
 * @param noteId - The note ID to find
 */
export async function findNoteById(userId: string, noteId: string): Promise<FileNote | null> {
  const allNotes = await getAllNotes(userId);

  // Try to match by various ID formats
  for (const note of allNotes) {
    const noteName = note.name.replace('.md', '');
    const noteIdWithoutExt = noteId.replace('.md', '');

    if (
      note.id === noteId ||
      note.id === noteIdWithoutExt ||
      noteName === noteId ||
      noteName === noteIdWithoutExt ||
      (note.folder ? `${note.folder}/${noteName}` : noteName) === noteIdWithoutExt
    ) {
      return {
        id: note.id,
        name: noteName,
        content: note.content,
        filePath: note.folder ? `${note.folder}/${note.name}` : note.name,
      };
    }
  }

  return null;
}

/**
 * Get all notes for a specific user
 * @param userId - The user ID to scope the search to
 */
export async function getAllNotes(userId: string): Promise<Note[]> {
  return await fileService.listFiles(userId);
}

/**
 * Get all tags for a specific user
 * @param userId - The user ID to scope the search to
 */
export async function getAllTags(userId: string): Promise<string[]> {
  const notes = await getAllNotes(userId);
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
 * @param userId - The user ID to scope the search to
 * @param noteId - The note ID to find related notes for
 * @param maxResults - Maximum number of results to return
 */
export async function findRelatedNotes(
  userId: string,
  noteId: string,
  maxResults: number = 5
): Promise<RelatedNote[]> {
  const currentNote = await findNoteById(userId, noteId);
  if (!currentNote) return [];

  const allNotes = await getAllNotes(userId);
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
