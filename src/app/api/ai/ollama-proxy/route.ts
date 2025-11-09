import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';

function isRunningInDocker(): boolean {
  try {
    if (fs.existsSync('/.dockerenv')) return true;
    const cgroup = fs.readFileSync('/proc/self/cgroup', 'utf8');
    return /docker|kubepods|containerd/i.test(cgroup);
  } catch {
    // Not Linux or no access; best-effort detection
    return false;
  }
}

function buildDockerHelp(ollamaUrl: string): string {
  try {
    const url = new URL(ollamaUrl);
    const host = url.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    if (isRunningInDocker() && isLocalHost) {
      return 'Running inside Docker? Use http://host.docker.internal:11434 to reach the host machine from the container.';
    }
  } catch {}
  return '';
}

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
        helpText =
          'Connection refused. Ensure the Ollama container is reachable and listening on the provided host/port.';
      } else if (errorMessage.includes('ENOTFOUND')) {
        helpText =
          'Hostname not found. Check the URL or use an IP/host accessible from the server environment.';
      } else if (errorMessage.includes('ETIMEDOUT')) {
        helpText = 'Connection timed out. Check network routes, container networks, and firewalls.';
      }
    }

    // Add container-specific guidance if applicable
    try {
      const reqBody = await request
        .clone()
        .json()
        .catch(() => null);
      const targetBase = reqBody?.ollamaUrl || '';
      const dockerHint = buildDockerHelp(targetBase);
      if (dockerHint) {
        helpText = helpText ? `${helpText} ${dockerHint}` : dockerHint;
      }
    } catch {}

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
        helpText =
          'Connection refused. Ensure the Ollama container is reachable and listening on the provided host/port.';
      } else if (errorMessage.includes('ENOTFOUND')) {
        helpText =
          'Hostname not found. Check the URL or use an IP/host accessible from the server environment.';
      } else if (errorMessage.includes('ETIMEDOUT')) {
        helpText = 'Connection timed out. Check network routes, container networks, and firewalls.';
      }
    }

    // Add container-specific guidance if applicable
    try {
      const { searchParams } = new URL(request.url);
      const targetBase = searchParams.get('ollamaUrl') || '';
      const dockerHint = buildDockerHelp(targetBase);
      if (dockerHint) {
        helpText = helpText ? `${helpText} ${dockerHint}` : dockerHint;
      }
    } catch {}

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
