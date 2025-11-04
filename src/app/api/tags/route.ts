import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Note } from '@/lib/types';
import { MarkdownParser } from '@/lib/parser';

const MARKDOWN_DIR = path.join(process.cwd(), 'markdown');

// Helper function to load all notes from filesystem
function loadNotesFromFileSystem(): Note[] {
  function findNotesRecursive(dir: string, folderPrefix: string = ''): Note[] {
    let results: Note[] = [];
    if (!fs.existsSync(dir)) return results;

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');

    // Load notes from filesystem
    const notes = loadNotesFromFileSystem();

    if (tag) {
      // Get notes for a specific tag
      const filteredNotes = notes.filter(note =>
        note.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
      return NextResponse.json({
        tag,
        notes: filteredNotes,
        count: filteredNotes.length,
      });
    } else {
      // Get all tags with counts
      const tagCounts = new Map<string, number>();
      const folderCounts = new Map<string, number>();

      notes.forEach(note => {
        // Count tags
        note.tags.forEach(tag => {
          tagCounts.set(tag.toLowerCase(), (tagCounts.get(tag.toLowerCase()) || 0) + 1);
        });

        // Count folders
        if (note.folder) {
          folderCounts.set(note.folder, (folderCounts.get(note.folder) || 0) + 1);
        }
      });

      const tags = Array.from(tagCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      const folders = Array.from(folderCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      return NextResponse.json({
        tags,
        folders,
        totalTags: tags.length,
        totalFolders: folders.length,
      });
    }
  } catch (error) {
    console.error('Tags API error:', error);
    return NextResponse.json({ error: 'Tags retrieval failed' }, { status: 500 });
  }
}
