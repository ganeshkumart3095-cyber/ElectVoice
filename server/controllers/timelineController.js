const { TIMELINE_DATA } = require('../constants');
const { sendSuccess } = require('../utils/response');

/**
 * Retrieves historical and current election timeline data.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getElectionTimeline = (req, res) => {
  return sendSuccess(res, TIMELINE_DATA, 'Election timeline retrieved');
};

module.exports = {
  getElectionTimeline,
};
