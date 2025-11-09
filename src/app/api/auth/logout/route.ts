/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/auth/auth-service';
import { getSessionToken } from '@/lib/auth/middleware';
import { apiLogger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const token = getSessionToken(request);

    if (!token) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'No session token provided',
        },
        { status: 400 }
      );
    }

    // Logout (invalidate session)
    const authService = getAuthService();
    await authService.logout(token);

    apiLogger.info('User logged out');

    // Create response and clear cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

    response.cookies.delete('session-token');

    return response;
  } catch (error) {
    apiLogger.error('Logout failed', {}, error as Error);

    return NextResponse.json(
      {
        error: 'Logout Failed',
        message: 'An error occurred during logout',
      },
      { status: 500 }
    );
  }
}
