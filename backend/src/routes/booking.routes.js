// routes/booking.routes.js
import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  markAllAsViewed,
  getPendingBookingsCount,
  markBookingViewed,
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createBookingValidator,
  updateBookingValidator,
} from '../validators/booking.validator.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.post('/', bookingLimiter, validate(createBookingValidator), createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBooking);
router.patch('/:id/cancel', cancelBooking);

// Admin routes
router.get('/admin/all', authorize('admin', 'super-admin'), getAllBookings);
router.get('/pending-count', authorize('admin', 'super-admin'), getPendingBookingsCount);
router.post('/mark-all-viewed', authorize('admin', 'super-admin'), markAllAsViewed);
router.post('/:id/viewed', authorize('admin', 'super-admin'), markBookingViewed);
router.patch(
  '/:id/status',
  authorize('admin', 'super-admin'),
  validate(updateBookingValidator),
  updateBookingStatus
);

export default router;