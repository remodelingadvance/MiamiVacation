import { body } from 'express-validator';

export const createCouponValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Coupon code can only contain uppercase letters, numbers, hyphens, and underscores'),

  body('type')
    .notEmpty()
    .withMessage('Coupon type is required')
    .isIn(['percentage', 'fixed'])
    .withMessage('Coupon type must be percentage or fixed'),

  body('value')
    .notEmpty()
    .withMessage('Coupon value is required')
    .isFloat({ min: 0 })
    .withMessage('Coupon value must be a positive number')
    .custom((value, { req }) => {
      if (req.body.type === 'percentage' && value > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
      }
      return true;
    }),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),

  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('minimumBookingAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum booking amount must be a positive number'),

  body('maximumDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be a positive number'),
];

export const validateCouponValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required'),

  body('bookingAmount')
    .notEmpty()
    .withMessage('Booking amount is required')
    .isFloat({ min: 0 })
    .withMessage('Booking amount must be a positive number'),

  body('nights')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of nights must be at least 1'),

  body('propertyId')
    .optional()
    .isMongoId()
    .withMessage('Invalid property ID'),
];