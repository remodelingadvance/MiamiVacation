import { Newsletter, Notification } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import logger from '../utils/logger.js';

// @desc    Subscribe to newsletter
// @route   POST /api/v1/newsletter/subscribe
// @access  Public
export const subscribe = catchAsync(async (req, res, next) => {
  const { email, firstName, preferences } = req.body;

  // Check if already subscribed
  const existingSubscriber = await Newsletter.findOne({ email });

  if (existingSubscriber) {
    if (existingSubscriber.status === 'unsubscribed') {
      // Re-subscribe
      existingSubscriber.status = 'active';
      existingSubscriber.subscribedAt = Date.now();
      existingSubscriber.unsubscribedAt = undefined;
      if (preferences) existingSubscriber.preferences = preferences;
      await existingSubscriber.save();
      
      // ✅ Create notification for re-subscription
      await Notification.createNotification({
        type: 'newsletter_subscriber',
        title: 'Newsletter Re-subscription',
        message: `${email} re-subscribed to the newsletter`,
        priority: 'low',
        data: {
          subscriberId: existingSubscriber._id,
          email: email,
          action: 'resubscribed',
        },
        link: `/admin/newsletter`,
      });
      
      return res.status(200).json({
        success: true,
        message: 'You have been re-subscribed to our newsletter',
        subscriber: existingSubscriber,
      });
    }
    
    return next(new AppError('This email is already subscribed to our newsletter', 400));
  }

  // Create new subscriber
  const subscriber = await Newsletter.create({
    email,
    firstName,
    preferences: preferences || {
      promotions: true,
      newProperties: true,
      blog: false,
      events: false,
    },
    source: req.body.source || 'homepage',
    metadata: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });

  // ✅ Create notification for admin
  await Notification.createNotification({
    type: 'newsletter_subscriber',
    title: 'New Newsletter Subscriber',
    message: `${email} subscribed to the newsletter`,
    priority: 'low',
    data: {
      subscriberId: subscriber._id,
      email: email,
      firstName: firstName || '',
    },
    link: `/admin/newsletter`,
  });

  logger.info(`Newsletter subscription: ${email}`);

  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to newsletter',
    subscriber,
  });
});

// @desc    Unsubscribe from newsletter
// @route   POST /api/v1/newsletter/unsubscribe
// @access  Public
export const unsubscribe = catchAsync(async (req, res, next) => {
  const { email, reason } = req.body;

  const subscriber = await Newsletter.findOne({ email });

  if (!subscriber) {
    return next(new AppError('Email not found in our subscriber list', 404));
  }

  if (subscriber.status === 'unsubscribed') {
    return next(new AppError('This email is already unsubscribed', 400));
  }

  subscriber.status = 'unsubscribed';
  subscriber.unsubscribedAt = Date.now();
  if (reason) {
    subscriber.unsubscribeReason = reason;
  }
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
// controllers/newsletter.controller.js - Update getSubscribers
// controllers/newsletter.controller.js - Update getSubscribers

export const getSubscribers = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.email = { $regex: search, $options: 'i' };
  }

  const subscribers = await Newsletter.find(query)
    .sort('-subscribedAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Newsletter.countDocuments(query);
  
  // Get active subscribers count for badge
  const activeCount = await Newsletter.countDocuments({ status: 'active' });

  res.status(200).json({
    success: true,
    count: subscribers.length,
    total,
    activeCount, // This is the badge count
    pagination: { 
      page: parseInt(page), 
      limit: parseInt(limit), 
      totalPages: Math.ceil(total / limit) 
    },
    subscribers,
  });
});

// @desc    Delete subscriber (Admin)
// @route   DELETE /api/v1/newsletter/subscribers/:id
// @access  Private/Admin
export const deleteSubscriber = catchAsync(async (req, res, next) => {
  const subscriber = await Newsletter.findById(req.params.id);

  if (!subscriber) {
    return next(new AppError('Subscriber not found', 404));
  }

  await subscriber.deleteOne();

  logger.info(`Subscriber deleted: ${subscriber.email}`);

  res.status(200).json({
    success: true,
    message: 'Subscriber deleted successfully',
  });
});

// @desc    Bulk import subscribers (Admin)
// @route   POST /api/v1/newsletter/bulk-import
// @access  Private/Admin
export const bulkImportSubscribers = catchAsync(async (req, res, next) => {
  const { subscribers } = req.body;

  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    return next(new AppError('Please provide an array of subscribers', 400));
  }

  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  for (const sub of subscribers) {
    try {
      const existing = await Newsletter.findOne({ email: sub.email });
      if (existing) {
        results.skipped++;
        continue;
      }

      await Newsletter.create({
        email: sub.email,
        firstName: sub.firstName,
        preferences: sub.preferences || {
          promotions: true,
          newProperties: true,
          blog: false,
          events: false,
        },
        source: 'import',
      });
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        email: sub.email,
        error: error.message,
      });
    }
  }

  res.status(200).json({
    success: true,
    results,
  });
});