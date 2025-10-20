import { NextRequest, NextResponse } from 'next/server';
import { AIAnalyzer } from '@/lib/ai/analyzers';
import { getAIService } from '@/lib/ai/ai-service';
import { Note, Tag } from '@/lib/types';
import { analytics } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notes, tags, analysisType, settings: clientSettings } = body;

    if (!notes || !Array.isArray(notes)) {
      return NextResponse.json(
        { success: false, error: 'Notes array is required' },
        { status: 400 }
      );
    }

    if (notes.length === 0) {
      // Return empty analysis for empty knowledge base
      return NextResponse.json({
        success: true,
        analysis: {
          missingTopics: ['Create Your First Note'],
          underExploredAreas: [
            {
              topic: 'Getting Started',
              currentNoteCount: 0,
              suggestedExpansion:
                'Start building your knowledge base by creating notes on topics that interest you.',
            },
          ],
          orphanNotes: [],
          clusteringOpportunities: [],
        },
      });
    }

    // Get AI service - use client settings if provided, otherwise use server defaults
    const aiService = getAIService();
    if (clientSettings) {
      aiService.updateSettings(clientSettings);
    }
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

    const result = await analyzer.analyzeKnowledgeGaps(notes, tags || [], body.userInterests || []);

    // Track analytics
    analytics.trackEvent('ai_analysis', {
      analysisType: 'knowledge_gaps',
      notesCount: notes.length,
      tagsCount: tags?.length || 0,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error('Knowledge analysis error:', error);

    analytics.trackEvent('ai_error', {
      error: 'knowledge_analysis_failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { success: false, error: 'Knowledge analysis failed' },
      { status: 500 }
    );
  }
}
