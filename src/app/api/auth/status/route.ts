/**
 * GET /api/auth/status
 * Returns authentication status and configuration info
 * Public endpoint - no auth required
 */
import { NextResponse } from 'next/server';

export async function GET() {
  const authDisabled = process.env.DISABLE_AUTH === 'true';
  const isProduction = process.env.NODE_ENV === 'production';

  return NextResponse.json({
    authEnabled: !authDisabled,
    authDisabled,
    isProduction,
    securityWarning: authDisabled
      ? 'Authentication is disabled. All users share the same data without isolation.'
      : null,
  });
}
