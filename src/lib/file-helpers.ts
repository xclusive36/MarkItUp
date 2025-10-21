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
