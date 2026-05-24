import express from 'express';
import {
  subscribe,
  unsubscribe,
  getSubscribers,
} from '../controllers/newsletter.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/subscribe', generalLimiter, subscribe);
router.post('/unsubscribe', generalLimiter, unsubscribe);

// Admin routes
router.get(
  '/subscribers',
  protect,
  authorize('admin', 'super-admin'),
  getSubscribers
);

export default router;