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
