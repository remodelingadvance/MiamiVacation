import express from 'express';
import {
  getProperties,
  getFeaturedProperties,
  getProperty,
  getPropertyBySlug,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  checkAvailability,
  getPropertyStats,
  getPropertyBookings, // Make sure this is imported
} from '../controllers/property.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createPropertyValidator,
  updatePropertyValidator,
  propertySearchValidator,
} from '../validators/property.validator.js';
import { generalLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes - IMPORTANT: Specific routes MUST come before generic ones
router.get('/', generalLimiter, optionalAuth, getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/search', validate(propertySearchValidator), searchProperties);
router.get('/slug/:slug', getPropertyBySlug);
router.get('/:id/bookings', getPropertyBookings); // This MUST be before /:id
router.get('/:id/availability', checkAvailability);
router.get('/:id', getProperty);

// Admin only routes
router.use(protect);
router.use(authorize('admin', 'super-admin'));

router.post('/', validate(createPropertyValidator), createProperty);
router.patch('/:id', validate(updatePropertyValidator), updateProperty);
router.delete('/:id', deleteProperty);
router.get('/:id/stats', getPropertyStats);

export default router;