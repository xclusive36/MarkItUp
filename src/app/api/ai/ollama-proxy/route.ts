import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy endpoint for Ollama API calls
 * Prevents CORS issues by routing frontend requests through the backend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ollamaUrl, endpoint, method = 'GET', data } = body;

    // Validate required parameters
    if (!ollamaUrl || !endpoint) {
      return NextResponse.json(
        { success: false, error: 'ollamaUrl and endpoint are required' },
        { status: 400 }
      );
    }

    // Validate endpoint to prevent abuse
    const allowedEndpoints = [
      '/api/tags',
      '/api/version',
      '/api/pull',
      '/api/show',
      '/api/delete',
      '/api/chat',
      '/api/generate',
    ];
    if (!allowedEndpoints.includes(endpoint)) {
      return NextResponse.json({ success: false, error: 'Endpoint not allowed' }, { status: 403 });
    }

    // Build the full URL
    const url = `${ollamaUrl}${endpoint}`;

    // Make the request to Ollama
    const ollamaResponse = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    // For streaming responses (like pull or chat), we need to handle it differently
    if ((endpoint === '/api/pull' || endpoint === '/api/chat') && data?.stream) {
      // Return the streaming response
      return new NextResponse(ollamaResponse.body, {
        status: ollamaResponse.status,
        headers: {
          'Content-Type': 'application/x-ndjson',
        },
      });
    }

    // For non-streaming responses
    if (ollamaResponse.ok) {
      const responseData = await ollamaResponse.json();
      return NextResponse.json({
        success: true,
        data: responseData,
      });
    } else {
      const errorText = await ollamaResponse.text();
      return NextResponse.json(
        {
          success: false,
          error: `Ollama API error: ${ollamaResponse.status} ${ollamaResponse.statusText}`,
          details: errorText,
        },
        { status: ollamaResponse.status }
      );
    }
  } catch (error) {
    console.error('Ollama proxy error:', error);

    // Provide helpful error messages
    let errorMessage = 'Failed to connect to Ollama';
    let helpText = '';

    if (error instanceof Error) {
      errorMessage = error.message;

      if (errorMessage.includes('ECONNREFUSED')) {
        helpText = 'Make sure Ollama is running: `ollama serve`';
      } else if (errorMessage.includes('ENOTFOUND')) {
        helpText = 'Check the hostname/URL';
      } else if (errorMessage.includes('ETIMEDOUT')) {
        helpText = 'Check network connection and firewall settings';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        helpText: helpText,
      },
      { status: 500 }
    );
  }
}

// GET endpoint for simple operations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ollamaUrl = searchParams.get('ollamaUrl');
    const endpoint = searchParams.get('endpoint');

    if (!ollamaUrl || !endpoint) {
      return NextResponse.json(
        { success: false, error: 'ollamaUrl and endpoint are required' },
        { status: 400 }
      );
    }

    // Validate endpoint
    const allowedEndpoints = ['/api/tags', '/api/version'];
    if (!allowedEndpoints.includes(endpoint)) {
      return NextResponse.json({ success: false, error: 'Endpoint not allowed' }, { status: 403 });
    }

    const url = `${ollamaUrl}${endpoint}`;
    const ollamaResponse = await fetch(url);

    if (ollamaResponse.ok) {
      const responseData = await ollamaResponse.json();
      return NextResponse.json({
        success: true,
        data: responseData,
      });
    } else {
      const errorText = await ollamaResponse.text();
      return NextResponse.json(
        {
          success: false,
          error: `Ollama API error: ${ollamaResponse.status} ${ollamaResponse.statusText}`,
          details: errorText,
        },
        { status: ollamaResponse.status }
      );
    }
  } catch (error) {
    console.error('Ollama proxy error:', error);

    let errorMessage = 'Failed to connect to Ollama';
    let helpText = '';

    if (error instanceof Error) {
      errorMessage = error.message;

      if (errorMessage.includes('ECONNREFUSED')) {
        helpText = 'Make sure Ollama is running: `ollama serve`';
      } else if (errorMessage.includes('ENOTFOUND')) {
        helpText = 'Check the hostname/URL';
      } else if (errorMessage.includes('ETIMEDOUT')) {
        helpText = 'Check network connection and firewall settings';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        helpText: helpText,
      },
      { status: 500 }
    );
  }
}
