import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/ai-service';
import { findNoteById, getAllNotes } from '@/lib/file-helpers';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const { userId } = auth;

    const { noteId } = await request.json();

    if (!noteId) {
      return NextResponse.json({ success: false, error: 'Note ID is required' }, { status: 400 });
    }

    const note = await findNoteById(userId, noteId);

    if (!note) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    // Get all other notes for linking suggestions
    const allNotes = await getAllNotes(userId);
    const existingNotes = allNotes.filter(n => n.id !== note.id);

    // Get AI service
    const aiService = getAIService();

    // Suggest links
    const result = await aiService.suggestLinks(note.content, existingNotes);

    if (result.success) {
      return NextResponse.json({
        success: true,
        suggestions: result.suggestions || [],
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to suggest links' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error suggesting links:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
