// app.js - Updated rate limiting configuration
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import propertyRoutes from './routes/property.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import reviewRoutes from './routes/review.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import contactRoutes from './routes/contact.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import newsletterCampaignRoutes from './routes/newsletterCampaign.routes.js';
import supportRoutes from './routes/support.routes.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { csrfOriginGuard } from './middleware/csrfGuard.js';

const app = express();

// Body parser - IMPORTANT: Do this before webhook route
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    next(); // Skip JSON parsing for webhook
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(csrfOriginGuard);

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// CORS
app.use(cors({
  origin: [process.env.FRONTEND_URL, "https://www.staywise.miami", process.env.ADMIN_URL, 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============ RATE LIMITING - FIXED ============
// General rate limiter for all API routes (higher limit)
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window (changed from 15 minutes)
  max: 200, // 200 requests per minute (increased from 100 per 15 min)
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  }
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Lighter limiter for admin dashboard polling (allows more requests)
const adminPollingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute for admin polling
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID as key for admin routes
    return req.user?.id || req.ip;
  }
});

// Apply general limiter to all API routes
app.use('/api/', generalLimiter);

// Apply stricter limiter to auth routes
app.use('/api/v1/auth/', authLimiter);

// Apply lighter limiter to admin polling routes
app.use('/api/v1/admin/', adminPollingLimiter);
app.use('/api/v1/notifications/', adminPollingLimiter);
app.use('/api/v1/reviews/admin/', adminPollingLimiter);
app.use('/api/v1/contact/', adminPollingLimiter);
app.use('/api/v1/bookings/admin/', adminPollingLimiter);
app.use('/api/v1/coupons/', adminPollingLimiter);
app.use('/api/v1/newsletter/', adminPollingLimiter);

// Set security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// API routes
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/properties`, propertyRoutes);
app.use(`${API_PREFIX}/bookings`, bookingRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/coupons`, couponRoutes);
app.use(`${API_PREFIX}/contact`, contactRoutes);
app.use(`${API_PREFIX}/upload`, uploadRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/newsletter`, newsletterRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/newsletter-campaigns`, newsletterCampaignRoutes); 
app.use(`${API_PREFIX}/support`, supportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
