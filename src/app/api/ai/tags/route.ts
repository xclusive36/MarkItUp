import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/ai-service';
import { findNoteById, getAllTags } from '@/lib/file-helpers';
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

    // Get existing tags from all notes
    const existingTags = await getAllTags(userId);

    // Get AI service
    const aiService = getAIService();

    // Generate tags
    const result = await aiService.generateTags(note.content, existingTags);

    if (result.success) {
      return NextResponse.json({
        success: true,
        tags: result.tags || [],
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate tags' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating tags:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
