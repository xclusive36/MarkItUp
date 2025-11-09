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
import { requireAuth } from '@/lib/auth/middleware';
import { checkQuota } from '@/lib/usage/quotas';
import { trackUsage, updateStorageUsage } from '@/lib/usage/tracker';
import { apiLogger } from '@/lib/logger';

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
 * Requires authentication - only returns files owned by the authenticated user
 * Rate limited to prevent abuse
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;

  if (isReserved(resolvedParams.filename)) {
    return createErrorResponse('Not found', 404);
  }

  try {
    // Require authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const { userId } = auth;

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = fileReadLimiter.check(clientId);

    if (!rateLimit.allowed) {
      apiLogger.warn('Rate limit exceeded for file read', { clientId, userId, operation: 'read' });
      return createRateLimitResponse(rateLimit.resetTime);
    }

    const { filename } = resolvedParams;

    // Sanitize filename
    const filenameSanitization = sanitizeFilename(filename);
    if (!filenameSanitization.valid) {
      apiLogger.warn('Invalid filename attempted', {
        filename,
        errors: filenameSanitization.errors,
        userId,
        clientId,
      });
      return createErrorResponse(
        `Invalid filename: ${filenameSanitization.errors.join(', ')}`,
        400
      );
    }

    // Read file for authenticated user only
    const note = await fileService.readFile(userId, filenameSanitization.sanitized);

    if (!note) {
      apiLogger.warn('File not found or access denied', {
        filename: filenameSanitization.sanitized,
        userId,
      });
      return createErrorResponse('File not found', 404);
    }

    apiLogger.debug('File read successfully', {
      filename: filenameSanitization.sanitized,
      userId,
      clientId,
    });

    // Add rate limit headers
    const response = NextResponse.json(note);
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

    return response;
  } catch (error) {
    apiLogger.error('Error reading file', { operation: 'read' }, error as Error);
    return createErrorResponse('Failed to read file', 500);
  }
}

/**
 * PUT /api/files/[filename]
 * Update or create a file
 * Requires authentication - only allows updating files owned by the authenticated user
 * Includes rate limiting, quota checking, path sanitization, and content validation
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;

  if (isReserved(resolvedParams.filename)) {
    return createErrorResponse('Not found', 404);
  }

  try {
    // Require authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const { userId } = auth;

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = fileOperationsLimiter.check(clientId);

    if (!rateLimit.allowed) {
      apiLogger.warn('Rate limit exceeded for file update', {
        clientId,
        userId,
        operation: 'update',
      });
      return createRateLimitResponse(rateLimit.resetTime);
    }

    const { filename } = resolvedParams;
    const body = await request.json();

    // Validate request body
    const validation = await validateRequest(updateFileRequestSchema, { content: body.content });

    if (!validation.success) {
      apiLogger.warn('Invalid file update request', { error: validation.error, userId, clientId });
      return createErrorResponse(validation.error, 400);
    }

    const { content } = validation.data;
    const { overwrite } = body;

    // Sanitize filename
    const filenameSanitization = sanitizeFilename(filename);
    if (!filenameSanitization.valid) {
      apiLogger.warn('Invalid filename attempted', {
        filename,
        errors: filenameSanitization.errors,
        userId,
        clientId,
      });
      return createErrorResponse(
        `Invalid filename: ${filenameSanitization.errors.join(', ')}`,
        400
      );
    }

    // Validate content size (10MB max)
    const sizeValidation = validateContentSize(content);
    if (!sizeValidation.valid) {
      apiLogger.warn('File size limit exceeded', { size: sizeValidation.size, userId, clientId });
      return createErrorResponse(sizeValidation.error!, 413);
    }

    // Sanitize markdown content to prevent XSS
    const sanitizedContent = sanitizeMarkdownContent(content);

    // Check if file exists for this user
    const existingFile = await fileService.fileExists(userId, filenameSanitization.sanitized);

    // If creating a new file, check notes quota
    if (!existingFile) {
      const notesQuota = await checkQuota(userId, 'notes');
      if (!notesQuota.allowed) {
        apiLogger.warn('Notes quota exceeded', { userId, quota: notesQuota });
        return NextResponse.json(
          { error: 'Quota Exceeded', message: notesQuota.message },
          { status: 403 }
        );
      }
    }

    // Check storage quota
    const contentSize = Buffer.byteLength(sanitizedContent, 'utf8');
    const currentStorage = await fileService.calculateStorageUsed(userId);
    const storageQuota = await checkQuota(userId, 'storage');

    // If file exists, subtract its current size from the calculation
    let oldFileSize = 0;
    if (existingFile) {
      const oldNote = await fileService.readFile(userId, filenameSanitization.sanitized);
      if (oldNote) {
        oldFileSize = Buffer.byteLength(oldNote.content, 'utf8');
      }
    }

    const netStorageChange = contentSize - oldFileSize;
    if (currentStorage + netStorageChange > (storageQuota.limit || 0)) {
      apiLogger.warn('Storage quota would be exceeded', {
        userId,
        currentStorage,
        netChange: netStorageChange,
        limit: storageQuota.limit,
      });
      return NextResponse.json(
        { error: 'Quota Exceeded', message: storageQuota.message },
        { status: 403 }
      );
    }

    apiLogger.debug('Updating file', {
      filename: filenameSanitization.sanitized,
      size: sizeValidation.size,
      userId,
      clientId,
    });

    const result = await fileService.updateFile(
      userId,
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

    apiLogger.info('File updated successfully', {
      filename: filenameSanitization.sanitized,
      userId,
      wasNew: !existingFile,
    });

    // Track usage
    if (!existingFile) {
      await trackUsage(userId, 'note_created');
    } else {
      await trackUsage(userId, 'note_updated');
    }

    // Update storage usage
    const newStorage = await fileService.calculateStorageUsed(userId);
    await updateStorageUsage(userId, newStorage);

    // Sync with database
    try {
      const syncService = getSyncService();
      await syncService.indexNote(filenameSanitization.sanitized, sanitizedContent, userId);
      apiLogger.debug('Note synced to database', {
        noteId: filenameSanitization.sanitized,
        userId,
      });
    } catch (dbError) {
      apiLogger.error(
        'Database sync failed (non-fatal)',
        {
          noteId: filenameSanitization.sanitized,
          userId,
        },
        dbError as Error
      );
      // Don't fail the request if DB sync fails
    }

    // Add rate limit headers
    const response = NextResponse.json({ message: result.message });
    response.headers.set('X-RateLimit-Limit', '50');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

    return response;
  } catch (error) {
    apiLogger.error('Error writing file', { operation: 'update' }, error as Error);

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
 * Requires authentication - only allows deleting files owned by the authenticated user
 * Rate limited to prevent abuse
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;

  if (isReserved(resolvedParams.filename)) {
    return createErrorResponse('Not found', 404);
  }

  try {
    // Require authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const { userId } = auth;

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = fileOperationsLimiter.check(clientId);

    if (!rateLimit.allowed) {
      apiLogger.warn('Rate limit exceeded for file deletion', {
        clientId,
        userId,
        operation: 'delete',
      });
      return createRateLimitResponse(rateLimit.resetTime);
    }

    const { filename } = resolvedParams;

    // Sanitize filename
    const filenameSanitization = sanitizeFilename(filename);
    if (!filenameSanitization.valid) {
      apiLogger.warn('Invalid filename attempted', {
        filename,
        errors: filenameSanitization.errors,
        userId,
        clientId,
      });
      return createErrorResponse(
        `Invalid filename: ${filenameSanitization.errors.join(', ')}`,
        400
      );
    }

    // Delete file for authenticated user only
    const result = await fileService.deleteFile(userId, filenameSanitization.sanitized);

    if (!result.success) {
      const status = result.message === 'File not found' ? 404 : 400;
      apiLogger.warn('File deletion failed', {
        filename: filenameSanitization.sanitized,
        reason: result.message,
        userId,
      });
      return createErrorResponse(result.message, status);
    }

    apiLogger.info('File deleted successfully', {
      filename: filenameSanitization.sanitized,
      userId,
    });

    // Track usage
    await trackUsage(userId, 'note_deleted');

    // Update storage usage
    const newStorage = await fileService.calculateStorageUsed(userId);
    await updateStorageUsage(userId, newStorage);

    // Sync with database (delete note)
    try {
      const syncService = getSyncService();
      await syncService.deleteNote(filenameSanitization.sanitized);
      apiLogger.debug('Note deleted from database', {
        noteId: filenameSanitization.sanitized,
        userId,
      });
    } catch (dbError) {
      apiLogger.error(
        'Database delete sync failed (non-fatal)',
        {
          noteId: filenameSanitization.sanitized,
          userId,
        },
        dbError as Error
      );
      // Don't fail the request if DB sync fails
    }

    // Add rate limit headers
    const response = NextResponse.json({ message: result.message });
    response.headers.set('X-RateLimit-Limit', '50');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

    return response;
  } catch (error) {
    apiLogger.error('Error deleting file', { operation: 'delete' }, error as Error);
    return createErrorResponse('Failed to delete file', 500);
  }
}
