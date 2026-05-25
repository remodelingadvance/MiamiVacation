import { Coupon } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import logger from '../utils/logger.js';

// @desc    Validate coupon
// @route   POST /api/v1/coupons/validate
// @access  Public
export const validateCoupon = catchAsync(async (req, res, next) => {
  const { code, bookingAmount, nights, propertyId } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return next(new AppError('Invalid coupon code', 404));
  }

  const validation = coupon.isValid(
    bookingAmount,
    nights || 1,
    req.user?.id || 'guest',
    propertyId
  );

  if (!validation.valid) {
    return next(new AppError(validation.message, 400));
  }

  const discount = coupon.calculateDiscount(bookingAmount);

  res.status(200).json({
    success: true,
    valid: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
    },
    discount,
    finalAmount: bookingAmount - discount,
  });
});

// @desc    Get all coupons (Admin)
// @route   GET /api/v1/coupons
// @access  Private/Admin
export const getCoupons = catchAsync(async (req, res, next) => {
  const coupons = await Coupon.find()
    .populate('createdBy', 'firstName lastName')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: coupons.length,
    coupons,
  });
});

// @desc    Get single coupon
// @route   GET /api/v1/coupons/:id
// @access  Private/Admin
export const getCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('createdBy', 'firstName lastName')
    .populate('usedBy.user', 'firstName lastName email');

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  res.status(200).json({
    success: true,
    coupon,
  });
});

// @desc    Create coupon
// @route   POST /api/v1/coupons
// @access  Private/Admin
export const createCoupon = catchAsync(async (req, res, next) => {
  console.log('Creating coupon with data:', JSON.stringify(req.body, null, 2));
  
  // Set createdBy
  req.body.createdBy = req.user.id;
  
  // Ensure code is uppercase
  if (req.body.code) {
    req.body.code = req.body.code.toUpperCase();
  }
  
  // Handle usageLimit structure
  if (req.body.usageLimit) {
    // Already in correct format
  } else {
    // Build usageLimit from individual fields
    req.body.usageLimit = {};
    if (req.body.usageLimitTotal) {
      req.body.usageLimit.total = parseInt(req.body.usageLimitTotal);
    }
    if (req.body.usageLimitPerUser) {
      req.body.usageLimit.perUser = parseInt(req.body.usageLimitPerUser);
    }
    // Remove the individual fields to avoid duplication
    delete req.body.usageLimitTotal;
    delete req.body.usageLimitPerUser;
  }
  
  // Validate dates
  if (new Date(req.body.startDate) >= new Date(req.body.endDate)) {
    return next(new AppError('End date must be after start date', 400));
  }
  
  // Check for existing coupon
  const existingCoupon = await Coupon.findOne({ code: req.body.code });
  if (existingCoupon) {
    return next(new AppError('Coupon code already exists', 400));
  }
  
  // Create coupon
  const coupon = await Coupon.create(req.body);
  
  logger.info(`Coupon created: ${coupon.code} by admin ${req.user.id}`);
  
  res.status(201).json({
    success: true,
    coupon,
  });
});

// @desc    Update coupon
// @route   PATCH /api/v1/coupons/:id
// @access  Private/Admin
export const updateCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  logger.info(`Coupon updated: ${coupon.code} by admin ${req.user.id}`);

  res.status(200).json({
    success: true,
    coupon,
  });
});

// @desc    Delete coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin
export const deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  // Soft delete - deactivate
  coupon.status = 'inactive';
  await coupon.save();

  logger.info(`Coupon deactivated: ${coupon.code} by admin ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'Coupon deactivated successfully',
  });
});

// @desc    Get coupon statistics
// @route   GET /api/v1/coupons/stats
// @access  Private/Admin
export const getCouponStats = catchAsync(async (req, res, next) => {
  const stats = await Coupon.aggregate([
    {
      $group: {
        _id: null,
        totalCoupons: { $sum: 1 },
        activeCoupons: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
        },
        totalUses: { $sum: '$usedCount' },
        averageDiscount: { $avg: '$value' },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    stats: stats[0] || {},
  });
});