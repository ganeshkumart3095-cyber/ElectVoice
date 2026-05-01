/**
 * Standardizes the API response format.
 * @param {boolean} success - Indicates if the operation was successful
 * @param {any} data - The payload to be sent (null for errors)
 * @param {string} message - A descriptive message
 * @returns {Object} - The formatted response object
 */
const formatApiResponse = (success, data = null, message = '') => {
  return {
    success,
    data,
    message,
  };
};

/**
 * Sends a success response.
 * @param {Object} res - Express response object
 * @param {any} data - Data to send
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, data, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json(formatApiResponse(true, data, message));
};

/**
 * Sends an error response.
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 */
const sendError = (res, message = 'An error occurred', statusCode = 500) => {
  return res.status(statusCode).json(formatApiResponse(false, null, message));
};

module.exports = {
  formatApiResponse,
  sendSuccess,
  sendError,
};
