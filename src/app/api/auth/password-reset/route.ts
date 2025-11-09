/**
 * POST /api/auth/password-reset
 * Request a password reset email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/auth/auth-service';
import { apiLogger } from '@/lib/logger';
import { z } from 'zod';

const resetRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = resetRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Request password reset
    const authService = getAuthService();
    await authService.requestPasswordReset(email);

    apiLogger.info('Password reset requested', { email });

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    apiLogger.error('Password reset request failed', {}, error as Error);

    // Still return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  }
}
