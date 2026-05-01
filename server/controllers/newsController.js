const axios = require('axios');
const NodeCache = require('node-cache');
const { APP_CONSTANTS } = require('../constants');
const { sendSuccess, sendError } = require('../utils/response');

const newsCache = new NodeCache({ stdTTL: APP_CONSTANTS.NEWS_CACHE_TTL });

/**
 * Fetches latest election news from Google Custom Search API.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getElectionNews = async (req, res) => {
  const query = req.query.q || APP_CONSTANTS.DEFAULT_NEWS_QUERY;
  const cacheKey = `news_${query.toLowerCase().replace(/\s+/g, '_')}`;

  const cachedData = newsCache.get(cacheKey);
  if (cachedData) {
    return sendSuccess(res, cachedData, 'News fetched from cache');
  }

  try {
    const response = await axios.get(APP_CONSTANTS.GOOGLE_CSE_URL, {
      params: {
        key: process.env.GOOGLE_CSE_API_KEY,
        cx: process.env.GOOGLE_CSE_CX,
        q: query,
        num: 5,
        sort: 'date',
      },
      timeout: 8000,
    });

    const newsItems = (response.data.items || []).map(item => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      displayLink: item.displayLink,
      image: item.pagemap?.cse_thumbnail?.[0]?.src || null,
      date: item.pagemap?.metatags?.[0]?.['article:published_time'] || null,
    }));

    newsCache.set(cacheKey, newsItems);
    return sendSuccess(res, newsItems, 'Latest news fetched');
  } catch (err) {
    console.error('[News Error]', err.message);
    return sendError(res, 'Failed to fetch news. Please try again later.');
  }
};

module.exports = {
  getElectionNews,
};
