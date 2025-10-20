import { NextRequest, NextResponse } from 'next/server';
import { AIAnalyzer } from '@/lib/ai/analyzers';
import { Note, Tag } from '@/lib/types';
import { analytics } from '@/lib/analytics';
import { getAIService } from '@/lib/ai/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notes, tags, analysisType, content, noteId, settings: clientSettings } = body;

    // Check if we have either notes array OR content for analysis
    if (!notes && !content) {
      return NextResponse.json(
        { success: false, error: 'Either notes array or content is required' },
        { status: 400 }
      );
    }

    // For content analysis, we don't need a notes array
    if (
      content &&
      (analysisType === 'content' ||
        analysisType === 'writing_assistance' ||
        analysisType === 'full')
    ) {
      // This is a single content analysis request
    } else if (!notes || !Array.isArray(notes)) {
      return NextResponse.json(
        { success: false, error: 'Notes array is required for knowledge analysis' },
        { status: 400 }
      );
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
    let result;

    switch (analysisType) {
      case 'content':
        if (!content) {
          return NextResponse.json(
            { success: false, error: 'Content is required for content analysis' },
            { status: 400 }
          );
        }
        result = await analyzer.analyzeContent(content, content);
        break;

      case 'writing_assistance':
        if (!content) {
          return NextResponse.json(
            { success: false, error: 'Content is required for writing assistance' },
            { status: 400 }
          );
        }
        result = await analyzer.generateWritingAssistance(content, {
          relatedNotes: notes || [],
          targetAudience: body.targetAudience,
          purpose: body.purpose,
        });
        break;

      case 'full':
        if (!content) {
          return NextResponse.json(
            { success: false, error: 'Content is required for full analysis' },
            { status: 400 }
          );
        }
        // For full analysis, return both content analysis and writing assistance
        const contentAnalysis = await analyzer.analyzeContent(content, content);
        const writingAssistance = await analyzer.generateWritingAssistance(content, {
          relatedNotes: notes || [],
          targetAudience: body.targetAudience,
          purpose: body.purpose,
        });

        result = {
          analysis: contentAnalysis,
          assistance: writingAssistance,
        };
        break;

      case 'knowledge_gaps':
        if (!notes || !Array.isArray(notes)) {
          return NextResponse.json(
            { success: false, error: 'Notes array is required for knowledge gap analysis' },
            { status: 400 }
          );
        }
        result = await analyzer.analyzeKnowledgeGaps(notes, tags || [], body.userInterests || []);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analysis type' },
          { status: 400 }
        );
    }

    // Track analytics
    analytics.trackEvent('ai_analysis', {
      analysisType,
      notesCount: notes?.length || 0,
      tagsCount: tags?.length || 0,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error('Analysis error:', error);

    analytics.trackEvent('ai_error', {
      error: 'analysis_failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    availableAnalysisTypes: ['content', 'writing_assistance', 'knowledge_gaps'],
  });
}
