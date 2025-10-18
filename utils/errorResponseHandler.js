// utils/errorResponseHandler.js


// Error Response
const errorResponse = (res, message = "Error", statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? error.toString() : undefined,
  });
};

module.exports = {  errorResponse };

