import AppError from '../utils/AppError.js';

// Handle Mongoose cast errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Handle Mongoose duplicate field errors
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: '${value}'. Please use another value for ${field}.`;
  return new AppError(message, 400);
};

// Handle Mongoose validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// Handle Stripe errors
const handleStripeError = (err) => {
  let message = 'Payment processing error.';
  switch (err.type) {
    case 'StripeCardError':
      message = err.message;
      break;
    case 'StripeInvalidRequestError':
      message = 'Invalid payment request.';
      break;
    case 'StripeAPIError':
      message = 'Payment service is temporarily unavailable.';
      break;
    case 'StripeConnectionError':
      message = 'Could not connect to payment service.';
      break;
    case 'StripeAuthenticationError':
      message = 'Payment authentication failed.';
      break;
  }
  return new AppError(message, 400);
};

// Send error during development
const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Rendered website
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

// Send error during production
const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        ...(err.errors && { errors: err.errors }),
      });
    }

    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong! Please try again later.',
    });
  }

  // Rendered website
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error('ERROR 💥', err);
  return res.status(500).json({
    success: false,
    message: 'Please try again later.',
  });
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    // Mongoose errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    
    // JWT errors
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    // Stripe errors
    if (error.type && error.type.startsWith('Stripe')) error = handleStripeError(error);

    sendErrorProd(error, req, res);
  }
};

export default errorHandler;