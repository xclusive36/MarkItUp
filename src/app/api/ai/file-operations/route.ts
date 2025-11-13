import { NextRequest, NextResponse } from 'next/server';
import { FileOperation, FileOperationResult } from '@/lib/ai/types';
import { requireAuth } from '@/lib/auth/middleware';
import { fileService } from '@/lib/services/fileService';
import { apiLogger } from '@/lib/logger';
import { sanitizeFilename, sanitizeFolderPath } from '@/lib/security/pathSanitizer';
import path from 'path';

// Forbidden folder/file names that could contain sensitive data
const FORBIDDEN_NAMES = [
  'env', // prevent creating an env folder under markdown
  '.env',
  'config',
  'secret',
  'password',
  'key',
  'token',
  'credential',
  'node_modules',
  '.git',
  '.next',
];

/**
 * Execute approved file operations
 * POST /api/ai/file-operations
 */
export async function POST(request: NextRequest) {
  // Require authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Return 401 response
  }

  const { userId } = authResult;

  try {
    const { operations, approved } = await request.json();

    if (!approved) {
      apiLogger.warn('AI file operations not approved', { userId });
      return NextResponse.json(
        { success: false, message: 'Operations not approved', results: [] },
        { status: 400 }
      );
    }

    if (!operations || !Array.isArray(operations)) {
      apiLogger.warn('Invalid operations array in AI file operations', { userId });
      return NextResponse.json(
        { success: false, message: 'Invalid operations array', results: [] },
        { status: 400 }
      );
    }

    apiLogger.info('Processing AI file operations', {
      userId,
      operationCount: operations.length,
      operationTypes: operations.map((op: FileOperation) => op.type),
    });

    const results: FileOperationResult[] = [];

    for (const operation of operations as FileOperation[]) {
      try {
        const result = await executeOperation(operation, userId);
        results.push(result);
      } catch (error) {
        apiLogger.error(
          'AI file operation failed',
          {
            userId,
            operation: operation.type,
            path: operation.path,
          },
          error as Error
        );
        results.push({
          success: false,
          operation,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const allSucceeded = results.every(r => r.success);
    const successCount = results.filter(r => r.success).length;

    apiLogger.info('AI file operations completed', {
      userId,
      total: results.length,
      succeeded: successCount,
      failed: results.length - successCount,
    });

    return NextResponse.json({
      success: allSucceeded,
      results,
      message: allSucceeded
        ? 'All operations completed successfully'
        : 'Some operations failed. Check results for details.',
    });
  } catch (error) {
    apiLogger.error('File operations error', { userId }, error as Error);
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
 * Execute a single file operation using fileService for user-scoped access
 */
async function executeOperation(
  operation: FileOperation,
  userId: string
): Promise<FileOperationResult> {
  // Sanitize path to prevent directory traversal attacks
  const sanitizedPath = operation.path.replace(/\.\./g, '').replace(/^\/+/, '');

  // Check for forbidden folder/file names
  const pathParts = sanitizedPath.toLowerCase().split(path.sep);
  for (const part of pathParts) {
    // Disallow exact match or substring of forbidden terms
    if (FORBIDDEN_NAMES.some(forbidden => part === forbidden || part.includes(forbidden))) {
      return {
        success: false,
        operation,
        error: `Forbidden path component: "${part}". Cannot create files/folders with sensitive names.`,
      };
    }
  }

  // Validate the path components
  const pathValidation = validatePathComponents(sanitizedPath);
  if (!pathValidation.valid) {
    return {
      success: false,
      operation,
      error: pathValidation.error || 'Invalid path',
    };
  }

  switch (operation.type) {
    case 'create':
      return await createFile(operation, sanitizedPath, userId);

    case 'modify':
      return await modifyFile(operation, sanitizedPath, userId);

    case 'delete':
      return await deleteFile(operation, sanitizedPath, userId);

    case 'create-folder':
      return await createFolder(operation, sanitizedPath, userId);

    default:
      return {
        success: false,
        operation,
        error: `Unknown operation type: ${operation.type}`,
      };
  }
}

/**
 * Validate path components for security
 */
function validatePathComponents(sanitizedPath: string): { valid: boolean; error?: string } {
  const fileName = path.basename(sanitizedPath);
  const folderPath = path.dirname(sanitizedPath);

  // Validate filename if it's a file path
  if (fileName && fileName !== '.') {
    const filenameSanitization = sanitizeFilename(fileName);
    if (!filenameSanitization.valid) {
      return {
        valid: false,
        error: `Invalid filename: ${filenameSanitization.errors.join(', ')}`,
      };
    }
  }

  // Validate folder path if present
  if (folderPath && folderPath !== '.') {
    const folderSanitization = sanitizeFolderPath(folderPath);
    if (!folderSanitization.valid) {
      return {
        valid: false,
        error: `Invalid folder path: ${folderSanitization.errors.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Create a new file using fileService
 */
async function createFile(
  operation: FileOperation,
  sanitizedPath: string,
  userId: string
): Promise<FileOperationResult> {
  // Ensure filename ends with .md
  const fileName = path.basename(sanitizedPath);
  if (!fileName.endsWith('.md')) {
    return {
      success: false,
      operation,
      error: 'File must have .md extension',
    };
  }

  // Extract folder path (if any)
  const folderPath = path.dirname(sanitizedPath);
  const folder = folderPath && folderPath !== '.' ? folderPath : undefined;

  // Check if file already exists for this user
  const exists = await fileService.fileExists(userId, sanitizedPath);
  if (exists) {
    return {
      success: false,
      operation,
      error: 'File already exists. Use modify operation to update existing files.',
    };
  }

  try {
    // Create the file using fileService
    await fileService.createFile(userId, fileName, operation.content || '', folder);

    apiLogger.info('AI created file', {
      userId,
      path: sanitizedPath,
      folder,
    });

    return {
      success: true,
      operation,
      path: sanitizedPath,
    };
  } catch (error) {
    apiLogger.error(
      'AI file creation failed',
      {
        userId,
        path: sanitizedPath,
      },
      error as Error
    );
    return {
      success: false,
      operation,
      error: error instanceof Error ? error.message : 'Failed to create file',
    };
  }
}

/**
 * Modify an existing file using fileService
 * Note: Will create the file if it doesn't exist (upsert behavior)
 */
async function modifyFile(
  operation: FileOperation,
  sanitizedPath: string,
  userId: string
): Promise<FileOperationResult> {
  // Check if file exists for this user
  const exists = await fileService.fileExists(userId, sanitizedPath);

  try {
    if (!exists) {
      // File doesn't exist - create it instead
      const fileName = path.basename(sanitizedPath);

      // Ensure filename ends with .md
      if (!fileName.endsWith('.md')) {
        return {
          success: false,
          operation,
          error: 'File must have .md extension',
        };
      }

      // Extract folder path (if any)
      const folderPath = path.dirname(sanitizedPath);
      const folder = folderPath && folderPath !== '.' ? folderPath : undefined;

      // Create the file using fileService
      await fileService.createFile(userId, fileName, operation.content || '', folder);

      apiLogger.info('AI created file (via modify operation)', {
        userId,
        path: sanitizedPath,
        folder,
      });

      return {
        success: true,
        operation,
        path: sanitizedPath,
      };
    }

    // File exists - update it
    const result = await fileService.updateFile(
      userId,
      sanitizedPath,
      operation.content || '',
      true
    );

    if (!result.success) {
      return {
        success: false,
        operation,
        error: result.message,
      };
    }

    apiLogger.info('AI modified file', {
      userId,
      path: sanitizedPath,
    });

    return {
      success: true,
      operation,
      path: sanitizedPath,
    };
  } catch (error) {
    apiLogger.error(
      'AI file modification failed',
      {
        userId,
        path: sanitizedPath,
      },
      error as Error
    );
    return {
      success: false,
      operation,
      error: error instanceof Error ? error.message : 'Failed to modify file',
    };
  }
}

/**
 * Delete a file using fileService
 */
async function deleteFile(
  operation: FileOperation,
  sanitizedPath: string,
  userId: string
): Promise<FileOperationResult> {
  // Check if file exists for this user
  const exists = await fileService.fileExists(userId, sanitizedPath);
  if (!exists) {
    return {
      success: false,
      operation,
      error: 'File does not exist',
    };
  }

  try {
    // Delete the file using fileService
    const result = await fileService.deleteFile(userId, sanitizedPath);

    if (!result.success) {
      return {
        success: false,
        operation,
        error: result.message,
      };
    }

    apiLogger.info('AI deleted file', {
      userId,
      path: sanitizedPath,
    });

    return {
      success: true,
      operation,
      path: sanitizedPath,
    };
  } catch (error) {
    apiLogger.error(
      'AI file deletion failed',
      {
        userId,
        path: sanitizedPath,
      },
      error as Error
    );
    return {
      success: false,
      operation,
      error: error instanceof Error ? error.message : 'Failed to delete file',
    };
  }
}

/**
 * Create a new folder
 * Note: fileService doesn't have a specific createFolder method,
 * but folders are created automatically when creating files.
 * We'll handle this by ensuring the user directory structure exists.
 */
async function createFolder(
  operation: FileOperation,
  sanitizedPath: string,
  userId: string
): Promise<FileOperationResult> {
  try {
    // Ensure the user directory exists (this creates the folder structure)
    fileService.ensureUserDirExists(userId);

    // Check if the folder already has files
    const notes = await fileService.listFiles(userId);
    const folderHasFiles = notes.some(note => note.folder && note.folder.startsWith(sanitizedPath));

    if (folderHasFiles) {
      apiLogger.debug('AI folder already exists with content', {
        userId,
        path: sanitizedPath,
      });
      return {
        success: true,
        operation,
        path: sanitizedPath,
      };
    }

    // Create a placeholder file to ensure the folder exists
    await fileService.createFile(
      userId,
      '.gitkeep',
      '# This file keeps the folder structure',
      sanitizedPath
    );

    apiLogger.info('AI created folder', {
      userId,
      path: sanitizedPath,
    });

    return {
      success: true,
      operation,
      path: sanitizedPath,
    };
  } catch (error) {
    apiLogger.error(
      'AI folder creation failed',
      {
        userId,
        path: sanitizedPath,
      },
      error as Error
    );
    return {
      success: false,
      operation,
      error: error instanceof Error ? error.message : 'Failed to create folder',
    };
  }
}
