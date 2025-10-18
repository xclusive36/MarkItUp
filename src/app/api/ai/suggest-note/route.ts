import { NextRequest, NextResponse } from 'next/server';
import { AIAnalyzer } from '@/lib/ai/analyzers';
import { getAIService } from '@/lib/ai/ai-service';
import { Note } from '@/lib/types';
import { analytics } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, existingNotes, relatedTags, userInterests } = body;

    if (!topic) {
      return NextResponse.json({ success: false, error: 'Topic is required' }, { status: 400 });
    }

    // Get AI service (uses user's configured provider and settings)
    const aiService = getAIService();
    const settings = aiService.getSettings();

    // Check if AI is configured (allow Ollama without API key)
    if (!settings.apiKey && settings.provider !== 'ollama') {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service not configured. Please configure your AI provider in settings.',
          requiresApiKey: true,
        },
        { status: 400 }
      );
    }

    const analyzer = new AIAnalyzer(aiService);

    const suggestion = await analyzer.generateNoteSuggestions(topic, {
      existingNotes: existingNotes || [],
      relatedTags: relatedTags || [],
      userInterests: userInterests || [],
    });

    // Track analytics
    analytics.trackEvent('ai_analysis', {
      action: 'generate_note_suggestion',
      topic: topic,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      suggestion: suggestion,
    });
  } catch (error) {
    console.error('Note suggestion error:', error);

    analytics.trackEvent('ai_error', {
      error: 'note_suggestion_failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ success: false, error: 'Note suggestion failed' }, { status: 500 });
  }
}
