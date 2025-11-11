/**
 * POST /api/auth/login
 * Authenticate user and create session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/auth/auth-service';
import { apiLogger } from '@/lib/logger';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
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

    const { email, password } = validation.data;

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    // Login
    const authService = getAuthService();
    const result = await authService.login({
      email,
      password,
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined,
    });

    apiLogger.info('User login successful', {
      userId: result.user.id,
      email: result.user.email,
    });

    // Create response with session token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      sessionToken: result.sessionToken,
      expiresAt: result.expiresAt.toISOString(),
    });

    // Set session cookie (httpOnly for security)
    // Use secure cookies only if HTTPS is enforced (not all self-hosted setups have SSL)
    const useSecureCookies =
      process.env.NODE_ENV === 'production' && process.env.ENFORCE_HTTPS === 'true';

    response.cookies.set('session-token', result.sessionToken, {
      httpOnly: true,
      secure: useSecureCookies,
      sameSite: 'lax',
      expires: result.expiresAt,
      path: '/',
      // Don't set domain to allow cookies to work on any hostname (localhost, IP, domain)
    });

    apiLogger.info('Session cookie set', {
      userId: result.user.id,
      tokenLength: result.sessionToken.length,
      expiresAt: result.expiresAt.toISOString(),
      secure: useSecureCookies,
    });

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';

    // Don't reveal whether account exists for security
    if (errorMessage === 'Invalid credentials' || errorMessage === 'Account is disabled') {
      return NextResponse.json(
        {
          error: 'Authentication Failed',
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    apiLogger.error('Login failed', { error: errorMessage });

    return NextResponse.json(
      {
        error: 'Login Failed',
        message: 'An error occurred during login',
      },
      { status: 500 }
    );
  }
}
