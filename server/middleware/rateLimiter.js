const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = rateLimit;

// General API rate limiter
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// AI-specific rate limiter: 20 requests per hour, keyed by user ID or IP
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?.id || req.user?.userId;
    if (userId) return String(userId);
    return ipKeyGenerator(req.ip);
  },
  message: { error: 'AI rate limit exceeded. Maximum 20 AI requests per hour.' },
});

module.exports = { apiRateLimiter, aiRateLimiter };
