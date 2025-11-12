# Proxy Security Guide

This document explains the purpose and configuration of `src/proxy.ts` (formerly `middleware.ts`) after the Next.js 16 migration.

## Purpose

The proxy runs at the edge in front of all matched routes to:

* Enforce optional HTTPS (administrator-controlled via `ENFORCE_HTTPS=true`)
* Apply baseline security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
* Prevent clickjacking, MIME sniffing, and enable stronger privacy defaults

## HTTPS Enforcement

Set `ENFORCE_HTTPS=true` in production to redirect all HTTP requests to HTTPS (except localhost). When enabled, HSTS is also added:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

Disable (default) for flexible self-hosting or environments without TLS termination.

## Content Security Policy (CSP)

Current policy (production):

```text
default-src 'self';
script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: blob: https:;
connect-src 'self' http://localhost:* https:;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
```

In development, `'unsafe-eval'` is temporarily added to ease tooling/debugging.

### Planned Hardening Roadmap

1. ✅ Introduce nonces for inline scripts and styles (nonces now generated per-request)
2. Remove CDN allowances or pin to subresource integrity (SRI)
3. Separate analytics/connect endpoints with explicit domains
4. Report violations with `report-to` / `report-uri`
5. Progressively adopt nonces in components, then remove `'unsafe-inline'` after full migration

### CSP Nonce Implementation

**Status:** Nonces are now generated per-request and available to components.

**How it works:**

* `src/proxy.ts` generates a cryptographically random nonce on every request using `crypto.getRandomValues()`.
* Nonce is forwarded via `x-csp-nonce` request header.
* CSP includes both `'nonce-{value}'` and `'unsafe-inline'` (for gradual migration).
* `src/lib/csp.ts` exports `getCspNonce()` for server components.
* `src/components/CspNonceProvider.tsx` provides nonce to client components via React context.
* `useCspNonce()` hook retrieves the nonce in client components.

**Using nonces in your components:**

Server components:

```tsx
import { getCspNonce } from '@/lib/csp';

export default function MyPage() {
  const nonce = getCspNonce();
  return (
    <script nonce={nonce ?? undefined}>
      console.log('Inline script with nonce');
    </script>
  );
}
```

Client components:

```tsx
'use client';
import { useCspNonce } from '@/components/CspNonceProvider';

export function MyComponent() {
  const nonce = useCspNonce();
  return (
    <style nonce={nonce ?? undefined}>
      {`.my-class { color: red; }`}
    </style>
  );
}
```

**Migration plan:**

1. Add `nonce={nonce}` to all inline `<script>` and `<style>` tags progressively.
2. Once all inline resources have nonces, remove `'unsafe-inline'` from CSP in `src/proxy.ts`.
3. Monitor CSP violation reports to catch any missed inline resources.

## Header Summary

| Header | Purpose |
|--------|---------|
| Content-Security-Policy | Restrict resource origins |
| X-Frame-Options: DENY | Blocks clickjacking |
| X-Content-Type-Options: nosniff | Prevents MIME sniffing |
| X-XSS-Protection: 1; mode=block | Legacy XSS protection for older browsers |
| Referrer-Policy: strict-origin-when-cross-origin | Limits referrer leakage |
| Permissions-Policy | Disables camera/mic/geolocation & FLoC |
| Strict-Transport-Security | Forces HTTPS (when enabled) |

## Configuration Variables

| Env Var | Default | Effect |
|---------|---------|-------|
| ENFORCE_HTTPS | false | Enable HTTPS redirect + HSTS in production |
| NEXT_PUBLIC_SITE_URL | `http://localhost:3000` | Used for `metadataBase` + OG/Twitter URLs |

## Matcher Behavior

The `config.matcher` excludes:

* Static assets (`_next/static`, `_next/image`)
* Image & favicon files
* Common image extensions

Adjust matcher if you need to proxy additional resources globally.

## Troubleshooting

| Symptom | Cause | Resolution |
|---------|-------|-----------|
| Infinite redirect loop | HTTPS enforced behind proxy misreporting protocol | Ensure upstream sets `x-forwarded-proto` correctly |
| Missing fonts | CSP blocking fonts | Verify `fonts.googleapis.com` & `fonts.gstatic.com` allowed |
| Inline script blocked | Hardening removed `'unsafe-inline'` prematurely | Implement nonces before removing inline allowance |
| Dev error from eval | `'unsafe-eval'` removed in development accidentally | Ensure NODE_ENV !== 'production' logic intact |

## Next Steps

* ✅ Nonce generation implemented
* Progressively adopt nonces in all inline scripts/styles
* Add `REPORT_ONLY` mode for CSP testing
* Pin external resources via SRI
* Document any future domain-specific `connect-src` changes
* Remove `'unsafe-inline'` once nonce adoption is complete

## Reference

* Next.js Proxy: <https://nextjs.org/docs/app/api-reference/file-conventions/proxy>
* CSP Guide: <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>

---

Maintained by the MarkItUp security team.
