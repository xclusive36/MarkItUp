/**
 * POST /api/email/test
 * Send a test email (development/admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/services/emailService';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

const testEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  type: z.enum(['verification', 'password-reset', 'welcome']).optional().default('verification'),
});

export async function POST(request: NextRequest) {
  // Require authentication
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  // Only allow in development or for admin users
  if (process.env.NODE_ENV === 'production' && auth.user.plan !== 'enterprise') {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'Test emails can only be sent in development or by admin users',
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const validation = testEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: validation.error.issues[0]?.message || 'Invalid request',
        },
        { status: 400 }
      );
    }

    const { email, type } = validation.data;

    // Check if email service is configured
    if (!emailService.isEmailConfigured()) {
      return NextResponse.json(
        {
          error: 'Not Configured',
          message: 'Email service not configured. Set SMTP environment variables.',
          required: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'],
        },
        { status: 503 }
      );
    }

    // Send test email based on type
    let sent = false;
    const testToken = 'test-token-' + Math.random().toString(36).substring(7);

    switch (type) {
      case 'verification':
        sent = await emailService.sendVerificationEmail(email, testToken);
        break;
      case 'password-reset':
        sent = await emailService.sendPasswordResetEmail(email, testToken);
        break;
      case 'welcome':
        sent = await emailService.sendWelcomeEmail(email, 'Test User');
        break;
    }

    if (sent) {
      return NextResponse.json({
        success: true,
        message: `Test ${type} email sent to ${email}`,
      });
    } else {
      return NextResponse.json(
        {
          error: 'Email Failed',
          message: 'Failed to send test email. Check server logs for details.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Server Error',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
