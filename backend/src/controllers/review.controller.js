// controllers/review.controller.js
import mongoose from 'mongoose';
import { Review, Booking, Property, Notification } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import logger from '../utils/logger.js';

// @desc    Get all reviews for a property
// @route   GET /api/v1/reviews/property/:propertyId
// @access  Public
export const getPropertyReviews = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return next(new AppError('Invalid property ID', 400));
  }

  const reviews = await Review.find({
    property: propertyId,
    status: 'approved',
  })
    .populate('user', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({
    property: propertyId,
    status: 'approved',
  });

  const stats = await Review.aggregate([
    {
      $match: {
        property: new mongoose.Types.ObjectId(propertyId),
        status: 'approved',
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    stats: stats[0] || {},
    reviews,
  });
});

// @desc    Create review
// @route   POST /api/v1/reviews
// @access  Private
// controllers/review.controller.js - Update createReview

export const createReview = catchAsync(async (req, res, next) => {
  const { propertyId, bookingId, rating, title, content, ratings } = req.body;

  logger.debug('Create review request', { propertyId, bookingId, rating });

  // Validate required fields
  if (!bookingId) {
    return next(new AppError('Booking ID is required', 400));
  }

  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }

  if (!title || title.trim().length < 3) {
    return next(new AppError('Title must be at least 3 characters', 400));
  }

  if (!content || content.trim().length < 10) {
    return next(new AppError('Review content must be at least 10 characters', 400));
  }

  // Check if booking exists and is completed
  const booking = await Booking.findById(bookingId).populate('property');
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if user owns the booking
  if (booking.user.toString() !== req.user.id) {
    return next(new AppError('You can only review your own bookings', 403));
  }

  // Check if booking is completed
  if (booking.status !== 'completed') {
    return next(new AppError('You can only review completed stays. Your booking status is: ' + booking.status, 400));
  }

  // Use property from booking if propertyId is not provided or doesn't match
  let finalPropertyId = propertyId;
  if (!finalPropertyId) {
    finalPropertyId = booking.property._id;
  }
  
  // Check if property matches the booking
  if (booking.property._id.toString() !== finalPropertyId) {
    return next(new AppError('Property does not match booking', 400));
  }

  // Check if already reviewed
  const existingReview = await Review.findOne({
    user: req.user.id,
    booking: bookingId,
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this stay', 400));
  }

  // Create review
  const review = await Review.create({
    user: req.user.id,
    property: finalPropertyId,
    booking: bookingId,
    rating: parseInt(rating),
    title: title.trim(),
    content: content.trim(),
    ratings: ratings || {
      cleanliness: rating,
      communication: rating,
      location: rating,
      value: rating,
      accuracy: rating,
    },
    verified: true,
  });

  // Update booking with review reference
  booking.review = review._id;
  await booking.save();

  // Update property ratings
  await Property.calculateRatings(finalPropertyId);

  // Create notification for admin
  await Notification.createNotification({
    type: 'new_review',
    title: 'New Review Submitted',
    message: `${req.user.firstName} ${req.user.lastName} left a ${rating}-star review for ${booking.property.name}`,
    priority: rating >= 4 ? 'medium' : 'high',
    data: {
      reviewId: review._id,
      propertyId: finalPropertyId,
      bookingId: bookingId,
      rating: rating,
      title: title,
    },
    link: `/admin/reviews/${review._id}`,
  });

  logger.info(`Review created for property ${finalPropertyId} by user ${req.user.id}`);

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review,
  });
});

// @desc    Moderate review (Admin)
// @route   PATCH /api/v1/reviews/:id/moderate
// @access  Private/Admin
export const moderateReview = catchAsync(async (req, res, next) => {
  const { status, response } = req.body;

  const review = await Review.findById(req.params.id).populate('property user');

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  const oldStatus = review.status;
  
  if (status) {
    review.status = status;
  }

  if (response) {
    review.response = {
      text: response,
      respondedBy: req.user.id,
      respondedAt: new Date(),
    };
  }

  await review.save();

  if (oldStatus !== status && status === 'approved') {
    await Notification.createNotification({
      type: 'review_flagged',
      title: 'Review Approved',
      message: `Review for ${review.property.name} has been approved and is now visible`,
      priority: 'low',
      data: {
        reviewId: review._id,
        propertyId: review.property._id,
        status: status,
      },
      link: `/admin/reviews/${review._id}`,
    });
  }

  logger.info(`Review moderated: ${review._id} by admin ${req.user.id}`);

  res.status(200).json({
    success: true,
    review,
  });
});

// @desc    Update review
// @route   PATCH /api/v1/reviews/:id
// @access  Private
export const updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only edit your own reviews', 403));
  }

  const daysSinceCreation = (Date.now() - review.createdAt) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation > 30 && req.user.role !== 'admin') {
    return next(new AppError('Reviews can only be edited within 30 days', 400));
  }

  const allowedFields = ['rating', 'title', 'content', 'ratings'];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  await Property.calculateRatings(review.property);

  res.status(200).json({
    success: true,
    review: updatedReview,
  });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own reviews', 403));
  }

  const propertyId = review.property;
  await review.deleteOne();

  await Property.calculateRatings(propertyId);

  logger.info(`Review deleted for property ${propertyId} by user ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});

// @desc    Mark review as helpful
// @route   POST /api/v1/reviews/:id/helpful
// @access  Private
export const markHelpful = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  const { vote } = req.body;

  const hasVoted = review.helpful.voters.includes(req.user.id);
  if (hasVoted) {
    return next(new AppError('You have already voted on this review', 400));
  }

  if (vote === 'yes') {
    review.helpful.yes += 1;
  } else if (vote === 'no') {
    review.helpful.no += 1;
  } else {
    return next(new AppError('Invalid vote type. Use "yes" or "no"', 400));
  }

  review.helpful.voters.push(req.user.id);
  await review.save();

  res.status(200).json({
    success: true,
    helpful: review.helpful,
  });
});

// @desc    Admin - Get all reviews (with pending count for badge)
// @route   GET /api/v1/reviews/admin/all
// @access  Private/Admin
export const getAllReviews = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) {
    query.status = status;
  }

  const reviews = await Review.find(query)
    .populate('user', 'firstName lastName email')
    .populate('property', 'name slug')
    .populate('booking', 'bookingNumber')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Review.countDocuments(query);
  
  // Get pending reviews count for badge (reviews that are pending and not viewed by admin)
  const pendingReviewsCount = await Review.countDocuments({ 
    status: 'pending',
    viewedByAdmin: { $ne: true }
  });

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pendingCount: pendingReviewsCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
    reviews,
  });
});

// @desc    Get pending reviews count (for sidebar badge)
// @route   GET /api/v1/reviews/pending-count
// @access  Private/Admin
export const getPendingReviewsCount = catchAsync(async (req, res, next) => {
  const count = await Review.countDocuments({ 
    status: 'pending',
    viewedByAdmin: { $ne: true }
  });
  
  res.status(200).json({
    success: true,
    count,
  });
});

// @desc    Mark all pending reviews as viewed (FIXED)
// @route   POST /api/v1/reviews/mark-all-viewed
// @access  Private/Admin
export const markAllAsViewed = catchAsync(async (req, res, next) => {
  const result = await Review.updateMany(
    { 
      status: 'pending',
      viewedByAdmin: { $ne: true }
    },
    { 
      viewedByAdmin: true, 
      viewedAt: new Date(),
      viewedBy: req.user.id
    }
  );
  
  logger.info(`Marked ${result.modifiedCount} reviews as viewed by admin ${req.user.id}`);
  
  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} pending reviews marked as viewed`,
    modifiedCount: result.modifiedCount,
  });
});

// @desc    Mark single review as viewed
// @route   POST /api/v1/reviews/:id/viewed
// @access  Private/Admin
export const markAsViewed = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return next(new AppError('Review not found', 404));
  }
  
  if (!review.viewedByAdmin) {
    review.viewedByAdmin = true;
    review.viewedAt = new Date();
    review.viewedBy = req.user.id;
    await review.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Review marked as viewed',
  });
});