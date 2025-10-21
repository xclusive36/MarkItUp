import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Note } from '@/lib/types';
import { MarkdownParser } from '@/lib/parser';
import { GraphBuilder } from '@/lib/graph';

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

export async function GET() {
  try {
    // Load notes from filesystem
    const notes = loadNotesFromFileSystem();

    // Create temporary graph builder instance
    const graphBuilder = new GraphBuilder();

    // Add notes to graph builder
    notes.forEach(note => graphBuilder.addNote(note));

    // Get comprehensive analytics
    const stats = graphBuilder.getStats();
    const healthMetrics = graphBuilder.getHealthMetrics();
    const clusters = graphBuilder.detectClusters();
    const coverageGaps = graphBuilder.findCoverageGaps();
    const temporalAnalysis = graphBuilder.getTemporalAnalysis();
    const bridgeNotes = graphBuilder.findBridgeNotes(clusters);

    return NextResponse.json({
      stats,
      healthMetrics,
      clusters: clusters.map(c => ({
        id: c.id,
        label: c.label,
        size: c.size,
        density: c.density,
        nodeCount: c.nodes.length,
      })),
      coverageGaps: coverageGaps.slice(0, 10), // Top 10 gaps
      temporalAnalysis,
      bridgeNotes: bridgeNotes.slice(0, 10), // Top 10 bridge notes
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics generation error:', error);
    return NextResponse.json({ error: 'Analytics generation failed' }, { status: 500 });
  }
}
