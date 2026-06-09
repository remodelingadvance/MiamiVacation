import express from 'express';
import {
  submitContact,
  getContacts,
  getContact,
  replyToContact,
  updateContactStatus,
  getUnreadContactsCount,
  markContactRead,
  markAllAsRead,
} from '../controllers/contact.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { contactLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public route
router.post('/', contactLimiter, submitContact);

// Admin routes
router.use(protect);
router.use(authorize('admin', 'super-admin'));

router.get('/', getContacts);
router.get('/unread-count', getUnreadContactsCount);
router.post('/mark-all-read', markAllAsRead);
router.post('/:id/read', markContactRead);
router.get('/:id', getContact);
router.post('/:id/reply', replyToContact);
router.patch('/:id/status', updateContactStatus);

export default router;
