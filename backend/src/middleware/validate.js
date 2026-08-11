import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

// Validation middleware
export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(
      validations.map((validation) => validation.run(req))
    );

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }


    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      location: error.location,
      value: error.value,
    }));

    return res.status(422).json({
      success: false,
      message: formattedErrors[0]?.message || 'Validation failed',
      errors: formattedErrors,
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
