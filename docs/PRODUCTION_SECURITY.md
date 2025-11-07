# Security Best Practices for Production Deployments

## Overview

This guide covers advanced security configurations for production deployments of MarkItUp, particularly for public-facing instances or deployments requiring enhanced security.

## Table of Contents

1. [localStorage Security](#localstorage-security)
2. [Redis-Based Rate Limiting](#redis-based-rate-limiting)
3. [Content Security Policy (CSP) Hardening](#content-security-policy-hardening)
4. [Session Security](#session-security)

---

## localStorage Security

### Current Implementation

MarkItUp currently stores the following data in browser localStorage:
- AI chat sessions and settings
- Installed plugin configurations
- User preferences
- API keys (encrypted)

### Security Concerns

**⚠️ localStorage is vulnerable to XSS attacks:**
- If an attacker injects JavaScript, they can read all localStorage data
- Data persists across sessions
- No built-in encryption

### Recommendations for Enhanced Security

#### 1. Use httpOnly Cookies for Session Tokens

**Current:** Session tokens can be stored in localStorage  
**Recommended:** Use httpOnly cookies (already partially implemented)

**Why?** httpOnly cookies cannot be accessed by JavaScript, protecting against XSS attacks.

**Implementation:** The application already uses httpOnly cookies for authentication tokens. Ensure client-side code never stores tokens in localStorage.

#### 2. Encrypt Sensitive Data Before Storing

For data that must be stored in localStorage (like API keys), the application already uses encryption:

```typescript
// src/lib/auth/encryption.ts
import { encrypt, decrypt } from '@/lib/auth/encryption';

// Storing API keys
const encryptedKey = encrypt(apiKey);
localStorage.setItem('api_key', encryptedKey);

// Retrieving API keys
const encryptedKey = localStorage.getItem('api_key');
const apiKey = decrypt(encryptedKey);
```

**Best Practice:** Always encrypt sensitive data before storing in localStorage.

#### 3. Use IndexedDB for Larger Datasets

For large AI chat histories or plugin data, consider using IndexedDB with encryption:

```typescript
// Example: Encrypted IndexedDB wrapper
import { openDB } from 'idb';
import { encrypt, decrypt } from '@/lib/auth/encryption';

const db = await openDB('markitup-secure', 1, {
  upgrade(db) {
    db.createObjectStore('ai-sessions');
  },
});

// Store encrypted data
await db.put('ai-sessions', {
  id: sessionId,
  data: encrypt(JSON.stringify(sessionData)),
});

// Retrieve and decrypt
const stored = await db.get('ai-sessions', sessionId);
const sessionData = JSON.parse(decrypt(stored.data));
```

#### 4. Implement Automatic Data Expiration

Set expiration times for sensitive localStorage data:

```typescript
interface StoredData {
  value: string;
  expiresAt: number;
}

function setWithExpiry(key: string, value: string, ttlMs: number) {
  const item: StoredData = {
    value: encrypt(value),
    expiresAt: Date.now() + ttlMs,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key: string): string | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item: StoredData = JSON.parse(itemStr);
  
  if (Date.now() > item.expiresAt) {
    localStorage.removeItem(key);
    return null;
  }
  
  return decrypt(item.value);
}
```

#### 5. Clear Sensitive Data on Logout

Ensure all sensitive data is cleared when users log out:

```typescript
// In logout function
function logout() {
  // Clear all localStorage
  localStorage.clear();
  
  // Or clear specific keys
  const sensitiveKeys = ['ai-sessions', 'api-keys', 'user-preferences'];
  sensitiveKeys.forEach(key => localStorage.removeItem(key));
  
  // Redirect to login
  window.location.href = '/auth/login';
}
```

### Migration Path

**Short Term (Current):**
- ✅ Continue using encrypted localStorage for API keys
- ✅ Session tokens in httpOnly cookies
- ✅ Clear data on logout

**Medium Term (Recommended for Enhanced Security):**
- Implement data expiration for localStorage items
- Add automatic cleanup of expired data
- Implement IndexedDB for large datasets

**Long Term (Maximum Security):**
- Move all sensitive data server-side
- Use session storage for temporary data only
- Implement server-side session management

---

## Redis-Based Rate Limiting

### Current Implementation

MarkItUp uses in-memory rate limiting:

```typescript
// src/lib/security/rateLimiter.ts
export const fileOperationsLimiter = new RateLimiter(50, 60000); // 50/min
export const fileCreationLimiter = new RateLimiter(20, 60000);   // 20/min
export const fileReadLimiter = new RateLimiter(100, 60000);      // 100/min
```

### Limitations of In-Memory Rate Limiting

- ❌ Resets on server restart
- ❌ Doesn't work across multiple server instances
- ❌ Can be bypassed in distributed deployments
- ❌ No persistence of rate limit violations

### Redis-Based Rate Limiting Implementation

#### 1. Install Dependencies

```bash
npm install ioredis
npm install --save-dev @types/ioredis
```

#### 2. Create Redis Rate Limiter

Create `src/lib/security/redisRateLimiter.ts`:

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  // Enable clustering for production
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3,
});

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export class RedisRateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly keyPrefix: string;

  constructor(keyPrefix: string, maxRequests: number = 100, windowMs: number = 60000) {
    this.keyPrefix = keyPrefix;
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    try {
      // Use Redis sorted set for sliding window
      const multi = redis.multi();
      
      // Remove old entries
      multi.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests
      multi.zcard(key);
      
      // Add current request
      multi.zadd(key, now, `${now}`);
      
      // Set expiry
      multi.expire(key, Math.ceil(this.windowMs / 1000));
      
      const results = await multi.exec();
      
      if (!results) {
        throw new Error('Redis transaction failed');
      }

      const count = results[1][1] as number;
      const allowed = count < this.maxRequests;
      const remaining = Math.max(0, this.maxRequests - count - 1);
      const resetTime = now + this.windowMs;

      return { allowed, remaining, resetTime };
    } catch (error) {
      console.error('Redis rate limiter error:', error);
      
      // Fallback to allowing request if Redis fails
      // In production, you might want to fail closed instead
      return {
        allowed: true,
        remaining: this.maxRequests,
        resetTime: now + this.windowMs,
      };
    }
  }

  async reset(identifier: string): Promise<void> {
    const key = `${this.keyPrefix}:${identifier}`;
    await redis.del(key);
  }

  async getStats(identifier: string): Promise<{ count: number; resetTime: number } | null> {
    const key = `${this.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    try {
      await redis.zremrangebyscore(key, 0, windowStart);
      const count = await redis.zcard(key);
      const resetTime = now + this.windowMs;

      return { count, resetTime };
    } catch (error) {
      console.error('Redis stats error:', error);
      return null;
    }
  }
}

// Export Redis client for cleanup
export { redis };
```

#### 3. Update Environment Configuration

Add to `.env.example`:

```bash
# Redis Configuration (Optional - for production rate limiting)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

#### 4. Replace In-Memory Rate Limiters

Update `src/lib/security/rateLimiter.ts`:

```typescript
import { RedisRateLimiter } from './redisRateLimiter';

const USE_REDIS = process.env.REDIS_HOST && process.env.NODE_ENV === 'production';

export const fileOperationsLimiter = USE_REDIS
  ? new RedisRateLimiter('file-ops', 50, 60000)
  : new RateLimiter(50, 60000);

export const fileCreationLimiter = USE_REDIS
  ? new RedisRateLimiter('file-create', 20, 60000)
  : new RateLimiter(20, 60000);

export const fileReadLimiter = USE_REDIS
  ? new RedisRateLimiter('file-read', 100, 60000)
  : new RateLimiter(100, 60000);
```

#### 5. Docker Compose Setup

Add Redis to `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

volumes:
  redis-data:
```

### Benefits of Redis Rate Limiting

✅ **Persistent across restarts** - Rate limits survive server reboots  
✅ **Distributed** - Works across multiple server instances  
✅ **Scalable** - Handles high traffic loads  
✅ **Flexible** - Can implement complex rate limiting strategies  
✅ **Observable** - Track rate limit violations across the system  

### Production Deployment Considerations

1. **Redis Clustering:** For high availability, use Redis Cluster or Redis Sentinel
2. **Monitoring:** Track Redis performance and rate limit violations
3. **Fallback Strategy:** Decide whether to fail open (allow) or fail closed (deny) on Redis failures
4. **Key Expiration:** Ensure proper TTL settings to prevent memory issues
5. **Connection Pooling:** Reuse Redis connections for better performance

---

## Content Security Policy (CSP) Hardening

### Current CSP Headers

The application currently allows `unsafe-inline` and `unsafe-eval`:

```typescript
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
```

### Hardening with Nonces (Future Enhancement)

For maximum security, implement CSP nonces to eliminate `unsafe-inline`:

```typescript
// Generate nonce per request
import { randomBytes } from 'crypto';

export function middleware(request: NextRequest) {
  const nonce = randomBytes(16).toString('base64');
  
  const cspHeader = `
    script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net;
    style-src 'self' 'nonce-${nonce}';
  `;
  
  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Nonce', nonce);
  
  return response;
}
```

**Note:** This requires significant changes to inline scripts and styles. Consider this for future releases.

---

## Session Security

### Best Practices

1. **Use httpOnly Cookies:** ✅ Already implemented
2. **Set Secure Flag:** Set in production (HTTPS only)
3. **Set SameSite:** Prevent CSRF attacks
4. **Session Rotation:** Regenerate session ID on privilege changes
5. **Session Timeout:** Implement automatic logout after inactivity

### Example Enhanced Session Configuration

```typescript
export function setSessionCookie(token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    name: 'session-token',
    value: token,
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  };
}
```

---

## Summary Checklist

### Current Security Status
- ✅ Session tokens in httpOnly cookies
- ✅ API keys encrypted in localStorage
- ✅ In-memory rate limiting
- ✅ Basic CSP headers
- ✅ XSS protection with DOMPurify

### Recommended Enhancements (Priority Order)

**High Priority:**
1. ⚠️ Implement Redis-based rate limiting for production
2. ⚠️ Add data expiration for localStorage
3. ⚠️ Implement session timeout/rotation

**Medium Priority:**
4. Consider IndexedDB for large datasets
5. Add rate limit violation monitoring
6. Implement Redis clustering for HA

**Low Priority (Future):**
7. CSP nonces for inline scripts
8. Move all sensitive data server-side
9. Implement advanced session management

---

## Additional Resources

- [OWASP localStorage Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage)
- [Redis Rate Limiting Patterns](https://redis.io/docs/manual/patterns/rate-limiter/)
- [CSP Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
