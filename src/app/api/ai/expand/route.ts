import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/ai-service';
import { findNoteById } from '@/lib/file-helpers';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const { userId } = auth;

    const { text, noteId } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text to expand is required' },
        { status: 400 }
      );
    }

    let context = '';

    // If noteId provided, get context from note
    if (noteId) {
      const note = await findNoteById(userId, noteId);
      if (note) {
        context = note.content;
      }
    }

    // Get AI service
    const aiService = getAIService();

    // Expand section
    const result = await aiService.expandSection(text, context);

    if (result.success) {
      return NextResponse.json({
        success: true,
        expanded: result.expanded || '',
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to expand text' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error expanding text:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
