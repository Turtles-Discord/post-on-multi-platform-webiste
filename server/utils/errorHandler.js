// Wrapper for async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Clean up uploaded files if there's an error
  if (req.file) {
    require('fs').unlink(req.file.path, (unlinkError) => {
      if (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    });
  }

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate Error',
      message: 'This account is already connected'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};

// Custom error class for known errors
class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = 'AppError';
  }
}

module.exports = {
  asyncHandler,
  errorHandler,
  AppError
}; 