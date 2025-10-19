import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/ai-service';
import { ChatRequest } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest & { stream?: boolean } = await request.json();

    // Validate request
    if (!body.message) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'Message is required' } },
        { status: 400 }
      );
    }

    // Get AI service
    const aiService = getAIService();

    // Check if AI is configured (allow Ollama without API key)
    const settings = aiService.getSettings();
    if (!settings.apiKey && settings.provider !== 'ollama') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_CONFIGURED',
            message: 'AI service not configured. Please add your API key in settings.',
          },
        },
        { status: 400 }
      );
    }

    // For Ollama, we need to proxy the request since the server can't reach it directly
    if (settings.provider === 'ollama' && settings.ollamaUrl) {
      try {
        // Build the Ollama request
        const ollamaMessages = [
          {
            role: 'system',
            content:
              'You are a helpful AI assistant integrated into MarkItUp, a personal knowledge management system.',
          },
          {
            role: 'user',
            content: body.message,
          },
        ];

        // Normalize Ollama URL (remove trailing slash)
        const normalizedOllamaUrl = settings.ollamaUrl.replace(/\/$/, '');

        // Make direct request to Ollama (server-side)
        const ollamaResponse = await fetch(`${normalizedOllamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: settings.model || 'llama3.2',
            messages: ollamaMessages,
            stream: body.stream || false,
          }),
        });

        if (body.stream && ollamaResponse.body) {
          // Return streaming response
          return new NextResponse(ollamaResponse.body, {
            status: ollamaResponse.status,
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
            },
          });
        }

        const result = await ollamaResponse.json();

        if (!ollamaResponse.ok) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'OLLAMA_ERROR',
                message: result.error || 'Failed to connect to Ollama',
              },
            },
            { status: 500 }
          );
        }

        // Format the response (wrapped in success format for plugin API)
        return NextResponse.json({
          success: true,
          data: {
            id: `ai_${Date.now()}`,
            content: result.message?.content || '',
            model: settings.model || 'llama3.2',
            usage: {
              promptTokens: 0,
              completionTokens: 0,
              totalTokens: 0,
              estimatedCost: 0,
            },
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Ollama proxy error:', error);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'OLLAMA_ERROR',
              message: error instanceof Error ? error.message : 'Failed to connect to Ollama',
            },
          },
          { status: 500 }
        );
      }
    }

    // Process chat request for other providers
    const response = await aiService.chat(body);

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const aiService = getAIService();

    switch (action) {
      case 'sessions':
        const sessions = aiService.getAllChatSessions();
        return NextResponse.json({ success: true, data: sessions });

      case 'settings':
        const settings = aiService.getSettings();
        // Don't return API key for security
        const safeSettings = { ...settings, apiKey: settings.apiKey ? '***' : '' };
        return NextResponse.json({ success: true, data: safeSettings });

      case 'providers':
        const providers = aiService.getAvailableProviders();
        return NextResponse.json({ success: true, data: providers });

      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_ACTION', message: 'Invalid action' } },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI API GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const aiService = getAIService();

    switch (action) {
      case 'settings':
        const newSettings = await request.json();
        aiService.updateSettings(newSettings);
        return NextResponse.json({ success: true, message: 'Settings updated' });

      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_ACTION', message: 'Invalid action' } },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI API PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'Session ID is required' } },
        { status: 400 }
      );
    }

    const aiService = getAIService();
    const deleted = aiService.deleteChatSession(sessionId);

    if (deleted) {
      return NextResponse.json({ success: true, message: 'Session deleted' });
    } else {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('AI API DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
