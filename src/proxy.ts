import { NextRequest, NextResponse } from 'next/server';

/**
 * Security proxy (formerly middleware)
 * Adds security headers to all responses
 *
 * For self-hosted deployments:
 * - HTTPS enforcement is OPTIONAL and controlled by ENFORCE_HTTPS env var
 * - Administrators should only enable if they have proper SSL/TLS setup
 * - Local/internal deployments can safely run on HTTP
 */
function generateNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  // Base64-encode for CSP nonce format
  return btoa(binary);
}

export function proxy(request: NextRequest) {
  // Generate a per-request nonce and forward it so server components can consume it
  const nonce = generateNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-csp-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

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
  // In development, some tooling may require 'unsafe-eval'. Avoid it in production.
  const allowUnsafeEval = process.env.NODE_ENV !== 'production';
  const scriptDirectives = [
    "'self'",
    // Keep inline for now to avoid breaking changes; components can adopt nonces progressively
    "'unsafe-inline'",
    // Nonce for inline scripts where adopted
    `'nonce-${nonce}'`,
    ...(allowUnsafeEval ? ["'unsafe-eval'"] : []),
    'https://cdn.jsdelivr.net',
  ].join(' ');

  // Inline style attributes (React's style={}) are treated as "unsafe-inline" styles.
  // Browsers ignore 'unsafe-inline' if a style nonce or hash is also present.
  // To avoid breaking existing inline styles, we DO NOT include a style nonce by default.
  // Admins can opt-in via CSP_STYLE_NONCE=true once inline styles are refactored to classes.
  const useStyleNonce = process.env.CSP_STYLE_NONCE === 'true';
  const styleSources: string[] = [
    "'self'",
    "'unsafe-inline'", // required while inline style attributes exist
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net',
  ];
  if (useStyleNonce) {
    styleSources.push(`'nonce-${nonce}'`);
  }
  const styleDirectives = styleSources.join(' ');

  // Allow additional outbound connections (e.g., Ollama on LAN) via ALLOWED_CONNECT_HOSTS
  // Comma-separated list like: "http://192.168.1.10:11434, http://myhost.local:11434"
  const extraConnect = (process.env.ALLOWED_CONNECT_HOSTS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(src => (/^https?:\/\//i.test(src) ? src : `http://${src}`))
    .join(' ');

  // Self-hosted default: allow generic HTTP/HTTPS and WebSocket connections so
  // browser clients can talk to services (e.g., Ollama) on LAN or other hosts
  // without requiring explicit allowlists.
  // This mirrors the previously permissive behavior and avoids breaking
  // self-install scenarios where the AI service lives on another container or host.
  const connectDirectives = [
    "'self'",
    'https:',
    'http:',
    'wss:',
    'ws:',
    // Keep localhost shortcuts for clarity (covered by http: but explicit is fine)
    'http://localhost:*',
    'http://127.0.0.1:*',
    extraConnect,
  ]
    .filter(Boolean)
    .join(' ');

  const cspHeader = `
    default-src 'self';
    script-src ${scriptDirectives};
    style-src ${styleDirectives};
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https:;
    connect-src ${connectDirectives};
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    object-src 'none';
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-CSP-Nonce', nonce);

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable browser XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (formerly Feature Policy)
  // Replace deprecated/unknown interest-cohort with browsing-topics
  // Keep Permissions-Policy minimal and only with widely supported features to avoid warnings.
  // Removed deprecated/experimental features causing console noise.
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

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

// Configure which routes to apply proxy to
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
