import { body, param } from 'express-validator';

export const createBookingValidator = [
  body('propertyId')
    .notEmpty()
    .withMessage('Property ID is required')
    .isMongoId()
    .withMessage('Invalid property ID'),

  body('checkIn')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Invalid check-in date format')
    .custom(value => {
      if (new Date(value) < new Date()) {
        throw new Error('Check-in date cannot be in the past');
      }
      return true;
    }),

  body('checkOut')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Invalid check-out date format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkIn)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),

  body('guests.adults')
    .isInt({ min: 1 })
    .withMessage('Must have at least 1 adult guest'),

  body('guests.children')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Number of children cannot be negative'),

  body('guests.infants')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Number of infants cannot be negative'),

  body('couponCode')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters'),

  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters'),
];

export const updateBookingValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),

  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid booking status'),

  body('payment.status')
    .optional()
    .isIn(['pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'])
    .withMessage('Invalid payment status'),
];