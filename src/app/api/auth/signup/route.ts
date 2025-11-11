/**
 * POST /api/auth/signup
 * Register a new user and create their markdown folder
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/auth/auth-service';
import { fileService } from '@/lib/services/fileService';
import { apiLogger } from '@/lib/logger';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid input data',
          errors,
        },
        { status: 400 }
      );
    }
    const { email, password, name } = validation.data;
    const authService = getAuthService();
    // Register user
    const regResult = await authService.register({ email, password, name });
    apiLogger.info('User signup successful', {
      userId: regResult.userId,
      email: regResult.email,
    });
    // Ensure user markdown folder is created
    fileService.ensureUserDirExists(regResult.userId);
    // Create session for new user
    const sessionToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    // Insert session into DB
    const db = require('@/lib/db').getDatabase();
    await db.insert(require('@/lib/db/schema').sessions).values({
      userId: regResult.userId,
      token: sessionToken,
      expiresAt,
      ipAddress: null,
      userAgent: null,
    });
    // Get user info for response
    const userResult = await db
      .select()
      .from(require('@/lib/db/schema').users)
      .where(require('drizzle-orm').eq(require('@/lib/db/schema').users.id, regResult.userId))
      .limit(1);
    const user = userResult[0];
    // Create response with session token
    const response = NextResponse.json({
      success: true,
      message: 'Signup successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        plan: user.plan,
        emailVerified: user.isEmailVerified || false,
      },
      sessionToken,
      expiresAt: expiresAt.toISOString(),
    });
    // Set session cookie
    const useSecureCookies =
      process.env.NODE_ENV === 'production' && process.env.ENFORCE_HTTPS === 'true';
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: useSecureCookies,
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });
    apiLogger.info('Session cookie set after signup', {
      userId: user.id,
      tokenLength: sessionToken.length,
      expiresAt: expiresAt.toISOString(),
      secure: useSecureCookies,
    });
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Signup failed';
    apiLogger.error('Signup failed', { error: errorMessage });
    return NextResponse.json(
      {
        error: 'Signup Failed',
        message: 'An error occurred during signup',
      },
      { status: 500 }
    );
  }
}
