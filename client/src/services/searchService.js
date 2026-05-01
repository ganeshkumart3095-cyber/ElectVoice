import axios from 'axios';

/**
 * Fetches polling booths based on user location or constituency.
 * @param {Object} params - Search parameters (lat, lng, constituency)
 * @returns {Promise<Array>} - List of polling booths
 */
export const fetchPollingBooths = async (params) => {
  try {
    const response = await axios.get('/api/booths', { params });
    return response.data.data;
  } catch (error) {
    console.error('Polling Booths Error:', error.message);
    return [];
  }
};

/**
 * Fetches latest election news from the backend.
 * @param {string} query - Search query for news
 * @returns {Promise<Array>} - List of news articles
 */
export const fetchElectionNews = async (query) => {
  try {
    const response = await axios.get('/api/news', { params: { q: query } });
    return response.data.data;
  } catch (error) {
    console.error('Election News Error:', error.message);
    return [];
  }
};

/**
 * Fetches historical and upcoming election timeline data.
 * @returns {Promise<Array>} - Timeline events
 */
export const fetchTimeline = async () => {
  try {
    const response = await axios.get('/api/timeline');
    return response.data.data;
  } catch (error) {
    console.error('Timeline Service Error:', error.message);
    return [];
  }
};
