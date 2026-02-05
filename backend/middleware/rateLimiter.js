/**
 * Simple in-memory rate limiter
 * For production, use redis-based rate limiting
 */

const rateLimitStore = new Map();

// Clean up old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.message - Error message when limit exceeded
 */
const createRateLimiter = ({ windowMs = 60000, max = 100, message = 'Too many requests' }) => {
  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();

    let data = rateLimitStore.get(key);

    if (!data || now > data.resetTime) {
      data = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, data);
    } else {
      data.count++;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - data.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(data.resetTime / 1000));

    if (data.count > max) {
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((data.resetTime - now) / 1000),
      });
    }

    next();
  };
};

// Pre-configured limiters
const rateLimiters = {
  // General API rate limit - 100 requests per minute
  general: createRateLimiter({
    windowMs: 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later',
  }),

  // Auth rate limit - 10 attempts per 15 minutes
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many authentication attempts, please try again later',
  }),

  // URL shortening rate limit - 30 per minute
  shorten: createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: 'Too many URLs shortened, please slow down',
  }),

  // Strict rate limit for sensitive operations - 5 per minute
  strict: createRateLimiter({
    windowMs: 60 * 1000,
    max: 5,
    message: 'Rate limit exceeded for this operation',
  }),
};

module.exports = { createRateLimiter, rateLimiters };
