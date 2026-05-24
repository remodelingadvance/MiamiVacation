import express from 'express';
import {
  getProfile,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  getBookingHistory,
  getUserReviews,
  deleteAccount,
  updatePreferences,
} from '../controllers/user.controller.js';
import { protect, verifyEmailOwnership } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.delete('/account', deleteAccount);

// Favorites routes
router.get('/favorites', getFavorites);
router.post('/favorites/:propertyId', addToFavorites);
router.delete('/favorites/:propertyId', removeFromFavorites);

// Booking history
router.get('/bookings', getBookingHistory);

// User reviews
router.get('/reviews', getUserReviews);

// Preferences
router.patch('/preferences', updatePreferences);

export default router;