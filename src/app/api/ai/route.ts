import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/ai-service';
import { ChatRequest } from '@/lib/ai/types';
import { findNoteById, findRelatedNotes, getAllNotes } from '@/lib/file-helpers';
import { requireAuth } from '@/lib/auth/middleware';
import { checkQuota } from '@/lib/usage/quotas';
import { trackUsage } from '@/lib/usage/tracker';
import { apiLogger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const { userId } = auth;

    // Check AI quota before processing
    const aiQuota = await checkQuota(userId, 'ai_requests');
    if (!aiQuota.allowed) {
      apiLogger.warn('AI quota exceeded', { userId, quota: aiQuota });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'QUOTA_EXCEEDED',
            message: aiQuota.message,
          },
        },
        { status: 403 }
      );
    }

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

    // Check for file operation requests first
    const allNotes = getAllNotes();
    const fileOperations = await aiService.detectFileOperations(body.message, allNotes);

    if (fileOperations && fileOperations.operations.length > 0) {
      console.log('[AI API] File operations detected:', fileOperations);
      return NextResponse.json({
        success: true,
        requiresApproval: true,
        fileOperations,
        message: 'File operations detected. Please review and approve.',
      });
    }

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

    // Build context from note if noteContext is provided
    let contextMessage = '';
    let contextNoteCount = 0;
    console.log('[AI API] Request body:', {
      hasNoteContext: !!body.noteContext,
      noteContext: body.noteContext,
      includeContext: body.includeContext,
      messagePreview: body.message.slice(0, 50),
    });

    if (body.noteContext && body.includeContext !== false) {
      try {
        console.log('[AI API] Attempting to find note:', body.noteContext);
        const note = findNoteById(body.noteContext);
        console.log('[AI API] Note found:', {
          found: !!note,
          name: note?.name,
          contentLength: note?.content.length,
        });

        if (note) {
          // Add current note as primary context
          contextMessage = `\n\n[Current Note: "${note.name}"]\n${note.content.slice(0, 1500)}${note.content.length > 1500 ? '\n... (truncated)' : ''}\n`;
          contextNoteCount++;

          // Find and add related notes for enhanced context
          const relatedNotes = findRelatedNotes(body.noteContext, 4); // Get top 4 related notes
          console.log('[AI API] Found related notes:', relatedNotes.length);

          if (relatedNotes.length > 0) {
            contextMessage += '\n[Related Notes for Additional Context]\n';
            relatedNotes.forEach((relatedNote, index) => {
              // Include snippet of related notes (shorter than main note)
              const snippet = relatedNote.content.slice(0, 500);
              contextMessage += `\n${index + 1}. [[${relatedNote.name}]] (${relatedNote.reason})\n${snippet}${relatedNote.content.length > 500 ? '\n... (truncated)' : ''}\n`;
              contextNoteCount++;
            });
          }

          contextMessage += '\n[End of Context]\n\n';
          console.log('[AI API] Enhanced context prepared:', {
            totalNotes: contextNoteCount,
            contextLength: contextMessage.length,
          });
        } else {
          console.warn('[AI API] Note not found for ID:', body.noteContext);
        }
      } catch (error) {
        console.error('[AI API] Failed to load note context:', error);
      }
    }

    // For Ollama, we need to proxy the request since the server can't reach it directly
    if (settings.provider === 'ollama' && settings.ollamaUrl) {
      try {
        // Build the Ollama request with context
        const systemPrompt = `You are a helpful AI assistant integrated into MarkItUp, a personal knowledge management system.${contextMessage ? ' The user has a note open, and its content is provided for context.' : ''}`;

        const ollamaMessages = [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: contextMessage + body.message,
          },
        ];

        console.log('[AI API] Sending to Ollama:', {
          systemPromptLength: systemPrompt.length,
          userMessageLength: (contextMessage + body.message).length,
          hasContext: contextMessage.length > 0,
          messagePreview: (contextMessage + body.message).slice(0, 200),
        });

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

        // Track AI usage
        await trackUsage(userId, 'ai_request');

        apiLogger.info('AI request completed (Ollama)', { userId, model: settings.model });

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
            contextNoteCount,
          },
        });
      } catch (error) {
        apiLogger.error('Ollama proxy error', { userId }, error as Error);
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

    // For other providers, inject context into the message
    if (contextMessage) {
      body.message = contextMessage + body.message;
    }

    // Process chat request for other providers
    const response = await aiService.chat(body);

    // Track AI usage on success
    if (response.success) {
      await trackUsage(userId, 'ai_request');
      apiLogger.info('AI request completed', {
        userId,
        provider: settings.provider,
        model: settings.model,
      });
    }

    // Add context note count to response
    if (response.success && response.data) {
      response.data.contextNoteCount = contextNoteCount;
    }

    return NextResponse.json(response);
  } catch (error) {
    apiLogger.error('AI Chat API error', { userId: 'unknown' }, error as Error);
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
    // Require authentication for reading AI settings/sessions
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

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
    apiLogger.error('AI API GET error', { operation: 'get' }, error as Error);
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
    // Require authentication for updating AI settings
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

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
    apiLogger.error('AI API PUT error', { operation: 'update' }, error as Error);
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
    // Require authentication for deleting AI sessions
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

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
    apiLogger.error('AI API DELETE error', { operation: 'delete' }, error as Error);
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
