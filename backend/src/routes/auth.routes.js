import express from 'express';
import {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  updatePassword,
} from '../controllers/auth.controller.js';
import { protect, authRateLimiter } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updatePasswordValidator,
  updateProfileValidator,
} from '../validators/auth.validator.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/signup', authLimiter, authRateLimiter, validate(signupValidator), signup);
router.post('/login', authLimiter, authRateLimiter, validate(loginValidator), login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordValidator), forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordValidator), resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(protect);
router.post('/logout', logout);
router.get('/me', getMe);
router.patch('/update-profile', validate(updateProfileValidator), updateProfile);
router.patch('/update-password', validate(updatePasswordValidator), updatePassword);

export default router;