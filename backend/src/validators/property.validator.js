import { body, param, query } from 'express-validator';

export const createPropertyValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Property name is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Property name must be between 5 and 200 characters'),

  body('description.short')
    .trim()
    .notEmpty()
    .withMessage('Short description is required')
    .isLength({ max: 500 })
    .withMessage('Short description cannot exceed 500 characters'),

  body('description.full')
    .trim()
    .notEmpty()
    .withMessage('Full description is required'),

  body('type')
    .notEmpty()
    .withMessage('Property type is required')
    .isIn(['condo', 'villa', 'penthouse', 'apartment', 'studio', 'house', 'mansion'])
    .withMessage('Invalid property type'),

  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),

  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),

  body('location.coordinates.*')
    .isFloat()
    .withMessage('Coordinates must be valid numbers'),

  body('details.bedrooms')
    .isInt({ min: 0 })
    .withMessage('Number of bedrooms must be a positive number'),

  body('details.bathrooms')
    .isFloat({ min: 0 })
    .withMessage('Number of bathrooms must be a positive number'),

  body('details.maxGuests')
    .isInt({ min: 1 })
    .withMessage('Maximum guests must be at least 1'),

  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),

  body('pricing.cleaningFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cleaning fee must be a positive number'),

  body('pricing.serviceFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Service fee must be a positive number'),
];

export const updatePropertyValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid property ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Property name must be between 5 and 200 characters'),

  body('type')
    .optional()
    .isIn(['condo', 'villa', 'penthouse', 'apartment', 'studio', 'house', 'mansion'])
    .withMessage('Invalid property type'),

  body('pricing.basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
];

export const propertySearchValidator = [
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),

  query('guests')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of guests must be at least 1'),

  query('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Number of bedrooms must be a positive number'),

  query('type')
    .optional()
    .isIn(['condo', 'villa', 'penthouse', 'apartment', 'studio', 'house', 'mansion'])
    .withMessage('Invalid property type'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];