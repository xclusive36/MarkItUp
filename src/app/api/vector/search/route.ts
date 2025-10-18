import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Note } from '@/lib/types';
import { MarkdownParser } from '@/lib/parser';
import { UnifiedSearchEngine } from '@/lib/search/unified-search';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      mode = 'hybrid', // 'keyword' | 'semantic' | 'hybrid'
      limit = 20,
      includeContent = true,
      tags = [],
      folders = [],
      threshold = 0.5,
    } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Load notes from filesystem
    const notes = loadNotesFromFileSystem();

    // Create unified search engine
    const unifiedSearch = new UnifiedSearchEngine();

    // Initialize vector search (will enable if possible)
    await unifiedSearch.initialize();

    // Perform search
    const result = await unifiedSearch.search(query, notes, {
      mode,
      limit,
      includeContent,
      tags,
      folders,
      threshold,
    });

    return NextResponse.json({
      success: true,
      query,
      ...result,
    });
  } catch (error) {
    console.error('Vector search error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const mode = (searchParams.get('mode') || 'hybrid') as 'keyword' | 'semantic' | 'hybrid';
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeContent = searchParams.get('includeContent') !== 'false';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const folders = searchParams.get('folders')?.split(',').filter(Boolean) || [];
    const threshold = parseFloat(searchParams.get('threshold') || '0.5');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    // Load notes from filesystem
    const notes = loadNotesFromFileSystem();

    // Create unified search engine
    const unifiedSearch = new UnifiedSearchEngine();

    // Initialize vector search
    await unifiedSearch.initialize();

    // Perform search
    const result = await unifiedSearch.search(query, notes, {
      mode,
      limit,
      includeContent,
      tags,
      folders,
      threshold,
    });

    return NextResponse.json({
      success: true,
      query,
      ...result,
    });
  } catch (error) {
    console.error('Vector search error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    );
  }
}
