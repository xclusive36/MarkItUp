/**
 * Encryption Utilities
 * Secure encryption/decryption for sensitive data like API keys
 */

import crypto from 'crypto';

// Encryption key from environment (must be 32 bytes)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-change-in-prod-32bytes';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Ensure key is exactly 32 bytes
 */
function getKey(): Buffer {
  const key = ENCRYPTION_KEY;
  // Pad or truncate to 32 bytes
  return Buffer.from(key.padEnd(32, '0').slice(0, 32));
}

/**
 * Encrypt sensitive text (e.g., API keys)
 * Returns format: iv:encryptedData
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return IV and encrypted data separated by colon
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt encrypted text
 * Input format: iv:encryptedData
 */
export function decrypt(encrypted: string): string {
  const key = getKey();
  const parts = encrypted.split(':');

  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format');
  }

  const ivHex = parts[0];
  const encryptedText = parts[1];

  if (!ivHex || !encryptedText) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate a secure random token (for verification, reset tokens)
 */
export function generateSecureToken(): string {
  return crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
}

/**
 * Hash a password using bcrypt
 * (This is exported separately for password operations)
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 12);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}
