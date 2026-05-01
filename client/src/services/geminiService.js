import axios from 'axios';

/**
 * Sends a chat message to the backend Gemini AI service.
 * @param {Array} messages - Chat history including the latest message
 * @param {string} language - Preferred response language
 * @returns {Promise<Object>} - The AI response payload
 */
export const sendChatMessage = async (messages, language = 'en') => {
  try {
    const response = await axios.post('/api/chat', {
      messages,
      language,
    });
    
    // The backend returns { success, data, message }
    return response.data.data.response;
  } catch (error) {
    console.error('Gemini Service Error:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to get AI response');
  }
};
