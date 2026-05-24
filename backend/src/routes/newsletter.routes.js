import express from 'express';
import {
  subscribe,
  unsubscribe,
  getSubscribers,
  deleteSubscriber,
  bulkImportSubscribers,
} from '../controllers/newsletter.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/subscribe', generalLimiter, subscribe);
router.post('/unsubscribe', generalLimiter, unsubscribe);

// Admin routes
router.use(protect);
router.use(authorize('admin', 'super-admin'));

router.get('/subscribers', getSubscribers);
router.delete('/subscribers/:id', deleteSubscriber);
router.post('/bulk-import', bulkImportSubscribers);

export default router;