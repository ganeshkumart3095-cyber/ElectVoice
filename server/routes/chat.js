const express = require('express');
const Joi = require('joi');
const { chatWithAI } = require('../controllers/chatController');
const { chatRateLimiter } = require('../middleware/rateLimit');
const { sendError } = require('../utils/response');

const router = express.Router();

/**
 * Validation schema for chat requests.
 */
const chatSchema = Joi.object({
  messages: Joi.array()
    .items(
      Joi.object({
        role: Joi.string().valid('user', 'model').required(),
        parts: Joi.array()
          .items(Joi.object({ text: Joi.string().max(4000).required() }))
          .required(),
      })
    )
    .min(1)
    .required(),
  language: Joi.string().valid('en', 'hi', 'ta').default('en'),
});

/**
 * Middleware to validate chat request body.
 */
const validateChatBody = (req, res, next) => {
  const { error } = chatSchema.validate(req.body);
  if (error) {
    return sendError(res, error.details[0].message, 400);
  }
  next();
};

/**
 * POST /api/chat
 * Handles AI chat interactions.
 */
router.post('/', chatRateLimiter, validateChatBody, chatWithAI);

module.exports = router;
