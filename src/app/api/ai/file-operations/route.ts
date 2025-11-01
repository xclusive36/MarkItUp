import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { FileOperation, FileOperationResult } from '@/lib/ai/types';

const MARKDOWN_DIR = path.join(process.cwd(), 'markdown');

// Ensure the markdown directory exists
if (!fs.existsSync(MARKDOWN_DIR)) {
  fs.mkdirSync(MARKDOWN_DIR, { recursive: true });
}

/**
 * Execute approved file operations
 * POST /api/ai/file-operations
 */
export async function POST(request: NextRequest) {
  try {
    const { operations, approved } = await request.json();

    if (!approved) {
      return NextResponse.json(
        { success: false, message: 'Operations not approved', results: [] },
        { status: 400 }
      );
    }

    if (!operations || !Array.isArray(operations)) {
      return NextResponse.json(
        { success: false, message: 'Invalid operations array', results: [] },
        { status: 400 }
      );
    }

    const results: FileOperationResult[] = [];

    for (const operation of operations as FileOperation[]) {
      try {
        const result = await executeOperation(operation);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          operation,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const allSucceeded = results.every(r => r.success);

    return NextResponse.json({
      success: allSucceeded,
      results,
      message: allSucceeded
        ? 'All operations completed successfully'
        : 'Some operations failed. Check results for details.',
    });
  } catch (error) {
    console.error('File operations error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Execute a single file operation
 */
async function executeOperation(operation: FileOperation): Promise<FileOperationResult> {
  // Sanitize path to prevent directory traversal attacks
  const sanitizedPath = operation.path.replace(/\.\./g, '').replace(/^\/+/, '');
  const fullPath = path.join(MARKDOWN_DIR, sanitizedPath);

  // Ensure the path is within the markdown directory
  if (!fullPath.startsWith(MARKDOWN_DIR)) {
    return {
      success: false,
      operation,
      error: 'Invalid path: operation must be within markdown directory',
    };
  }

  switch (operation.type) {
    case 'create':
      return await createFile(operation, fullPath, sanitizedPath);

    case 'modify':
      return await modifyFile(operation, fullPath, sanitizedPath);

    case 'delete':
      return await deleteFile(operation, fullPath, sanitizedPath);

    case 'create-folder':
      return await createFolder(operation, fullPath, sanitizedPath);

    default:
      return {
        success: false,
        operation,
        error: `Unknown operation type: ${operation.type}`,
      };
  }
}

/**
 * Create a new file
 */
async function createFile(
  operation: FileOperation,
  fullPath: string,
  sanitizedPath: string
): Promise<FileOperationResult> {
  // Check if file already exists
  if (fs.existsSync(fullPath)) {
    return {
      success: false,
      operation,
      error: 'File already exists. Use modify operation to update existing files.',
    };
  }

  // Ensure filename ends with .md
  const fileName = path.basename(fullPath);
  if (!fileName.endsWith('.md')) {
    return {
      success: false,
      operation,
      error: 'File must have .md extension',
    };
  }

  // Create parent directory if it doesn't exist
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the file
  fs.writeFileSync(fullPath, operation.content || '', 'utf-8');

  return {
    success: true,
    operation,
    path: sanitizedPath,
  };
}

/**
 * Modify an existing file
 */
async function modifyFile(
  operation: FileOperation,
  fullPath: string,
  sanitizedPath: string
): Promise<FileOperationResult> {
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return {
      success: false,
      operation,
      error: 'File does not exist. Use create operation for new files.',
    };
  }

  // Write the updated content
  fs.writeFileSync(fullPath, operation.content || '', 'utf-8');

  return {
    success: true,
    operation,
    path: sanitizedPath,
  };
}

/**
 * Delete a file
 */
async function deleteFile(
  operation: FileOperation,
  fullPath: string,
  sanitizedPath: string
): Promise<FileOperationResult> {
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return {
      success: false,
      operation,
      error: 'File does not exist',
    };
  }

  // Ensure it's a file, not a directory
  const stats = fs.statSync(fullPath);
  if (!stats.isFile()) {
    return {
      success: false,
      operation,
      error: 'Path is not a file',
    };
  }

  // Delete the file
  fs.unlinkSync(fullPath);

  return {
    success: true,
    operation,
    path: sanitizedPath,
  };
}

/**
 * Create a new folder
 */
async function createFolder(
  operation: FileOperation,
  fullPath: string,
  sanitizedPath: string
): Promise<FileOperationResult> {
  // Check if folder already exists
  if (fs.existsSync(fullPath)) {
    return {
      success: false,
      operation,
      error: 'Folder already exists',
    };
  }

  // Create the folder
  fs.mkdirSync(fullPath, { recursive: true });

  return {
    success: true,
    operation,
    path: sanitizedPath,
  };
}
