import { NextRequest, NextResponse } from 'next/server';
import { fileService } from '@/lib/services/fileService';
import { validateRequest, updateFileRequestSchema, createErrorResponse } from '@/lib/validations';
import { getSyncService } from '@/lib/db/sync';

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
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;

  if (isReserved(resolvedParams.filename)) {
    return createErrorResponse('Not found', 404);
  }

  try {
    const { filename } = resolvedParams;

    const note = await fileService.readFile(filename);

    if (!note) {
      return createErrorResponse('File not found', 404);
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error reading file:', error);
    return createErrorResponse('Failed to read file', 500);
  }
}

/**
 * PUT /api/files/[filename]
 * Update or create a file
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;

  if (isReserved(resolvedParams.filename)) {
    return createErrorResponse('Not found', 404);
  }

  try {
    const { filename } = resolvedParams;
    const body = await request.json();

    // Validate request body
    const validation = await validateRequest(updateFileRequestSchema, { content: body.content });

    if (!validation.success) {
      return createErrorResponse(validation.error, 400);
    }

    const { content } = validation.data;
    const { overwrite } = body;

    console.log('[API PUT] Updating file:', filename);
    console.log('[API PUT] Content length:', content.length);

    const result = await fileService.updateFile(filename, content, overwrite);

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
      await syncService.indexNote(filename, content);
      console.log('[API] Note synced to database:', filename);
    } catch (dbError) {
      console.error('[API] Database sync failed (non-fatal):', dbError);
      // Don't fail the request if DB sync fails
    }

    return NextResponse.json({ message: result.message });
  } catch (error) {
    console.error('Error writing file:', error);
    return createErrorResponse('Failed to write file', 500);
  }
}

/**
 * DELETE /api/files/[filename]
 * Delete a file
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;

  if (isReserved(resolvedParams.filename)) {
    return createErrorResponse('Not found', 404);
  }

  try {
    const { filename } = resolvedParams;

    const result = await fileService.deleteFile(filename);

    if (!result.success) {
      const status = result.message === 'File not found' ? 404 : 400;
      return createErrorResponse(result.message, status);
    }

    // Sync with database (delete note)
    try {
      const syncService = getSyncService();
      await syncService.deleteNote(filename);
      console.log('[API] Note deleted from database:', filename);
    } catch (dbError) {
      console.error('[API] Database delete sync failed (non-fatal):', dbError);
      // Don't fail the request if DB sync fails
    }

    return NextResponse.json({ message: result.message });
  } catch (error) {
    console.error('Error deleting file:', error);
    return createErrorResponse('Failed to delete file', 500);
  }
}
