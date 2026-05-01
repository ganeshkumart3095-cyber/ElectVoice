const express = require('express');
const { getElectionNews } = require('../controllers/newsController');

const router = express.Router();

/**
 * GET /api/news
 * Fetches latest election news.
 */
router.get('/', getElectionNews);

module.exports = router;
