/**
 * Rate Limiting Middleware
 * Implements request rate limiting to prevent abuse and DoS attacks
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

/**
 * Create a Redis client for distributed rate limiting
 * Falls back to memory store if Redis is unavailable
 */
function createStore() {
  try {
    const redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

    return new RedisStore({
      client: redisClient,
      prefix: 'rl:',
      sendCommand: async (command: string, args: string[]) => {
        return await (redisClient as any)[command](...args);
      },
    });
  } catch (error) {
    console.warn('Redis unavailable for rate limiting, using memory store');
    return undefined;
  }
}

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  store: createStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

/**
 * Stricter rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  store: createStore(),
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Your account has been temporarily locked. Please try again in 15 minutes.',
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

/**
 * Rate limiter for sensitive operations
 * 10 requests per hour per user
 */
export const sensitiveOpLimiter = rateLimit({
  store: createStore(),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Too many sensitive operations, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID instead of IP for authenticated requests
    return (req as any).user?.uid || req.ip || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many operations. Please wait before trying again.',
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

/**
 * Rate limiter for creation endpoints
 * 20 creations per hour per user
 */
export const createLimiter = rateLimit({
  store: createStore(),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 creations per hour
  message: 'Too many creations, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req as any).user?.uid || req.ip || 'unknown';
  },
  skip: (req) => {
    // Skip for GET requests
    return req.method === 'GET';
  },
});

/**
 * Global cleanup interval for in-memory store
 * Runs every hour to clean up old entries
 */
setInterval(
  () => {
    // Redis store handles cleanup automatically
    // Memory store cleanup is handled by rate-limit library
  },
  60 * 60 * 1000
);

export default {
  apiLimiter,
  authLimiter,
  sensitiveOpLimiter,
  createLimiter,
};
