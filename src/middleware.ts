import { NextRequest, NextResponse } from 'next/server';

/**
 * Security middleware
 * Adds security headers to all responses
 *
 * For self-hosted deployments:
 * - HTTPS enforcement is OPTIONAL and controlled by ENFORCE_HTTPS env var
 * - Administrators should only enable if they have proper SSL/TLS setup
 * - Local/internal deployments can safely run on HTTP
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Optional HTTPS enforcement for administrators who want it
  // This is OFF by default for self-hosted flexibility
  const enforceHttps = process.env.ENFORCE_HTTPS === 'true';
  const isProduction = process.env.NODE_ENV === 'production';

  // Redirect HTTP to HTTPS if administrator explicitly enables it
  if (enforceHttps && isProduction) {
    const url = request.nextUrl.clone();
    const proto = request.headers.get('x-forwarded-proto') || url.protocol;

    // Only redirect if accessing via HTTP (not HTTPS or localhost)
    if (proto === 'http' && !url.hostname.includes('localhost')) {
      url.protocol = 'https';
      return NextResponse.redirect(url, 301); // Permanent redirect
    }
  }

  // Content Security Policy
  // Allows inline scripts and styles (required for Next.js)
  // In production, consider using nonces for better security
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https:;
    connect-src 'self' http://localhost:* https:;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    object-src 'none';
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable browser XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Strict Transport Security (HSTS)
  // Only set if HTTPS enforcement is enabled by administrator
  // This tells browsers to only access the site via HTTPS in the future
  if (enforceHttps && isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
