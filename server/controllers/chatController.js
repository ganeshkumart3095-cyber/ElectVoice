const { GoogleGenerativeAI } = require('@google/generative-ai');
const { APP_CONSTANTS } = require('../constants');
const { sendSuccess, sendError } = require('../utils/response');
const { sanitizeInput } = require('../utils/sanitizer');

/**
 * Internal helper to build the Gemini system prompt.
 * @param {string} language - ISO language code
 * @returns {string} - Formatted prompt
 */
const buildSystemPrompt = (language) => {
  const langName = APP_CONSTANTS.LANG_MAP[language] || APP_CONSTANTS.LANG_MAP.en;
  return `You are ElectVoice — an expert Election Education Assistant for Indian citizens.
Respond in ${langName}. Help citizens understand the election process accurately.
Neutrality is mandatory. Redirect non-election queries politely.`;
};

/**
 * Handles communication with Gemini AI.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const chatWithAI = async (req, res) => {
  const { messages, language } = req.body;
  const lastMessage = messages[messages.length - 1];

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: APP_CONSTANTS.GEMINI_MODEL,
      systemInstruction: buildSystemPrompt(language),
    });

    // Clean history: exclude last message, ensure it starts with 'user'
    let history = messages.slice(0, -1).map(m => ({ role: m.role, parts: m.parts }));
    while (history.length > 0 && history[0].role !== 'user') {
      history.shift();
    }

    const sanitizedText = sanitizeInput(lastMessage.parts[0].text);
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(sanitizedText);
    
    return sendSuccess(res, { response: result.response.text() }, 'AI response generated');
  } catch (err) {
    console.error('[Chat Error]', err.message);
    const status = err.message.includes('429') ? 429 : 500;
    return sendError(res, 'Failed to get AI response. Please try again.', status);
  }
};

module.exports = {
  chatWithAI,
};
