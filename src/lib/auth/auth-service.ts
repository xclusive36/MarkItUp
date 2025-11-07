/**
 * Authentication Service
 * Handles user registration, login, session management, and password operations
 */

import { getDatabase } from '@/lib/db';
import { users, sessions, verificationTokens, passwordResetTokens } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { generateToken } from './jwt';
import { hashPassword, comparePassword, generateSecureToken } from './encryption';
import { dbLogger } from '@/lib/logger';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '@/lib/db/schema';

export interface RegisterParams {
  email: string;
  password: string;
  name?: string;
}

export interface LoginParams {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    plan: string;
    emailVerified: boolean;
  };
  sessionToken: string;
  expiresAt: Date;
}

export class AuthService {
  private db: BetterSQLite3Database<typeof schema>;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Register new user with email/password
   */
  async register(params: RegisterParams): Promise<{ userId: string; email: string }> {
    const { email, password, name } = params;

    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Check password strength
    if (!this.isStrongPassword(password)) {
      throw new Error(
        'Password must be at least 8 characters with uppercase, lowercase, and number'
      );
    }

    // Check if user already exists
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [newUser] = await this.db
      .insert(users)
      .values({
        email,
        passwordHash,
        name: name || null,
        isActive: true,
        isEmailVerified: false,
      })
      .returning();

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    dbLogger.info('User registered', { userId: newUser.id, email: newUser.email });

    // Create verification token
    const verificationToken = generateSecureToken();
    await this.db.insert(verificationTokens).values({
      email,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // TODO: Send verification email
    dbLogger.info('Verification token created', { email, token: verificationToken });

    return { userId: newUser.id, email: newUser.email };
  }

  /**
   * Login with email/password
   */
  async login(params: LoginParams): Promise<LoginResult> {
    const { email, password, ipAddress, userAgent } = params;

    // Find user
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('Account is disabled');
    }

    // Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Create session
    const sessionToken = generateToken({ userId: user.id, email: user.email });
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.db.insert(sessions).values({
      userId: user.id,
      token: sessionToken,
      expiresAt,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });

    // Update last login
    await this.db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    dbLogger.info('User logged in', { userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        plan: user.plan,
        emailVerified: user.isEmailVerified || false,
      },
      sessionToken,
      expiresAt,
    };
  }

  /**
   * Verify session token and return user info
   */
  async verifySession(token: string) {
    const session = await this.db.query.sessions.findFirst({
      where: and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())),
      with: {
        user: true,
      },
    });

    if (!session) {
      return null;
    }

    return {
      userId: session.userId,
      user: session.user,
    };
  }

  /**
   * Logout - invalidate session
   */
  async logout(token: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.token, token));
    dbLogger.info('User logged out', { token: token.substring(0, 10) + '...' });
  }

  /**
   * Verify email address with token
   */
  async verifyEmail(token: string): Promise<boolean> {
    const verification = await this.db.query.verificationTokens.findFirst({
      where: and(eq(verificationTokens.token, token), gt(verificationTokens.expiresAt, new Date())),
    });

    if (!verification) {
      throw new Error('Invalid or expired verification token');
    }

    // Update user
    await this.db
      .update(users)
      .set({ isEmailVerified: true, emailVerified: new Date() })
      .where(eq(users.email, verification.email));

    // Delete used token
    await this.db.delete(verificationTokens).where(eq(verificationTokens.id, verification.id));

    dbLogger.info('Email verified', { email: verification.email });

    return true;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // Don't reveal if user exists (security)
      return { success: true };
    }

    // Create reset token
    const resetToken = generateSecureToken();
    await this.db.insert(passwordResetTokens).values({
      userId: user.id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      used: false,
    });

    // TODO: Send reset email
    dbLogger.info('Password reset requested', { email, token: resetToken });

    return { success: true };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Find valid reset token
    const resetToken = await this.db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date()),
        eq(passwordResetTokens.used, false)
      ),
    });

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Validate new password
    if (!this.isStrongPassword(newPassword)) {
      throw new Error(
        'Password must be at least 8 characters with uppercase, lowercase, and number'
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await this.db.update(users).set({ passwordHash }).where(eq(users.id, resetToken.userId));

    // Mark token as used
    await this.db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id));

    // Invalidate all sessions for this user
    await this.db.delete(sessions).where(eq(sessions.userId, resetToken.userId));

    dbLogger.info('Password reset completed', { userId: resetToken.userId });

    return true;
  }

  /**
   * Change password for logged-in user
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    // Get user
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.passwordHash) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (!this.isStrongPassword(newPassword)) {
      throw new Error(
        'Password must be at least 8 characters with uppercase, lowercase, and number'
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await this.db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Invalidate all other sessions (keep current session)
    // This would require knowing the current session token
    dbLogger.info('Password changed', { userId });

    return true;
  }

  // Helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isStrongPassword(password: string): boolean {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }
}

// Singleton instance
let authService: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authService) {
    authService = new AuthService();
  }
  return authService;
}
