const express = require('express');
const { getPollingBooths } = require('../controllers/boothsController');

const router = express.Router();

/**
 * GET /api/booths
 * Fetches polling booths.
 */
router.get('/', getPollingBooths);

module.exports = router;
