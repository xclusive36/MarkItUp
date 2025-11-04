import { NextRequest, NextResponse } from 'next/server';
import { fileService } from '@/lib/services/fileService';
import { validateRequest, updateFileRequestSchema, createErrorResponse } from '@/lib/validations';
import { getSyncService } from '@/lib/db/sync';
import {
  fileReadLimiter,
  fileOperationsLimiter,
  getClientIdentifier,
  createRateLimitResponse,
} from '@/lib/security/rateLimiter';
import {
  sanitizeFilename,
  validateContentSize,
  sanitizeMarkdownContent,
} from '@/lib/security/pathSanitizer';

// Prevent dynamic route from catching static routes like /move, /order, etc.
const RESERVED = ['move', 'order', 'rename', 'duplicate'];

function isReserved(filename: string) {
  // Handles both string and array (if catch-all is ever used)
  if (Array.isArray(filename)) filename = filename[0];
  return RESERVED.includes(filename);
}

interface RouteParams {
  params: Promise<{ filename: string }>;
}

/**
 * GET /api/files/[filename]
 * Read a single file
 * Rate limited to prevent abuse
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;

  if (isReserved(resolvedParams.filename)) {
    return createErrorResponse('Not found', 404);
  }

  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = fileReadLimiter.check(clientId);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.resetTime);
    }

    const { filename } = resolvedParams;

    // Sanitize filename
    const filenameSanitization = sanitizeFilename(filename);
    if (!filenameSanitization.valid) {
      return createErrorResponse(
        `Invalid filename: ${filenameSanitization.errors.join(', ')}`,
        400
      );
    }

    const note = await fileService.readFile(filenameSanitization.sanitized);

    if (!note) {
      return createErrorResponse('File not found', 404);
    }

    // Add rate limit headers
    const response = NextResponse.json(note);
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

    return response;
  } catch (error) {
    console.error('[API Error] Error reading file:', error);
    return createErrorResponse('Failed to read file', 500);
  }
}

/**
 * PUT /api/files/[filename]
 * Update or create a file
 * Includes rate limiting, path sanitization, and content validation
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;

  if (isReserved(resolvedParams.filename)) {
    return createErrorResponse('Not found', 404);
  }

  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = fileOperationsLimiter.check(clientId);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.resetTime);
    }

    const { filename } = resolvedParams;
    const body = await request.json();

    // Validate request body
    const validation = await validateRequest(updateFileRequestSchema, { content: body.content });

    if (!validation.success) {
      return createErrorResponse(validation.error, 400);
    }

    const { content } = validation.data;
    const { overwrite } = body;

    // Sanitize filename
    const filenameSanitization = sanitizeFilename(filename);
    if (!filenameSanitization.valid) {
      return createErrorResponse(
        `Invalid filename: ${filenameSanitization.errors.join(', ')}`,
        400
      );
    }

    // Validate content size (10MB max)
    const sizeValidation = validateContentSize(content);
    if (!sizeValidation.valid) {
      return createErrorResponse(sizeValidation.error!, 413);
    }

    // Sanitize markdown content to prevent XSS
    const sanitizedContent = sanitizeMarkdownContent(content);

    console.log('[API PUT] Updating file:', filenameSanitization.sanitized);
    console.log('[API PUT] Content size:', sizeValidation.size, 'bytes');

    const result = await fileService.updateFile(
      filenameSanitization.sanitized,
      sanitizedContent,
      overwrite
    );

    if (!result.success) {
      if (result.requiresOverwrite) {
        return NextResponse.json(
          {
            error: result.message,
            prompt: 'File exists. Are you sure you want to overwrite it?',
            requiresOverwrite: true,
          },
          { status: 409 }
        );
      }
      return createErrorResponse(result.message, 400);
    }

    console.log('[API PUT] File updated successfully');

    // Sync with database
    try {
      const syncService = getSyncService();
      await syncService.indexNote(filenameSanitization.sanitized, sanitizedContent);
      console.log('[API] Note synced to database:', filenameSanitization.sanitized);
    } catch (dbError) {
      console.error('[API] Database sync failed (non-fatal):', dbError);
      // Don't fail the request if DB sync fails
    }

    // Add rate limit headers
    const response = NextResponse.json({ message: result.message });
    response.headers.set('X-RateLimit-Limit', '50');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

    return response;
  } catch (error) {
    console.error('[API Error] Error writing file:', error);

    // Provide more helpful error messages
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }

    return createErrorResponse('Failed to write file', 500);
  }
}

/**
 * DELETE /api/files/[filename]
 * Delete a file
 * Rate limited to prevent abuse
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;

  if (isReserved(resolvedParams.filename)) {
    return createErrorResponse('Not found', 404);
  }

  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = fileOperationsLimiter.check(clientId);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.resetTime);
    }

    const { filename } = resolvedParams;

    // Sanitize filename
    const filenameSanitization = sanitizeFilename(filename);
    if (!filenameSanitization.valid) {
      return createErrorResponse(
        `Invalid filename: ${filenameSanitization.errors.join(', ')}`,
        400
      );
    }

    const result = await fileService.deleteFile(filenameSanitization.sanitized);

    if (!result.success) {
      const status = result.message === 'File not found' ? 404 : 400;
      return createErrorResponse(result.message, status);
    }

    // Sync with database (delete note)
    try {
      const syncService = getSyncService();
      await syncService.deleteNote(filenameSanitization.sanitized);
      console.log('[API] Note deleted from database:', filenameSanitization.sanitized);
    } catch (dbError) {
      console.error('[API] Database delete sync failed (non-fatal):', dbError);
      // Don't fail the request if DB sync fails
    }

    // Add rate limit headers
    const response = NextResponse.json({ message: result.message });
    response.headers.set('X-RateLimit-Limit', '50');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

    return response;
  } catch (error) {
    console.error('[API Error] Error deleting file:', error);
    return createErrorResponse('Failed to delete file', 500);
  }
}
