import express from 'express';
import {
  getPropertyReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getAllReviews,
  moderateReview,
  markAllAsViewed,
} from '../controllers/review.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createReviewValidator,
  updateReviewValidator,
} from '../validators/review.validator.js';
import { reviewLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with optional auth
router.get('/property/:propertyId', optionalAuth, getPropertyReviews);

// Protected routes
router.use(protect);

// User routes
router.post('/', reviewLimiter, validate(createReviewValidator), createReview);
router.patch('/:id', validate(updateReviewValidator), updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/helpful', markHelpful);

// Admin routes
router.get('/admin/all', authorize('admin', 'super-admin'), getAllReviews);
router.patch('/:id/moderate', authorize('admin', 'super-admin'), moderateReview);
router.post('/mark-all-viewed', authorize('admin', 'super-admin'), markAllAsViewed);

export default router;