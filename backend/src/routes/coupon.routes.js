import express from 'express';
import {
  validateCoupon,
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponStats,
} from '../controllers/coupon.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createCouponValidator,
  validateCouponValidator,
} from '../validators/coupon.validator.js';

const router = express.Router();

// Public route for coupon validation
router.post('/validate', optionalAuth, validate(validateCouponValidator), validateCoupon);

// Admin routes
router.use(protect);
router.use(authorize('admin', 'super-admin'));

router.get('/', getCoupons);
router.get('/stats', getCouponStats);
router.get('/:id', getCoupon);
router.post('/', validate(createCouponValidator), createCoupon);
router.patch('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;