/**
 * Path sanitization and validation utilities
 * Prevents directory traversal attacks and ensures safe file operations
 */

import path from 'path';
import DOMPurify from 'isomorphic-dompurify';

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

  // Check for path traversal and absolute paths BEFORE any sanitization
  if (sanitized.includes('..') || sanitized.startsWith('/') || path.isAbsolute(sanitized)) {
    errors.push('Invalid folder path');
    return { valid: false, sanitized, errors };
  }

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

  // Check if normalized path is absolute
  if (path.isAbsolute(sanitized)) {
    errors.push('Absolute paths are not allowed');
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
  maxSize: number = 15 * 1024 * 1024 // 15MB to match Next.js config
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
 * Uses DOMPurify for robust sanitization
 */
export function sanitizeMarkdownContent(content: string): string {
  // First, remove dangerous URL schemes from markdown links before HTML conversion
  // Match markdown link syntax: [text](url) or [text](url "title")
  let sanitized = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const urlPart = url.trim().split(/\s+/)[0]; // Get URL without title
    const title = url.substring(urlPart.length).trim(); // Get title if present

    // Remove dangerous protocols
    if (/^(javascript|data|vbscript|file|about):/i.test(urlPart)) {
      // Replace with safe placeholder or just remove the link
      return title ? `[${text}](#)` : `[${text}](#)`;
    }

    return match; // Keep safe links unchanged
  });

  // Configure DOMPurify for markdown content
  const config = {
    // Allow markdown-friendly tags
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'a',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'em',
      'strong',
      'del',
      'ins',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'img',
      'br',
      'hr',
      'div',
      'span',
      'input', // For task lists
    ],
    ALLOWED_ATTR: [
      'href',
      'title',
      'alt',
      'src',
      'class',
      'id',
      'type',
      'checked',
      'disabled', // For task lists
    ],
    // Keep relative URLs
    ALLOW_DATA_ATTR: false,
    // Prevent javascript: and data: URLs
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };

  // Sanitize the content
  sanitized = DOMPurify.sanitize(sanitized, config);

  return sanitized;
}
