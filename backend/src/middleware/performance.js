import logger from '../utils/logger.js';

// Response time tracker
export const responseTimeTracker = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = diff[0] * 1e3 + diff[1] * 1e-6;
    
    if (time > 1000) { // Log slow requests (>1 second)
      logger.warn(`Slow request: ${req.method} ${req.originalUrl} - ${time.toFixed(2)}ms`);
    }
  });

  next();
};

// Request size limiter
export const requestSizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length']);
    
    if (contentLength > parseSize(maxSize)) {
      return res.status(413).json({
        success: false,
        message: 'Request entity too large',
      });
    }
    
    next();
  };
};

// Parse size string to bytes
const parseSize = (size) => {
  const units = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024,
  };
  
  const match = size.toLowerCase().match(/^(\d+)\s*(b|kb|mb|gb)$/);
  if (match) {
    return parseInt(match[1]) * units[match[2]];
  }
  
  return 10 * 1024 * 1024; // Default 10MB
};

// Concurrent request limiter
let concurrentRequests = 0;
const MAX_CONCURRENT = 100;

export const concurrentRequestLimiter = (req, res, next) => {
  if (concurrentRequests >= MAX_CONCURRENT) {
    return res.status(503).json({
      success: false,
      message: 'Server is busy. Please try again later.',
    });
  }
  
  concurrentRequests++;
  
  res.on('finish', () => {
    concurrentRequests--;
  });
  
  next();
};