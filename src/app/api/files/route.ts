import { NextRequest, NextResponse } from 'next/server';
import { fileService } from '@/lib/services/fileService';
import { validateRequest, createFileRequestSchema, createErrorResponse } from '@/lib/validations';
import { getSyncService } from '@/lib/db/sync';
import {
  fileReadLimiter,
  fileCreationLimiter,
  getClientIdentifier,
  createRateLimitResponse,
} from '@/lib/security/rateLimiter';
import {
  sanitizeFilename,
  sanitizeFolderPath,
  validateContentSize,
  sanitizeMarkdownContent,
} from '@/lib/security/pathSanitizer';
import { apiLogger } from '@/lib/logger';
import { requireAuth } from '@/lib/auth/middleware';
import { checkQuota } from '@/lib/usage/quotas';
import { trackUsage, updateStorageUsage } from '@/lib/usage/tracker';

/**
 * GET /api/files
 * List all markdown files with optional pagination
 * Requires authentication - only returns files owned by the authenticated user
 * Query params:
 * - page: page number (default: 1)
 * - limit: items per page (default: 100, max: 500)
 * - sort: sort field (name, modified, created)
 * - order: sort order (asc, desc)
 * Rate limited to prevent abuse
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const { userId } = auth;
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = fileReadLimiter.check(clientId);

    if (!rateLimit.allowed) {
      apiLogger.warn('Rate limit exceeded for file list', { clientId, userId, operation: 'list' });
      return createRateLimitResponse(rateLimit.resetTime);
    }

    // Parse pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '100', 10)));
    const sortField = searchParams.get('sort') || 'modified';
    const sortOrder = searchParams.get('order') || 'desc';

    // Get files for authenticated user only
    const allNotes = await fileService.listFiles(userId);

    // Sort notes
    const sortedNotes = [...allNotes].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortField) {
        case 'name':
          aVal = a.id.toLowerCase();
          bVal = b.id.toLowerCase();
          break;
        case 'modified':
        case 'updated':
          aVal = new Date(a.updatedAt || 0).getTime();
          bVal = new Date(b.updatedAt || 0).getTime();
          break;
        case 'created':
          aVal = new Date(a.createdAt || 0).getTime();
          bVal = new Date(b.createdAt || 0).getTime();
          break;
        default:
          aVal = new Date(a.updatedAt || 0).getTime();
          bVal = new Date(b.updatedAt || 0).getTime();
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Paginate
    const total = sortedNotes.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotes = sortedNotes.slice(startIndex, endIndex);

    apiLogger.debug('Files listed successfully', {
      count: paginatedNotes.length,
      total,
      page,
      limit,
      userId,
      clientId,
    });

    // Add rate limit and pagination headers
    const response = NextResponse.json({
      notes: paginatedNotes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());
    response.headers.set('X-Total-Count', total.toString());
    response.headers.set('X-Page', page.toString());
    response.headers.set('X-Total-Pages', totalPages.toString());

    return response;
  } catch (error) {
    apiLogger.error('Failed to list files', { operation: 'list' }, error as Error);
    return createErrorResponse('Failed to read files', 500);
  }
}

/**
 * POST /api/files
 * Create a new markdown file
 * Requires authentication
 * Includes rate limiting, quota checking, path sanitization, and content validation
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const { userId } = auth;

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = fileCreationLimiter.check(clientId);

    if (!rateLimit.allowed) {
      apiLogger.warn('Rate limit exceeded for file creation', {
        clientId,
        userId,
        operation: 'create',
      });
      return createRateLimitResponse(rateLimit.resetTime);
    }

    // Check notes quota
    const notesQuota = await checkQuota(userId, 'notes');
    if (!notesQuota.allowed) {
      apiLogger.warn('Notes quota exceeded', { userId, quota: notesQuota });
      return NextResponse.json(
        { error: 'Quota Exceeded', message: notesQuota.message },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      // JSON parse error often means the body was truncated due to size limit
      apiLogger.warn('JSON parse error in file creation request', {
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return createErrorResponse(
        'Invalid request body. Content may be too large or malformed.',
        400
      );
    }

    // Validate request body
    const validation = await validateRequest(createFileRequestSchema, body);

    if (!validation.success) {
      apiLogger.warn('Invalid file creation request', { error: validation.error, clientId });
      return createErrorResponse(validation.error, 400);
    }

    const { filename, content } = validation.data;
    const folder = body.folder; // Optional, not in schema

    // Sanitize filename
    const filenameSanitization = sanitizeFilename(filename);
    if (!filenameSanitization.valid) {
      apiLogger.warn('Invalid filename attempted', {
        filename,
        errors: filenameSanitization.errors,
        clientId,
      });
      return createErrorResponse(
        `Invalid filename: ${filenameSanitization.errors.join(', ')}`,
        400
      );
    }

    // Sanitize folder path if provided
    if (folder) {
      const folderSanitization = sanitizeFolderPath(folder);
      if (!folderSanitization.valid) {
        apiLogger.warn('Invalid folder path attempted', {
          folder,
          errors: folderSanitization.errors,
          clientId,
        });
        return createErrorResponse(
          `Invalid folder path: ${folderSanitization.errors.join(', ')}`,
          400
        );
      }
    }

    // Validate content size (10MB max)
    const sizeValidation = validateContentSize(content);
    if (!sizeValidation.valid) {
      apiLogger.warn('File size limit exceeded', {
        size: sizeValidation.size,
        clientId,
      });
      return createErrorResponse(sizeValidation.error!, 413);
    }

    // Sanitize markdown content to prevent XSS
    const sanitizedContent = sanitizeMarkdownContent(content);

    // Check storage quota before creating file
    const contentSize = Buffer.byteLength(sanitizedContent, 'utf8');
    const currentStorage = await fileService.calculateStorageUsed(userId);
    const storageQuota = await checkQuota(userId, 'storage');

    if (currentStorage + contentSize > (storageQuota.limit || 0)) {
      apiLogger.warn('Storage quota would be exceeded', {
        userId,
        currentStorage,
        additionalBytes: contentSize,
        limit: storageQuota.limit,
      });
      return NextResponse.json(
        { error: 'Quota Exceeded', message: storageQuota.message },
        { status: 403 }
      );
    }

    // Create the file with sanitized data
    const result = await fileService.createFile(
      userId,
      filenameSanitization.sanitized,
      sanitizedContent,
      folder
    );

    apiLogger.info('File created successfully', {
      filename: filenameSanitization.sanitized,
      folder,
      size: sizeValidation.size,
      userId,
      clientId,
    });

    // Track usage and update storage
    await trackUsage(userId, 'note_created');
    const newStorage = await fileService.calculateStorageUsed(userId);
    await updateStorageUsage(userId, newStorage);

    // Sync with database
    try {
      const syncService = getSyncService();
      const noteId = folder
        ? `${folder}/${filenameSanitization.sanitized}`
        : filenameSanitization.sanitized;
      await syncService.indexNote(noteId, sanitizedContent);
      apiLogger.debug('Note synced to database', { noteId });
    } catch (dbError) {
      apiLogger.error('Database sync failed (non-fatal)', { noteId: filename }, dbError as Error);
      // Don't fail the request if DB sync fails - this needs improvement in future
    }

    // Add rate limit headers to response
    const response = NextResponse.json(result);
    response.headers.set('X-RateLimit-Limit', '20');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

    return response;
  } catch (error) {
    apiLogger.error('Failed to save file', { operation: 'create' }, error as Error);

    // Provide more helpful error messages
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }

    return createErrorResponse('Failed to save file', 500);
  }
}
