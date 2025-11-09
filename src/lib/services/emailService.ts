/**
 * Email Service
 * Handles sending emails using nodemailer with SMTP configuration
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { apiLogger } from '@/lib/logger';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private fromEmail: string;
  private isConfigured: boolean = false;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@markitup.app';
    this.initialize();
  }

  /**
   * Initialize email transporter with SMTP config
   */
  private initialize(): void {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // Check if SMTP is configured
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      apiLogger.warn(
        'Email service not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD in environment variables.'
      );
      this.isConfigured = false;
      return;
    }

    try {
      const config: EmailConfig = {
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: parseInt(smtpPort, 10) === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      };

      this.transporter = nodemailer.createTransport(config);
      this.isConfigured = true;

      apiLogger.info('Email service initialized', {
        host: smtpHost,
        port: smtpPort,
        from: this.fromEmail,
      });
    } catch (error) {
      apiLogger.error('Failed to initialize email service', {}, error as Error);
      this.isConfigured = false;
    }
  }

  /**
   * Send an email
   */
  private async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      apiLogger.warn('Email not sent - service not configured', {
        to: options.to,
        subject: options.subject,
      });
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      apiLogger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      });

      return true;
    } catch (error) {
      apiLogger.error(
        'Failed to send email',
        {
          to: options.to,
          subject: options.subject,
        },
        error as Error
      );
      return false;
    }
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/auth/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .code { background: #e5e7eb; padding: 3px 8px; border-radius: 3px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 Welcome to MarkItUp</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thanks for signing up! Please verify your email address to get started with MarkItUp.</p>
              
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all;"><code>${verificationUrl}</code></p>
              
              <p style="margin-top: 30px; color: #6b7280;">
                <strong>This link expires in 24 hours.</strong><br>
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>MarkItUp - Your Personal Markdown Notes</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Welcome to MarkItUp!

Please verify your email address by clicking the link below:
${verificationUrl}

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

---
MarkItUp - Your Personal Markdown Notes
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify your MarkItUp account',
      html,
      text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password for your MarkItUp account.</p>
              
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all;"><code>${resetUrl}</code></p>
              
              <div class="warning">
                <strong>⚠️ Security Notice</strong><br>
                This link expires in 1 hour for security reasons.<br>
                If you didn't request a password reset, please ignore this email.
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                For security reasons, we recommend using a strong, unique password for your MarkItUp account.
              </p>
            </div>
            <div class="footer">
              <p>MarkItUp - Your Personal Markdown Notes</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Password Reset Request

We received a request to reset your password for your MarkItUp account.

Reset your password by clicking the link below:
${resetUrl}

This link expires in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email.

---
MarkItUp - Your Personal Markdown Notes
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset your MarkItUp password',
      html,
      text,
    });
  }

  /**
   * Send welcome email (after email verification)
   */
  async sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const displayName = name || email;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to MarkItUp!</h1>
            </div>
            <div class="content">
              <h2>Hi ${displayName},</h2>
              <p>Your email has been verified! You're all set to start using MarkItUp.</p>
              
              <h3>What you can do with MarkItUp:</h3>
              
              <div class="feature">
                <strong>📝 Write in Markdown</strong><br>
                Create beautiful notes with full markdown support
              </div>
              
              <div class="feature">
                <strong>🔗 Link Your Ideas</strong><br>
                Connect notes with bidirectional links
              </div>
              
              <div class="feature">
                <strong>🤖 AI Assistance</strong><br>
                Get help with writing, analysis, and more
              </div>
              
              <div class="feature">
                <strong>🔒 Private & Secure</strong><br>
                Your data stays on your server
              </div>
              
              <p style="text-align: center;">
                <a href="${appUrl}" class="button">Start Writing</a>
              </p>
              
              <p style="color: #6b7280; margin-top: 30px;">
                If you have any questions, check out our documentation or reach out for support.
              </p>
            </div>
            <div class="footer">
              <p>Happy writing!<br>The MarkItUp Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Welcome to MarkItUp!

Hi ${displayName},

Your email has been verified! You're all set to start using MarkItUp.

What you can do with MarkItUp:
- 📝 Write in Markdown - Create beautiful notes with full markdown support
- 🔗 Link Your Ideas - Connect notes with bidirectional links
- 🤖 AI Assistance - Get help with writing, analysis, and more
- 🔒 Private & Secure - Your data stays on your server

Get started: ${appUrl}

If you have any questions, check out our documentation or reach out for support.

Happy writing!
The MarkItUp Team
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to MarkItUp! 🎉',
      html,
      text,
    });
  }

  /**
   * Check if email service is configured
   */
  isEmailConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Verify SMTP connection (for testing)
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter || !this.isConfigured) {
      return false;
    }

    try {
      await this.transporter.verify();
      apiLogger.info('SMTP connection verified successfully');
      return true;
    } catch (error) {
      apiLogger.error('SMTP connection verification failed', {}, error as Error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
