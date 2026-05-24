import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

// Validation middleware
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ 
      field: err.path,
      message: err.msg 
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors,
    });
  };
};

// Sanitize middleware
export const sanitize = (req, res, next) => {
  if (req.body) {
    // Remove any MongoDB operators
    const sanitizeObject = (obj) => {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };
    sanitizeObject(req.body);
  }
  next();
};