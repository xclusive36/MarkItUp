import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/ai-service';
import { findNoteById, getAllNotes } from '@/lib/file-helpers';

export async function POST(request: NextRequest) {
  try {
    const { noteId } = await request.json();

    if (!noteId) {
      return NextResponse.json({ success: false, error: 'Note ID is required' }, { status: 400 });
    }

    const note = findNoteById(noteId);

    if (!note) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    // Get related notes (sample of other notes)
    const allNotes = getAllNotes();
    const relatedNotes = allNotes.filter(n => n.id !== note.id).slice(0, 10);

    // Get AI service
    const aiService = getAIService();

    // Identify knowledge gaps
    const result = await aiService.identifyKnowledgeGaps(note.content, relatedNotes);

    if (result.success) {
      return NextResponse.json({
        success: true,
        gaps: result.gaps || [],
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to identify gaps' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error identifying gaps:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
