import { NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/ai-service';
import { AISettings } from '@/lib/ai/types';
import {
  parseNaturalLanguageQuery,
  generateSearchSuggestions,
  analyzeQuery,
  semanticRefinement,
  reRankResults,
} from '@/lib/ai/search-ai';
import { SearchResult, Note } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const {
      action,
      query,
      refinementQuery,
      results,
      notes,
      aiSettings,
    }: {
      action: 'parse' | 'suggest' | 'analyze' | 'refine' | 'rerank';
      query: string;
      refinementQuery?: string;
      results?: SearchResult[];
      notes?: Note[];
      aiSettings: AISettings;
    } = await request.json();

    // Initialize AI service
    const aiService = new AIService(aiSettings);

    switch (action) {
      case 'parse': {
        // Parse natural language query
        const parsed = await parseNaturalLanguageQuery(query, aiService);
        return NextResponse.json({
          success: true,
          data: parsed,
        });
      }

      case 'suggest': {
        // Generate search suggestions
        if (!results || !notes) {
          return NextResponse.json(
            {
              success: false,
              error: 'Results and notes are required for suggestions',
            },
            { status: 400 }
          );
        }

        const suggestions = await generateSearchSuggestions(query, results, notes, aiService);
        return NextResponse.json({
          success: true,
          data: suggestions,
        });
      }

      case 'analyze': {
        // Analyze query for corrections
        const correction = await analyzeQuery(query, aiService);
        return NextResponse.json({
          success: true,
          data: correction,
        });
      }

      case 'refine': {
        // Semantic refinement of results
        if (!refinementQuery || !results || !notes) {
          return NextResponse.json(
            {
              success: false,
              error: 'Refinement query, results, and notes are required',
            },
            { status: 400 }
          );
        }

        const refined = await semanticRefinement(query, refinementQuery, results, notes, aiService);

        return NextResponse.json({
          success: true,
          data: refined,
        });
      }

      case 'rerank': {
        // Re-rank search results using AI
        if (!results || !notes) {
          return NextResponse.json(
            {
              success: false,
              error: 'Results and notes are required for re-ranking',
            },
            { status: 400 }
          );
        }

        const reranked = await reRankResults(query, results, notes, aiService);
        return NextResponse.json({
          success: true,
          data: reranked,
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[API] AI Search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
