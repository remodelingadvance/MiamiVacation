import { Newsletter } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import logger from '../utils/logger.js';

// @desc    Subscribe to newsletter
// @route   POST /api/v1/newsletter/subscribe
// @access  Public
export const subscribe = catchAsync(async (req, res, next) => {
  const { email, firstName, preferences } = req.body;

  const existingSubscriber = await Newsletter.findOne({ email });

  if (existingSubscriber) {
    if (existingSubscriber.status === 'unsubscribed') {
      existingSubscriber.status = 'active';
      existingSubscriber.subscribedAt = Date.now();
      await existingSubscriber.save();
      
      return res.status(200).json({
        success: true,
        message: 'You have been re-subscribed to our newsletter',
      });
    }
    
    return next(new AppError('This email is already subscribed', 400));
  }

  const subscriber = await Newsletter.create({
    email,
    firstName,
    preferences,
    source: req.body.source || 'homepage',
  });

  logger.info(`Newsletter subscription: ${email}`);

  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to newsletter',
  });
});

// @desc    Unsubscribe from newsletter
// @route   POST /api/v1/newsletter/unsubscribe
// @access  Public
export const unsubscribe = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const subscriber = await Newsletter.findOne({ email });

  if (!subscriber) {
    return next(new AppError('Email not found in our subscriber list', 404));
  }

  subscriber.status = 'unsubscribed';
  subscriber.unsubscribedAt = Date.now();
  await subscriber.save();

  logger.info(`Newsletter unsubscription: ${email}`);

  res.status(200).json({
    success: true,
    message: 'Successfully unsubscribed from newsletter',
  });
});

// @desc    Get all subscribers (Admin)
// @route   GET /api/v1/newsletter/subscribers
// @access  Private/Admin
export const getSubscribers = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 50 } = req.query;

  const query = {};
  if (status) query.status = status;

  const subscribers = await Newsletter.find(query)
    .sort('-subscribedAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Newsletter.countDocuments(query);

  res.status(200).json({
    success: true,
    count: subscribers.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
    subscribers,
  });
});