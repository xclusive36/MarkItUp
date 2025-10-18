import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/ai-service';
import { ChatRequest } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

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

    // Process chat request
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
