/**
 * Path sanitization and validation utilities
 * Prevents directory traversal attacks and ensures safe file operations
 */

import path from 'path';

const ALLOWED_EXTENSIONS = ['.md', '.markdown'];
const MAX_FILENAME_LENGTH = 255;
const MAX_PATH_DEPTH = 10;

// Dangerous patterns that should never appear in file paths
const DANGEROUS_PATTERNS = [
  /\.\./g, // Parent directory
  /[<>:"|?*]/g, // Invalid filename characters
  /^[./]/g, // Starts with dot or slash
  /\/\//g, // Double slashes
  /\\/g, // Backslashes
  /\0/g, // Null bytes
  /%00/g, // URL encoded null bytes
];

export interface SanitizationResult {
  valid: boolean;
  sanitized: string;
  errors: string[];
}

/**
 * Sanitize and validate a filename
 */
export function sanitizeFilename(filename: string): SanitizationResult {
  const errors: string[] = [];
  let sanitized = filename.trim();

  // Check for empty filename
  if (!sanitized) {
    errors.push('Filename cannot be empty');
    return { valid: false, sanitized: '', errors };
  }

  // Check length
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    errors.push(`Filename too long (max ${MAX_FILENAME_LENGTH} characters)`);
    return { valid: false, sanitized, errors };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      errors.push(`Filename contains invalid characters or patterns`);
      return { valid: false, sanitized, errors };
    }
  }

  // Normalize path
  sanitized = path.normalize(sanitized);

  // Check if normalized path is absolute or contains parent directory references
  if (path.isAbsolute(sanitized) || sanitized.includes('..')) {
    errors.push('Path traversal attempt detected');
    return { valid: false, sanitized, errors };
  }

  // Check path depth
  const depth = sanitized.split(path.sep).length;
  if (depth > MAX_PATH_DEPTH) {
    errors.push(`Path too deep (max ${MAX_PATH_DEPTH} levels)`);
    return { valid: false, sanitized, errors };
  }

  // Check file extension
  const ext = path.extname(sanitized).toLowerCase();
  if (ext && !ALLOWED_EXTENSIONS.includes(ext)) {
    errors.push(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
    return { valid: false, sanitized, errors };
  }

  // If no extension, add .md
  if (!ext) {
    sanitized = sanitized + '.md';
  }

  return { valid: true, sanitized, errors: [] };
}

/**
 * Sanitize a folder path
 */
export function sanitizeFolderPath(folderPath: string | undefined): SanitizationResult {
  if (!folderPath) {
    return { valid: true, sanitized: '', errors: [] };
  }

  const errors: string[] = [];
  let sanitized = folderPath.trim();

  // Remove leading/trailing slashes
  sanitized = sanitized.replace(/^\/+|\/+$/g, '');

  if (!sanitized) {
    return { valid: true, sanitized: '', errors: [] };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      errors.push(`Folder path contains invalid characters or patterns`);
      return { valid: false, sanitized, errors };
    }
  }

  // Normalize path
  sanitized = path.normalize(sanitized);

  // Check if normalized path is absolute or contains parent directory references
  if (path.isAbsolute(sanitized) || sanitized.includes('..')) {
    errors.push('Path traversal attempt detected in folder path');
    return { valid: false, sanitized, errors };
  }

  // Check path depth
  const depth = sanitized.split(path.sep).length;
  if (depth > MAX_PATH_DEPTH) {
    errors.push(`Folder path too deep (max ${MAX_PATH_DEPTH} levels)`);
    return { valid: false, sanitized, errors };
  }

  return { valid: true, sanitized, errors: [] };
}

/**
 * Validate content size
 */
export function validateContentSize(
  content: string,
  maxSize: number = 10 * 1024 * 1024
): { valid: boolean; error?: string; size: number } {
  const size = Buffer.byteLength(content, 'utf8');

  if (size > maxSize) {
    return {
      valid: false,
      error: `Content too large (${formatBytes(size)}). Maximum size: ${formatBytes(maxSize)}`,
      size,
    };
  }

  return { valid: true, size };
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Sanitize markdown content to prevent XSS
 * Basic sanitization - for production, consider using a library like DOMPurify
 */
export function sanitizeMarkdownContent(content: string): string {
  // Remove any script tags
  let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove dangerous HTML attributes
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  return sanitized;
}
