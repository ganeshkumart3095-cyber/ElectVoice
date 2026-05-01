const rateLimit = require('express-rate-limit');
const { formatApiResponse } = require('../utils/response');

/**
 * Common handler for rate limit violations.
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Next middleware
 * @param {Object} options - Limiter options
 */
const rateLimitHandler = (req, res, next, options) => {
  res.status(429).json(formatApiResponse(false, null, options.message));
};

/**
 * General API rate limiter: 50 requests per 15 minutes per IP.
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests. Please try again later.',
  handler: rateLimitHandler,
});

/**
 * Stricter limiter for chat endpoint: 20 requests per 5 minutes per IP.
 */
const chatRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Chat limit exceeded. Please wait a few minutes.',
  handler: rateLimitHandler,
});

module.exports = {
  apiRateLimiter,
  chatRateLimiter,
};
