/**
 * Secure Error Handling
 * Prevents leaking sensitive system information in production
 */

/**
 * Sanitize error messages for production
 * Removes stack traces, file paths, and other sensitive details
 */
export function sanitizeError(error: Error | unknown, context?: string): string {
  const isProduction = process.env.NODE_ENV === 'production';

  // In development, show full details
  if (!isProduction) {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  // In production, return generic messages to avoid leaking system details
  if (error instanceof Error) {
    // Map common errors to safe messages
    const errorType = error.constructor.name;

    switch (errorType) {
      case 'SyntaxError':
        return 'Invalid data format';
      case 'TypeError':
        return 'Invalid operation';
      case 'RangeError':
        return 'Value out of range';
      case 'ReferenceError':
        return 'Resource not found';
      default:
        return context ? `Operation failed: ${context}` : 'An error occurred';
    }
  }

  return context ? `Operation failed: ${context}` : 'An error occurred';
}

/**
 * Get safe error details for logging (not shown to user)
 * This can be logged server-side but should never be sent to client in production
 */
export function getErrorDetails(error: Error | unknown): {
  message: string;
  stack?: string;
  name?: string;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }

  return {
    message: String(error),
  };
}

/**
 * Create a safe error response for API routes
 */
export function createSafeErrorResponse(
  error: Error | unknown,
  context?: string,
  statusCode: number = 500
): { message: string; statusCode: number } {
  return {
    message: sanitizeError(error, context),
    statusCode,
  };
}
