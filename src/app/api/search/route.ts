import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Note } from '@/lib/types';
import { MarkdownParser } from '@/lib/parser';
import { SearchEngine } from '@/lib/search';

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
          readingTime
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
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeContent = searchParams.get('includeContent') === 'true';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const folders = searchParams.get('folders')?.split(',').filter(Boolean) || [];

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    // Load notes from filesystem
    const notes = loadNotesFromFileSystem();
    
    // Create temporary search engine instance
    const searchEngine = new SearchEngine();
    
    // Add notes to search engine
    notes.forEach(note => searchEngine.addNote(note));
    
    const results = searchEngine.search(query, {
      limit,
      includeContent,
      tags,
      folders
    });

    return NextResponse.json({
      query,
      results,
      totalResults: results.length,
      searchOptions: {
        limit,
        includeContent,
        tags,
        folders
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      limit = 20, 
      includeContent = true, 
      tags = [], 
      folders = [],
      fuzzy = false 
    } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Load notes from filesystem
    const notes = loadNotesFromFileSystem();
    
    // Create temporary search engine instance
    const searchEngine = new SearchEngine();
    
    // Add notes to search engine
    notes.forEach(note => searchEngine.addNote(note));
    
    const results = searchEngine.search(query, {
      limit,
      includeContent,
      tags,
      folders,
      fuzzy
    });

    return NextResponse.json({
      query,
      results,
      totalResults: results.length,
      searchOptions: {
        limit,
        includeContent,
        tags,
        folders,
        fuzzy
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
