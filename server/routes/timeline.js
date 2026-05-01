const express = require('express');
const { getElectionTimeline } = require('../controllers/timelineController');

const router = express.Router();

/**
 * GET /api/timeline
 * Fetches election timeline.
 */
router.get('/', getElectionTimeline);

module.exports = router;
