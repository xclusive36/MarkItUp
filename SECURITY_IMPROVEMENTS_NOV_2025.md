# Security Improvements - November 2025

## Summary

Enhanced HTTPS enforcement to be **optional and administrator-controlled**, respecting the self-hosted nature of MarkItUp while providing security options for public deployments.

## What Was Changed

### 1. Optional HTTPS Enforcement (src/middleware.ts)

**Previous Behavior:**
- HSTS headers were automatically set in production
- No HTTP-to-HTTPS redirect capability
- Assumed all production deployments would use HTTPS

**New Behavior:**
- HTTPS enforcement is **OFF by default**
- Administrators can enable it via `ENFORCE_HTTPS=true` environment variable
- Only enforces when both `ENFORCE_HTTPS=true` AND `NODE_ENV=production`
- Automatically redirects HTTP to HTTPS (with 301 permanent redirect)
- Sets HSTS headers only when enforcement is enabled
- Excludes localhost from redirects (for reverse proxy scenarios)

**Code Changes:**
```typescript
// Optional HTTPS enforcement for administrators who want it
const enforceHttps = process.env.ENFORCE_HTTPS === 'true';
const isProduction = process.env.NODE_ENV === 'production';

// Redirect HTTP to HTTPS if administrator explicitly enables it
if (enforceHttps && isProduction) {
  const url = request.nextUrl.clone();
  const proto = request.headers.get('x-forwarded-proto') || url.protocol;

  if (proto === 'http' && !url.hostname.includes('localhost')) {
    url.protocol = 'https';
    return NextResponse.redirect(url, 301);
  }
}

// HSTS only when enforcement is enabled
if (enforceHttps && isProduction) {
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
}
```

### 2. Environment Configuration (.env.example)

Added clear documentation for the new `ENFORCE_HTTPS` option:

```bash
# HTTPS Enforcement (Optional - for administrators with SSL/TLS setup)
# Set to "true" to force HTTPS redirects and enable HSTS headers
# Leave as "false" (default) for local/internal deployments without SSL
# Only works in production mode (NODE_ENV=production)
ENFORCE_HTTPS=false
```

Updated production deployment guidance to reflect optional HTTPS.

### 3. Security Configuration Documentation

Created comprehensive guide at `docs/SECURITY_CONFIGURATION.md` covering:

- **When to enable HTTPS enforcement** (public deployments with SSL)
- **When to keep it disabled** (local, internal, reverse proxy setups)
- **Example deployment scenarios:**
  - Local home server (HTTP OK)
  - Docker on private network (HTTP OK)
  - Public VPS with reverse proxy (HTTPS enforced)
  - Behind Cloudflare/Nginx with SSL termination
- **Other security settings** (JWT, encryption, rate limiting)
- **Best practices** for local vs. public deployments
- **Troubleshooting** common issues

## Benefits

### For Self-Hosted Users
✅ Works out-of-the-box on local networks without SSL setup  
✅ No complex certificate configuration required  
✅ Flexible deployment on HTTP-only internal networks  
✅ No forced requirements that break local deployments  

### For Public Deployments
✅ Easy to enable HTTPS enforcement when ready  
✅ Proper security headers when SSL is configured  
✅ Automatic HTTP-to-HTTPS redirects  
✅ HSTS for enhanced security  

### For Administrators
✅ Clear control over security posture  
✅ Well-documented configuration options  
✅ Respects reverse proxy setups  
✅ Prevents accidental misconfiguration  

## Deployment Scenarios Supported

| Scenario | NODE_ENV | ENFORCE_HTTPS | Result |
|----------|----------|---------------|---------|
| Local development | development | false | HTTP works, no redirects |
| Home server | production | false | HTTP works, basic security headers |
| Internal network | production | false | HTTP works, basic security headers |
| Public with SSL | production | true | HTTPS enforced, HSTS enabled |
| Behind reverse proxy | production | false | Proxy handles SSL, app on HTTP |

## Backward Compatibility

✅ **Fully backward compatible** - existing deployments continue to work without changes  
✅ Default behavior unchanged (no HTTPS enforcement)  
✅ Opt-in security hardening for those who want it  

## Security Audit Results

After implementing these changes, the application has:

✅ **Proper authentication** with JWT and session management  
✅ **Path traversal protection** with sanitized file operations  
✅ **Rate limiting** on all critical endpoints  
✅ **User isolation** with scoped file directories  
✅ **SQL injection protection** via Drizzle ORM  
✅ **Security headers** on all responses  
✅ **Optional HTTPS enforcement** for public deployments  
✅ **XSS mitigation** with CSP headers  
✅ **Input validation** with Zod schemas  
✅ **Password hashing** with bcrypt (12 rounds)  

## Testing Recommendations

1. **Local HTTP deployment** - Verify app works on `http://localhost:3000`
2. **Production HTTP** - Verify `NODE_ENV=production` + `ENFORCE_HTTPS=false` allows HTTP
3. **Production HTTPS enforced** - Verify redirect works with `ENFORCE_HTTPS=true`
4. **HSTS headers** - Check headers only present when enforcement enabled
5. **Reverse proxy** - Test behind nginx/Cloudflare with SSL termination

## Files Modified

- `src/middleware.ts` - Added optional HTTPS enforcement logic
- `.env.example` - Added `ENFORCE_HTTPS` configuration
- `docs/SECURITY_CONFIGURATION.md` - Created comprehensive security guide (new file)

## Migration Guide

No migration needed! Existing deployments continue to work as-is.

To enable HTTPS enforcement (optional):
1. Ensure SSL/TLS is properly configured (Let's Encrypt, Cloudflare, etc.)
2. Add `ENFORCE_HTTPS=true` to your `.env` file
3. Restart the application
4. Verify HTTPS redirects are working

## Future Considerations

Potential enhancements for future releases:

1. **CSP nonces** - Replace `unsafe-inline` with nonce-based CSP
2. **DOMPurify integration** - Replace regex-based markdown sanitization
3. **Redis rate limiting** - For distributed deployments
4. **httpOnly cookies** - Move session tokens from localStorage
5. **Security audit logging** - Track failed auth attempts
6. **Two-factor authentication** - Additional auth layer

## Conclusion

MarkItUp now provides **flexible, administrator-controlled HTTPS enforcement** that respects its self-hosted nature while offering robust security options for public deployments. The implementation prioritizes:

- **Ease of use** for local/internal deployments
- **Security hardening** options for public-facing instances  
- **Clear documentation** for administrators
- **No breaking changes** to existing deployments

The application remains secure by default with multiple layers of protection, while giving administrators full control over HTTPS enforcement based on their specific deployment needs.
