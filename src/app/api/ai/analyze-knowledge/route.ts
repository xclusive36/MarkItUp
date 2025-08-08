import { NextRequest, NextResponse } from 'next/server';
import { AIAnalyzer } from '@/lib/ai/analyzers';
import { AIService } from '@/lib/ai/ai-service';
import { Note, Tag } from '@/lib/types';
import { analytics } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notes, tags, analysisType } = body;

    console.log('Knowledge analysis request:', {
      notesLength: notes?.length || 0,
      tagsLength: tags?.length || 0,
      analysisType,
      hasApiKey: !!process.env.OPENAI_API_KEY
    });

    if (!notes || !Array.isArray(notes)) {
      console.log('Invalid notes array:', notes);
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
          underExploredAreas: [{
            topic: 'Getting Started',
            currentNoteCount: 0,
            suggestedExpansion: 'Start building your knowledge base by creating notes on topics that interest you.'
          }],
          orphanNotes: [],
          clusteringOpportunities: []
        }
      });
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

    const result = await analyzer.analyzeKnowledgeGaps(
      notes, 
      tags || [], 
      body.userInterests || []
    );

    // Track analytics
    analytics.trackEvent('ai_analysis', {
      analysisType: 'knowledge_gaps',
      notesCount: notes.length,
      tagsCount: tags?.length || 0,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      analysis: result
    });

  } catch (error) {
    console.error('Knowledge analysis error:', error);
    
    analytics.trackEvent('ai_error', {
      error: 'knowledge_analysis_failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { success: false, error: 'Knowledge analysis failed' },
      { status: 500 }
    );
  }
}
