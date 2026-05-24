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
import expressRaw from 'express';

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

// Payment routes
router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.post('/create-checkout-session', createCheckoutSession);
router.get('/history', getPaymentHistory);
router.get('/:id', getPaymentDetails);
router.get('/:id/invoice', generateInvoice);

// Admin routes
router.get(
  '/admin/all',
  authorize('admin', 'super-admin'),
  getPaymentHistory
);

export default router;