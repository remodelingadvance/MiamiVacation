import express from 'express';
import {
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getAnalytics,
  getAnalyticsSummary,
  exportAnalytics,
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin', 'super-admin'));
router.use(adminLimiter);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Analytics
router.get('/analytics', getAnalytics);
router.get('/analytics/summary', getAnalyticsSummary);
router.get('/analytics/export', exportAnalytics);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;