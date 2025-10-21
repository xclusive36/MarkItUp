import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/ai-service';
import { findNoteById, getAllTags } from '@/lib/file-helpers';

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

    // Get existing tags from all notes
    const existingTags = getAllTags();

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
