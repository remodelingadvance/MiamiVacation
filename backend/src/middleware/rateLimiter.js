import rateLimit from 'express-rate-limit';
import AppError from '../utils/AppError.js';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
  },
  skipSuccessfulRequests: true,
});

// Booking rate limiter
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 bookings per hour
  message: {
    success: false,
    message: 'Too many booking attempts, please try again later',
  },
});

// Review rate limiter
export const reviewLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 reviews per day
  message: {
    success: false,
    message: 'You have reached the maximum number of reviews for today',
  },
});

// API key rate limiter for admin routes
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Rate limit exceeded for admin operations',
  },
});

// Webhook limiter
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Stripe can send many webhooks
  message: {
    success: false,
    message: 'Too many webhook requests',
  },
});

// Contact form limiter
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 contact submissions
  message: {
    success: false,
    message: 'Too many contact form submissions. Please try again later.',
  },
});

// AI support limiter
export const supportAiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  message: {
    success: false,
    message: 'Too many AI support questions. Please wait a moment and try again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Live support chat limiter
export const supportChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many chat messages. Please slow down for a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
