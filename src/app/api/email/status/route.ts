/**
 * GET /api/email/status
 * Check email service configuration status
 */

import { NextResponse } from 'next/server';
import { emailService } from '@/lib/services/emailService';

export async function GET() {
  const isConfigured = emailService.isEmailConfigured();

  if (!isConfigured) {
    return NextResponse.json({
      configured: false,
      message: 'Email service not configured. Set SMTP environment variables.',
      required: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'],
    });
  }

  // Try to verify connection
  const verified = await emailService.verifyConnection();

  return NextResponse.json({
    configured: true,
    verified,
    message: verified
      ? 'Email service is configured and connection verified'
      : 'Email service configured but connection verification failed',
  });
}
