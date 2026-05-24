import { Review, Booking, Property } from '../models/index.js';
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

  // Get rating statistics
  const stats = await Review.aggregate([
    {
      $match: {
        property: mongoose.Types.ObjectId(propertyId),
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
export const createReview = catchAsync(async (req, res, next) => {
  const { propertyId, bookingId, rating, title, content, ratings } = req.body;

  // Check if booking exists and is completed
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if user owns the booking
  if (booking.user.toString() !== req.user.id) {
    return next(new AppError('You can only review your own bookings', 403));
  }

  // Check if booking is completed
  if (booking.status !== 'completed') {
    return next(new AppError('You can only review completed stays', 400));
  }

  // Check if property matches
  if (booking.property.toString() !== propertyId) {
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
    property: propertyId,
    booking: bookingId,
    rating,
    title,
    content,
    ratings: ratings || {},
    verified: true,
  });

  // Update booking with review reference
  booking.review = review._id;
  await booking.save();

  // Update property ratings
  await Property.calculateRatings(propertyId);

  logger.info(`Review created for property ${propertyId} by user ${req.user.id}`);

  res.status(201).json({
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

  // Check ownership
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only edit your own reviews', 403));
  }

  // Check if within edit window (30 days)
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

  // Update property ratings
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

  // Check ownership
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own reviews', 403));
  }

  await review.remove();

  // Update property ratings
  await Property.calculateRatings(review.property);

  logger.info(`Review deleted for property ${review.property} by user ${req.user.id}`);

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

  const { vote } = req.body; // 'yes' or 'no'

  // Check if user already voted
  const hasVoted = review.helpful.voters.includes(req.user.id);
  if (hasVoted) {
    return next(new AppError('You have already voted on this review', 400));
  }

  if (vote === 'yes') {
    review.helpful.yes += 1;
  } else if (vote === 'no') {
    review.helpful.no += 1;
  }

  review.helpful.voters.push(req.user.id);
  await review.save();

  res.status(200).json({
    success: true,
    helpful: review.helpful,
  });
});

// @desc    Admin - Get all reviews
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

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
    reviews,
  });
});

// @desc    Admin - Moderate review
// @route   PATCH /api/v1/reviews/:id/moderate
// @access  Private/Admin
export const moderateReview = catchAsync(async (req, res, next) => {
  const { status, response } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

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

  logger.info(`Review moderated: ${review._id} by admin ${req.user.id}`);

  res.status(200).json({
    success: true,
    review,
  });
});