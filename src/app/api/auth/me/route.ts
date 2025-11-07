/**
 * GET /api/auth/me
 * Get current authenticated user information
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;

  return NextResponse.json({
    success: true,
    user,
  });
}
