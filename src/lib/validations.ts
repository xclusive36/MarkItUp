import { z } from 'zod';

/**
 * Validation schemas for MarkItUp file operations
 */

// Filename validation
export const fileNameSchema = z
  .string()
  .min(1, 'Filename cannot be empty')
  .max(255, 'Filename too long')
  .regex(
    /^[a-zA-Z0-9-_. ]+(?:\.md)?$/,
    'Invalid filename format. Must contain only letters, numbers, spaces, hyphens, underscores, and periods. Extension .md is optional.'
  )
  .refine(filename => !filename.startsWith('.'), 'Filename cannot start with a period')
  .refine(filename => !filename.includes('..'), 'Filename cannot contain consecutive periods');

// Markdown content validation
export const markdownContentSchema = z.string().max(10000000, 'Content too large (max 10MB)'); // 10MB limit

// File list request validation
export const fileListRequestSchema = z.object({
  // Future: add pagination, sorting, filtering options
});

// Create file request validation
export const createFileRequestSchema = z.object({
  filename: fileNameSchema,
  content: markdownContentSchema.optional().default(''),
});

// Update file request validation
export const updateFileRequestSchema = z.object({
  content: markdownContentSchema,
});

// Delete file request validation (filename from URL params)
export const deleteFileParamsSchema = z.object({
  filename: fileNameSchema,
});

// Read file request validation (filename from URL params)
export const readFileParamsSchema = z.object({
  filename: fileNameSchema,
});

/**
 * Helper function to create standardized error responses
 */
export function createErrorResponse(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

/**
 * Helper function to validate and parse request data
 */
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError.message,
      };
    }
    return {
      success: false,
      error: 'Invalid request data',
    };
  }
}
