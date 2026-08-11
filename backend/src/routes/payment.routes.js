import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  createCheckoutSession,
  getPaymentHistory,
  getPaymentDetails,
  generateInvoice,
} from '../controllers/payment.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { webhookLimiter } from '../middleware/rateLimiter.js';
import { rejectRawPaymentData } from '../middleware/paymentSecurity.js';

const router = express.Router();

// Webhook route - needs raw body for Stripe signature verification
router.post(
  '/webhook',
  webhookLimiter,
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Protected routes
router.use(protect);
router.use(rejectRawPaymentData);

// Admin routes must be declared before /:id.
router.get(
  '/admin/all',
  authorize('admin', 'super-admin'),
  getPaymentHistory
);

// Payment routes
router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.post('/create-checkout-session', createCheckoutSession);
router.get('/history', getPaymentHistory);
router.get('/:id', getPaymentDetails);
router.get('/:id/invoice', generateInvoice);

export default router;
