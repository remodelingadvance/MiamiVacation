// routes/newsletter.routes.js
import express from 'express';
import multer from 'multer';
import {
  subscribe,
  unsubscribe,
  getSubscribers,
  deleteSubscriber,
  addSingleSubscriber,
  bulkAddText,
  importSubscribers,
  exportSubscribers,
  getTemplate,
  bulkDeleteSubscribers,
} from '../controllers/newsletter.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.post('/subscribe', generalLimiter, subscribe);
router.post('/unsubscribe', generalLimiter, unsubscribe);

// Admin routes
router.use(protect);
router.use(authorize('admin', 'super-admin'));

// Subscriber management
router.get('/subscribers', getSubscribers);
router.delete('/subscribers/:id', deleteSubscriber);

// Add subscribers - Three methods
router.post('/admin/add-single', addSingleSubscriber);
router.post('/admin/bulk-text', bulkAddText);
router.post('/admin/import', upload.single('file'), importSubscribers);

// Export and templates
router.get('/admin/export', exportSubscribers);
router.get('/admin/template', getTemplate);

// Bulk operations
router.delete('/admin/bulk-delete', bulkDeleteSubscribers);

export default router;