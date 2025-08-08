import { NextRequest, NextResponse } from 'next/server';
import { AIAnalyzer } from '@/lib/ai/analyzers';
import { AIService } from '@/lib/ai/ai-service';
import { Note } from '@/lib/types';
import { analytics } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, existingNotes, relatedTags, userInterests } = body;

    console.log('Note suggestion request:', {
      topic,
      existingNotesLength: existingNotes?.length || 0,
      relatedTagsLength: relatedTags?.length || 0,
      userInterestsLength: userInterests?.length || 0,
      hasApiKey: !!process.env.OPENAI_API_KEY
    });

    if (!topic) {
      console.log('Missing topic in request');
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.',
          requiresApiKey: true
        },
        { status: 400 }
      );
    }

    // Create AIService with default settings
    const defaultSettings = {
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: process.env.OPENAI_API_KEY || '',
      maxTokens: 1024,
      temperature: 0.7,
      enableContext: true,
      maxContextNotes: 10,
      contextSearchDepth: 2,
      enableUsageTracking: true,
      monthlyLimit: 10000,
      enableLocalFallback: false
    };
    
    const aiService = new AIService(defaultSettings);
    const analyzer = new AIAnalyzer(aiService);

    const suggestion = await analyzer.generateNoteSuggestions(
      topic,
      {
        existingNotes: existingNotes || [],
        relatedTags: relatedTags || [],
        userInterests: userInterests || []
      }
    );

    // Track analytics
    analytics.trackEvent('ai_analysis', {
      action: 'generate_note_suggestion',
      topic: topic,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      suggestion: suggestion
    });

  } catch (error) {
    console.error('Note suggestion error:', error);
    
    analytics.trackEvent('ai_error', {
      error: 'note_suggestion_failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { success: false, error: 'Note suggestion failed' },
      { status: 500 }
    );
  }
}
