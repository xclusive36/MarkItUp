/**
 * POST /api/auth/register
 * Register a new user account
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/auth/auth-service';
import { apiLogger } from '@/lib/logger';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
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

    // Register user
    const authService = getAuthService();
    const result = await authService.register({ email, password, name });

    apiLogger.info('User registration successful', {
      userId: result.userId,
      email: result.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        userId: result.userId,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';

    if (errorMessage === 'User already exists') {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'An account with this email already exists',
          code: 'USER_EXISTS',
        },
        { status: 409 }
      );
    }

    apiLogger.error('Registration failed', { error: errorMessage });

    return NextResponse.json(
      {
        error: 'Registration Failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
