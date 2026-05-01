const { MOCK_BOOTHS } = require('../constants');
const { sendSuccess } = require('../utils/response');

/**
 * Retrieves polling booths based on constituency or location.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getPollingBooths = (req, res) => {
  const { constituency } = req.query;
  
  let results = MOCK_BOOTHS.default;

  if (constituency) {
    results = results.filter(b => 
      b.constituency.toLowerCase().includes(constituency.toLowerCase())
    );
  }

  return sendSuccess(res, results, 'Polling booths retrieved');
};

module.exports = {
  getPollingBooths,
};
