// Simple in-memory rate limiter for edge functions
// Uses a sliding window counter approach

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

class EdgeRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly cleanupInterval = 60000; // 1 minute
  private lastCleanup = Date.now();

  /**
   * Check if a key is rate limited
   * @param key - Identifier (IP, user ID, etc.)
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if rate limited, false if allowed
   */
  isRateLimited(key: string, maxRequests: number = 60, windowMs: number = 60000): boolean {
    const now = Date.now();
    
    // Cleanup old entries periodically
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.cleanup(now, windowMs);
    }
    
    const entry = this.limits.get(key);
    
    if (!entry) {
      // First request for this key
      this.limits.set(key, { count: 1, windowStart: now });
      return false;
    }
    
    // Check if we're still in the same window
    if (now - entry.windowStart < windowMs) {
      // Same window, increment counter
      entry.count++;
      
      if (entry.count > maxRequests) {
        return true; // Rate limited
      }
    } else {
      // New window, reset counter
      entry.count = 1;
      entry.windowStart = now;
    }
    
    return false;
  }
  
  /**
   * Get remaining requests for a key
   * @param key - Identifier
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns number of remaining requests
   */
  getRemainingRequests(key: string, maxRequests: number = 60, windowMs: number = 60000): number {
    const now = Date.now();
    const entry = this.limits.get(key);
    
    if (!entry) {
      return maxRequests;
    }
    
    if (now - entry.windowStart >= windowMs) {
      return maxRequests;
    }
    
    return Math.max(0, maxRequests - entry.count);
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(now: number, windowMs: number): void {
    for (const [key, entry] of this.limits.entries()) {
      if (now - entry.windowStart > windowMs) {
        this.limits.delete(key);
      }
    }
    this.lastCleanup = now;
  }
}

// Global instance
const rateLimiter = new EdgeRateLimiter();

/**
 * Rate limit middleware for edge functions
 * @param req - Request object
 * @param options - Rate limit options
 * @returns Response if rate limited, null if allowed
 */
export async function checkRateLimit(
  req: Request,
  options: {
    maxRequests?: number;
    windowMs?: number;
    keyGenerator?: (req: Request) => string;
    message?: string;
  } = {}
): Promise<Response | null> {
  const {
    maxRequests = 60,
    windowMs = 60000,
    keyGenerator = defaultKeyGenerator,
    message = 'Rate limit exceeded. Please try again later.'
  } = options;
  
  const key = keyGenerator(req);
  const isLimited = rateLimiter.isRateLimited(key, maxRequests, windowMs);
  
  if (isLimited) {
    const remaining = rateLimiter.getRemainingRequests(key, maxRequests, windowMs);
    const resetTime = Math.ceil(windowMs / 1000);
    
    return new Response(
      JSON.stringify({
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
        details: {
          maxRequests,
          windowMs,
          remaining,
          resetTime
        }
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetTime.toString(),
          'Retry-After': resetTime.toString()
        }
      }
    );
  }
  
  return null;
}

/**
 * Default key generator - uses IP address or Authorization header
 */
function defaultKeyGenerator(req: Request): string {
  // Try to get IP from various headers
  const ip = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            req.headers.get('cf-connecting-ip') ||
            'unknown';
  
  // If authenticated, use user ID from Authorization header
  const auth = req.headers.get('authorization');
  if (auth && auth.startsWith('Bearer ')) {
    try {
      // Simple JWT decode to get user ID (for more specific rate limiting)
      const payload = JSON.parse(atob(auth.split('.')[1]));
      if (payload.sub) {
        return `user:${payload.sub}`;
      }
    } catch (e) {
      // Fall back to IP if JWT decode fails
    }
  }
  
  return `ip:${ip}`;
}

/**
 * Create rate limit headers for successful responses
 */
export function createRateLimitHeaders(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): Record<string, string> {
  const remaining = rateLimiter.getRemainingRequests(key, maxRequests, windowMs);
  const resetTime = Math.ceil(windowMs / 1000);
  
  return {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toString()
  };
}

export { rateLimiter };