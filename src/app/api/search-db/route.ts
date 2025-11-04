import { NextRequest, NextResponse } from 'next/server';
import { searchNotes, getBacklinks, getTagsWithCounts } from '@/lib/db';

/**
 * Database-powered search API
 * Uses SQLite FTS5 for blazing-fast full-text search
 *
 * GET /api/search-db?q=query&limit=20&mode=fts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const mode = searchParams.get('mode') || 'fts'; // 'fts', 'backlinks', 'tags'
    const noteId = searchParams.get('noteId');

    // Handle different search modes
    switch (mode) {
      case 'backlinks':
        if (!noteId) {
          return NextResponse.json(
            { error: 'noteId required for backlinks mode' },
            { status: 400 }
          );
        }
        const backlinks = await getBacklinks(noteId);
        return NextResponse.json({
          results: backlinks,
          mode: 'backlinks',
          count: backlinks.length,
        });

      case 'tags':
        const tags = await getTagsWithCounts();
        return NextResponse.json({
          results: tags,
          mode: 'tags',
          count: tags.length,
        });

      case 'fts':
      default:
        if (!query.trim()) {
          return NextResponse.json({
            results: [],
            mode: 'fts',
            count: 0,
            message: 'Empty query',
          });
        }

        const startTime = Date.now();
        const results = await searchNotes(query, limit);
        const duration = Date.now() - startTime;

        // Transform results to match expected format
        const searchResults = results.map(note => {
          // Extract context snippets around search term
          const content = note.content || '';
          const lowerQuery = query.toLowerCase();

          // Find all occurrences
          const matches: Array<{
            text: string;
            start: number;
            end: number;
            lineNumber: number;
            context: string;
          }> = [];

          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.toLowerCase().includes(lowerQuery)) {
              const startIdx = line.toLowerCase().indexOf(lowerQuery);
              matches.push({
                text: line.substring(startIdx, startIdx + query.length),
                start: startIdx,
                end: startIdx + query.length,
                lineNumber: idx + 1,
                context: line.trim(),
              });
            }
          });

          return {
            noteId: note.id,
            noteName: note.name,
            folder: note.folder,
            title: note.title,
            matches: matches.slice(0, 3), // Top 3 matches
            score: matches.length / 10, // Simple relevance score
            tags: note.tags ? JSON.parse(note.tags) : [],
            updatedAt: note.updatedAt,
          };
        });

        return NextResponse.json({
          results: searchResults,
          mode: 'fts',
          count: searchResults.length,
          duration: `${duration}ms`,
          query,
        });
    }
  } catch (error) {
    console.error('[DB Search] Error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
