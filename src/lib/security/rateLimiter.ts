/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if a request should be allowed
   * @param identifier - Usually IP address or user ID
   * @returns true if request is allowed, false if rate limited
   */
  public check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      // New window
      const resetTime = now + this.windowMs;
      this.requests.set(identifier, { count: 1, resetTime });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime };
    }

    if (entry.count >= this.maxRequests) {
      // Rate limited
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    // Increment count
    entry.count++;
    return { allowed: true, remaining: this.maxRequests - entry.count, resetTime: entry.resetTime };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  public reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Get current stats for an identifier
   */
  public getStats(
    identifier: string
  ): { count: number; remaining: number; resetTime: number } | null {
    const entry = this.requests.get(identifier);
    if (!entry) {
      return null;
    }
    return {
      count: entry.count,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }
}

// Detect test environment
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST === 'true';

// Create singleton instances for different operations
// More permissive limits in test environment
export const fileOperationsLimiter = new RateLimiter(isTestEnvironment ? 1000 : 50, 60000); // 1000/min in tests, 50/min in production
export const fileCreationLimiter = new RateLimiter(isTestEnvironment ? 500 : 20, 60000); // 500/min in tests, 20/min in production
export const fileReadLimiter = new RateLimiter(isTestEnvironment ? 2000 : 100, 60000); // 2000/min in tests, 100/min in production

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers (reverse proxy support)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(resetTime: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      resetTime,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      },
    }
  );
}
