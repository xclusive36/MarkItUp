import { NextRequest, NextResponse } from 'next/server';
import { fileService } from '@/lib/services/fileService';
import { validateRequest, createFileRequestSchema, createErrorResponse } from '@/lib/validations';

/**
 * GET /api/files
 * List all markdown files
 */
export async function GET() {
  try {
    const notes = await fileService.listFiles();
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error reading files:', error);
    return createErrorResponse('Failed to read files', 500);
  }
}

/**
 * POST /api/files
 * Create a new markdown file
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = await validateRequest(createFileRequestSchema, body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error, 400);
    }

    const { filename, content } = validation.data;
    const folder = body.folder; // Optional, not in schema

    // Create the file
    const result = await fileService.createFile(filename, content, folder);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving file:', error);
    return createErrorResponse('Failed to save file', 500);
  }
}
