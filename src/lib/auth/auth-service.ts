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
import { emailService } from '@/lib/services/emailService';
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
    const existingUsers = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUsers.length > 0) {
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

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(email, verificationToken);

    if (emailSent) {
      dbLogger.info('Verification email sent', { email });
    } else {
      dbLogger.warn('Verification email not sent (SMTP not configured)', {
        email,
        token: verificationToken,
      });
    }

    return { userId: newUser.id, email: newUser.email };
  }

  /**
   * Login with email/password
   */
  async login(params: LoginParams): Promise<LoginResult> {
    const { email, password, ipAddress, userAgent } = params;

    // Find user
    const userResult = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    const user = userResult[0];

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
  async verifySession(token: string): Promise<{
    userId: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      isActive: boolean;
      isEmailVerified: boolean;
      plan: string;
    };
  } | null> {
    // Query session
    const sessionResult = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (!sessionResult || sessionResult.length === 0) {
      return null;
    }

    const session = sessionResult[0]!;

    // Query user separately
    const userResult = await this.db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!userResult || userResult.length === 0) {
      return null;
    }

    const user = userResult[0]!;

    return {
      userId: session.userId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        plan: user.plan,
      },
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
    const verificationResult = await this.db
      .select()
      .from(verificationTokens)
      .where(and(eq(verificationTokens.token, token), gt(verificationTokens.expiresAt, new Date())))
      .limit(1);

    const verification = verificationResult[0];

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

    // Get user details for welcome email
    const verifiedUserResult = await this.db
      .select()
      .from(users)
      .where(eq(users.email, verification.email))
      .limit(1);

    const verifiedUser = verifiedUserResult[0];

    // Send welcome email
    if (verifiedUser) {
      await emailService.sendWelcomeEmail(verification.email, verifiedUser.name || undefined);
    }

    return true;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    const userResult = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    const user = userResult[0];

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

    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);

    if (emailSent) {
      dbLogger.info('Password reset email sent', { email });
    } else {
      dbLogger.warn('Password reset email not sent (SMTP not configured)', {
        email,
        token: resetToken,
      });
    }

    return { success: true };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Find valid reset token
    const resetTokenResult = await this.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date()),
          eq(passwordResetTokens.used, false)
        )
      )
      .limit(1);

    const resetToken = resetTokenResult[0];

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

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
    const userResult = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);

    const user = userResult[0];

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
