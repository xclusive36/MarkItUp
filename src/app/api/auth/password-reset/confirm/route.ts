/**
 * POST /api/auth/password-reset/confirm
 * Reset password with token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/auth/auth-service';
import { apiLogger } from '@/lib/logger';
import { z } from 'zod';

const resetConfirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = resetConfirmSchema.safeParse(body);
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

    const { token, password } = validation.data;

    // Reset password
    const authService = getAuthService();
    await authService.resetPassword(token, password);

    apiLogger.info('Password reset successful');

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Password reset failed';

    if (errorMessage === 'Invalid or expired reset token') {
      return NextResponse.json(
        {
          error: 'Invalid Token',
          message: 'The reset token is invalid or has expired',
          code: 'INVALID_TOKEN',
        },
        { status: 400 }
      );
    }

    apiLogger.error('Password reset failed', { error: errorMessage });

    return NextResponse.json(
      {
        error: 'Reset Failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
