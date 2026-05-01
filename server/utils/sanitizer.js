const xss = require('xss');

/**
 * Sanitizes user input by stripping all HTML tags to prevent XSS attacks.
 * @param {string} text - The raw input text
 * @returns {string} - The sanitized and trimmed text
 */
const sanitizeInput = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return xss(text, {
    whiteList: {}, // completely strip all HTML tags
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style', 'xml', 'iframe', 'embed'],
  }).trim();
};

module.exports = {
  sanitizeInput,
};
