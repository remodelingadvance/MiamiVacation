import { User, Booking, Review } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import logger from '../utils/logger.js';

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('favorites')
    .populate('bookings')
    .populate('reviews');

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Add to favorites
// @route   POST /api/v1/users/favorites/:propertyId
// @access  Private
export const addToFavorites = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;

  const user = await User.findById(req.user.id);

  if (!user.favorites.includes(propertyId)) {
    user.favorites.push(propertyId);
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: 'Property added to favorites',
    favorites: user.favorites,
  });
});

// @desc    Remove from favorites
// @route   DELETE /api/v1/users/favorites/:propertyId
// @access  Private
export const removeFromFavorites = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;

  const user = await User.findById(req.user.id);
  user.favorites = user.favorites.filter(fav => fav.toString() !== propertyId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Property removed from favorites',
    favorites: user.favorites,
  });
});

// @desc    Get favorites
// @route   GET /api/v1/users/favorites
// @access  Private
export const getFavorites = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('favorites');

  res.status(200).json({
    success: true,
    count: user.favorites.length,
    favorites: user.favorites,
  });
});

// @desc    Get booking history
// @route   GET /api/v1/users/bookings
// @access  Private
export const getBookingHistory = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate('property')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookings.length,
    bookings,
  });
});

// @desc    Get user reviews
// @route   GET /api/v1/users/reviews
// @access  Private
export const getUserReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id })
    .populate('property', 'name slug images')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  });
});

// @desc    Delete account
// @route   DELETE /api/v1/users/account
// @access  Private
export const deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  // Verify password before deletion
  const user = await User.findById(req.user.id).select('+password');
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return next(new AppError('Password is incorrect', 401));
  }

  // Soft delete - deactivate account
  user.isActive = false;
  user.email = `deleted_${user._id}@deleted.com`;
  await user.save();

  logger.info(`Account deleted: ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});

// @desc    Update notification preferences
// @route   PATCH /api/v1/users/preferences
// @access  Private
export const updatePreferences = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { preferences: req.body },
    { new: true }
  );

  res.status(200).json({
    success: true,
    preferences: user.preferences,
  });
});