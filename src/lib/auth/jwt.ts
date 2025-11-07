/**
 * JWT Token Management
 * Handles creation and verification of JSON Web Tokens for session management
 */

import jwt from 'jsonwebtoken';

// Validate JWT_SECRET is set in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error(
    'CRITICAL SECURITY ERROR: JWT_SECRET must be set in production. ' +
      'Generate one with: openssl rand -base64 32'
  );
}

// Use environment variable or fallback for development only
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production-min-32-chars';
const JWT_EXPIRY = '30d'; // 30 days

// Warn if using default secret in development
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'test') {
  console.warn(
    '⚠️  WARNING: Using default JWT_SECRET. This is only safe for development. ' +
      'Set JWT_SECRET in .env for production.'
  );
}

export interface TokenPayload {
  userId: string;
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: { userId: string; email?: string }): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Decode token without verification (useful for debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
}
