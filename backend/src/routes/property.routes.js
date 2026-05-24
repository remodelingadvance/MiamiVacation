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

// Public routes
router.get('/', generalLimiter, optionalAuth, getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/search', validate(propertySearchValidator), searchProperties);
router.get('/slug/:slug', getPropertyBySlug);
router.get('/:id', getProperty);
router.get('/:id/availability', checkAvailability);

// Admin only routes
router.use(protect);
router.use(authorize('admin', 'super-admin'));

router.post('/', validate(createPropertyValidator), createProperty);
router.patch('/:id', validate(updatePropertyValidator), updateProperty);
router.delete('/:id', deleteProperty);
router.get('/:id/stats', getPropertyStats);

export default router;