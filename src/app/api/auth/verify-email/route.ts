/**
 * POST /api/auth/verify-email
 * Verify user's email address with token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/auth/auth-service';
import { apiLogger } from '@/lib/logger';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = verifySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Token is required',
        },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    // Verify email
    const authService = getAuthService();
    await authService.verifyEmail(token);

    apiLogger.info('Email verified successfully');

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Email verification failed';

    if (errorMessage === 'Invalid or expired verification token') {
      return NextResponse.json(
        {
          error: 'Invalid Token',
          message: 'The verification token is invalid or has expired',
          code: 'INVALID_TOKEN',
        },
        { status: 400 }
      );
    }

    apiLogger.error('Email verification failed', { error: errorMessage });

    return NextResponse.json(
      {
        error: 'Verification Failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
