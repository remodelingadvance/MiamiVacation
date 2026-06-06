// routes/property.routes.js
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
  getPropertyBookings,
  getRateCalendar,
  updateRateCalendar,
  addMaintenanceDates,
  removeMaintenanceDate,
  getMaintenanceDates,
  getAllPropertiesWithFilter,
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

// ============ PUBLIC ROUTES ============
router.get('/', generalLimiter, optionalAuth, getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/search', validate(propertySearchValidator), searchProperties);
router.get('/slug/:slug', getPropertyBySlug);
router.get('/:id/bookings', getPropertyBookings);
router.get('/:id/availability', checkAvailability);
router.get('/:id/rate-calendar', getRateCalendar);
router.get('/:id', getProperty);

// Maintenance dates - Public (for calendar display)
router.get('/:id/maintenance-dates', getMaintenanceDates);

// ============ ADMIN ONLY ROUTES ============
router.use(protect);
router.use(authorize('admin', 'super-admin'));

// Property CRUD
router.post('/', validate(createPropertyValidator), createProperty);
router.patch('/:id', validate(updatePropertyValidator), updateProperty);
router.delete('/:id', deleteProperty);
router.get('/:id/stats', getPropertyStats);

// Admin filter route - IMPORTANT: This MUST come before /:id routes
router.get('/admin/all-with-filter', getAllPropertiesWithFilter);

// Rate calendar management (Admin only)
router.patch('/:id/rate-calendar', updateRateCalendar);

// Maintenance management routes (Admin only)
router.post('/:id/maintenance-dates', addMaintenanceDates);
router.delete('/:id/maintenance-dates/:dateId', removeMaintenanceDate);

export default router;
