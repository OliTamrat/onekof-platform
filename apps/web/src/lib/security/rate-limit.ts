import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { logSecurity } from '@/lib/logger';

/**
 * Rate Limiting Configuration
 *
 * SECURITY: Prevents brute force attacks by limiting request rates
 * Uses Redis in production, in-memory cache in development
 */

// In-memory cache for development (not suitable for production with multiple instances)
class InMemoryCache {
  private cache: Map<string, { count: number; reset: number }> = new Map();

  async get(key: string): Promise<{ count: number; reset: number } | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Clean up expired entries
    if (Date.now() > entry.reset) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  async set(key: string, count: number, windowMs: number): Promise<void> {
    this.cache.set(key, {
      count,
      reset: Date.now() + windowMs,
    });
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; reset: number }> {
    const existing = await this.get(key);

    if (!existing) {
      const entry = { count: 1, reset: Date.now() + windowMs };
      await this.set(key, 1, windowMs);
      return entry;
    }

    existing.count++;
    this.cache.set(key, existing);
    return existing;
  }
}

const memoryCache = new InMemoryCache();

// Create Redis client if credentials are available
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  // Authentication endpoints - strict limits
  auth: {
    requests: 5,
    window: '15m', // 5 requests per 15 minutes
    windowMs: 15 * 60 * 1000,
  },

  // Login endpoint - very strict
  login: {
    requests: 3,
    window: '15m', // 3 login attempts per 15 minutes
    windowMs: 15 * 60 * 1000,
  },

  // Password reset - strict
  passwordReset: {
    requests: 3,
    window: '60m', // 3 requests per hour
    windowMs: 60 * 60 * 1000,
  },

  // Email verification - moderate
  emailVerification: {
    requests: 5,
    window: '60m', // 5 requests per hour
    windowMs: 60 * 60 * 1000,
  },

  // API endpoints - generous
  api: {
    requests: 100,
    window: '1m', // 100 requests per minute
    windowMs: 60 * 1000,
  },

  // Signup - moderate
  signup: {
    requests: 3,
    window: '60m', // 3 signups per hour per IP
    windowMs: 60 * 60 * 1000,
  },
};

type RateLimitConfig = keyof typeof rateLimitConfigs;

/**
 * Create a rate limiter for a specific endpoint
 */
function createRateLimiter(config: RateLimitConfig) {
  const limits = rateLimitConfigs[config];

  if (redis) {
    // Use Redis-backed rate limiter in production
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limits.requests, limits.window),
      analytics: true,
      prefix: `ratelimit:${config}`,
    });
  }

  // Fallback to in-memory for development
  return null;
}

// Create rate limiters for each endpoint type
const rateLimiters = {
  auth: createRateLimiter('auth'),
  login: createRateLimiter('login'),
  passwordReset: createRateLimiter('passwordReset'),
  emailVerification: createRateLimiter('emailVerification'),
  api: createRateLimiter('api'),
  signup: createRateLimiter('signup'),
};

/**
 * Get client identifier from request (IP address or user ID)
 */
function getIdentifier(request: NextRequest, userId?: string): string {
  // Prefer user ID if available
  if (userId) return `user:${userId}`;

  // Use IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const cfConnecting = request.headers.get('cf-connecting-ip');

  const ip = forwarded?.split(',')[0] || real || cfConnecting || 'unknown';
  return `ip:${ip}`;
}

/**
 * Check rate limit using in-memory cache (development fallback)
 */
async function checkMemoryRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limits = rateLimitConfigs[config];
  const result = await memoryCache.increment(key, limits.windowMs);

  const remaining = Math.max(0, limits.requests - result.count);
  const success = result.count <= limits.requests;

  return {
    success,
    limit: limits.requests,
    remaining,
    reset: result.reset,
  };
}

/**
 * Apply rate limiting to a request
 *
 * @param request - Next.js request object
 * @param config - Rate limit configuration to use
 * @param userId - Optional user ID for user-specific rate limiting
 * @returns NextResponse if rate limited, null if allowed
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = 'api',
  userId?: string
): Promise<NextResponse | null> {
  const identifier = getIdentifier(request, userId);
  const limiter = rateLimiters[config];

  let result: { success: boolean; limit: number; remaining: number; reset: number };

  if (limiter) {
    // Use Redis rate limiter
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    result = { success, limit, remaining, reset };
  } else {
    // Use in-memory fallback
    const key = `${config}:${identifier}`;
    result = await checkMemoryRateLimit(key, config);
  }

  // Add rate limit headers to response
  const headers = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  if (!result.success) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

    // Log security event
    logSecurity('rate_limit_exceeded', 'medium', {
      identifier,
      config,
      endpoint: request.nextUrl.pathname,
      limit: result.limit,
    });

    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  // Request allowed - return null to indicate no error
  return null;
}

/**
 * Helper to check rate limit and return early if exceeded
 * Use this at the beginning of API route handlers
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const rateLimitError = await checkRateLimit(request, 'login');
 *   if (rateLimitError) return rateLimitError;
 *
 *   // Continue with normal handler logic...
 * }
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = 'api',
  userId?: string
): Promise<NextResponse | null> {
  return rateLimit(request, config, userId);
}

/**
 * Manually reset rate limit for a user (e.g., after successful verification)
 * Only works with Redis
 */
export async function resetRateLimit(identifier: string, config: RateLimitConfig): Promise<void> {
  if (!redis) return;

  const key = `ratelimit:${config}:${identifier}`;
  await redis.del(key);
}
