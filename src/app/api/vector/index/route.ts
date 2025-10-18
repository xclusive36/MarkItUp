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

/**
 * POST /api/vector/index
 * Index notes for vector search
 */
export async function POST(request: NextRequest) {
  try {
    await request.json(); // Parse body but don't use parameters (handled client-side)

    // Note: This is a server-side endpoint but vector store is browser-based
    // In production, you'd want a server-side vector store or
    // use this endpoint to return notes for client-side indexing

    const notes = loadNotesFromFileSystem();

    return NextResponse.json({
      success: true,
      message: 'Notes ready for indexing',
      notesCount: notes.length,
      notes: notes.map(n => ({
        id: n.id,
        name: n.name,
        tags: n.tags,
        folder: n.folder,
        updatedAt: n.updatedAt,
        wordCount: n.wordCount,
      })),
      instructions: 'Use client-side vector indexing service to process these notes',
    });
  } catch (error) {
    console.error('Index preparation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to prepare notes for indexing',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vector/index
 * Get indexing status
 */
export async function GET() {
  try {
    const notes = loadNotesFromFileSystem();

    return NextResponse.json({
      success: true,
      notesCount: notes.length,
      message: 'Vector indexing is handled client-side',
      instructions: 'Initialize vector store in browser to index notes',
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get indexing status',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    );
  }
}
