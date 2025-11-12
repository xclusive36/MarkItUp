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

    const { noteId } = await request.json();

    if (!noteId) {
      return NextResponse.json({ success: false, error: 'Note ID is required' }, { status: 400 });
    }

    const note = await findNoteById(userId, noteId);

    if (!note) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    // Get AI service and generate summary
    const aiService = getAIService();
    const provider = aiService['getCurrentProvider']();

    const prompt = `Summarize this note concisely. Highlight key points and main ideas.

Note Content:
${note.content}

Provide a clear, structured summary in 2-3 paragraphs.`;

    const summary = await provider.complete(prompt, {
      temperature: 0.3,
      maxTokens: 400,
    });

    return NextResponse.json({
      success: true,
      summary: summary.trim(),
    });
  } catch (error) {
    console.error('Error summarizing note:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
