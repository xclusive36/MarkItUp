import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/ai-service';
import { findNoteById } from '@/lib/file-helpers';

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

    // Get AI service
    const aiService = getAIService();

    // Find connections
    const result = await aiService.findConnections(noteId, note.content);

    if (result.success) {
      return NextResponse.json({
        success: true,
        connections: result.connections || [],
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to find connections' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error finding connections:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
