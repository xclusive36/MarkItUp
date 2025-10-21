import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Note, GraphFilters } from '@/lib/types';
import { MarkdownParser } from '@/lib/parser';
import { GraphBuilder } from '@/lib/graph';
import { filterGraph } from '@/lib/graph-utils';

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
    const centerNode = searchParams.get('center');
    const maxNodes = parseInt(searchParams.get('maxNodes') || '1000');
    const maxDistance = parseInt(searchParams.get('maxDistance') || '3');
    const minConnections = parseInt(searchParams.get('minConnections') || '0');
    const includeOrphans = searchParams.get('includeOrphans') !== 'false';

    // Get filter parameters
    const folders = searchParams.get('folders')?.split(',').filter(Boolean);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const searchQuery = searchParams.get('query');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Load notes from filesystem
    const notes = loadNotesFromFileSystem();
    const notesMap = new Map(notes.map(note => [note.id, note]));

    // Create temporary graph builder instance
    const graphBuilder = new GraphBuilder();

    // Add notes to graph builder
    notes.forEach(note => graphBuilder.addNote(note));

    let graph = graphBuilder.buildGraph({
      centerNode: centerNode || null,
      maxNodes,
      maxDistance,
      minConnections,
      includeOrphans,
    });

    // Apply additional filters if provided
    const filters: GraphFilters = {
      folders,
      tags,
      searchQuery: searchQuery || undefined,
      maxNodes,
      dateRange: startDate && endDate ? [new Date(startDate), new Date(endDate)] : undefined,
    };

    if (folders || tags || searchQuery || (startDate && endDate)) {
      graph = filterGraph(graph, filters, notesMap);
    }

    const stats = graphBuilder.getStats();

    return NextResponse.json({
      graph,
      stats,
      options: {
        centerNode,
        maxNodes,
        maxDistance,
        minConnections,
        includeOrphans,
        filters,
      },
    });
  } catch (error) {
    console.error('Graph generation error:', error);
    return NextResponse.json({ error: 'Graph generation failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      centerNode = null,
      maxNodes = 1000,
      maxDistance = 3,
      minConnections = 0,
      includeOrphans = true,
    } = body;

    // Load notes from filesystem
    const notes = loadNotesFromFileSystem();

    // Create temporary graph builder instance
    const graphBuilder = new GraphBuilder();

    // Add notes to graph builder
    notes.forEach(note => graphBuilder.addNote(note));

    const graph = graphBuilder.buildGraph({
      centerNode,
      maxNodes,
      maxDistance,
      minConnections,
      includeOrphans,
    });

    const stats = graphBuilder.getStats();

    return NextResponse.json({
      graph,
      stats,
      options: {
        centerNode,
        maxNodes,
        maxDistance,
        minConnections,
        includeOrphans,
      },
    });
  } catch (error) {
    console.error('Graph generation error:', error);
    return NextResponse.json({ error: 'Graph generation failed' }, { status: 500 });
  }
}
