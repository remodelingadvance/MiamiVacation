import { Booking, Property, Coupon, User } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import emailService from '../utils/emailService.js';
import { calculateTotalPrice, generateBookingNumber } from '../utils/helpers.js';
import stripe from '../config/stripe.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

// @desc    Create booking
// @route   POST /api/v1/bookings
// @access  Private
export const createBooking = catchAsync(async (req, res, next) => {
  const { propertyId, checkIn, checkOut, guests, couponCode, specialRequests, paymentMethodId, guestDetails } = req.body;

  console.log('Creating booking with data:', { propertyId, checkIn, checkOut, guests, guestDetails });

  // Validate required fields
  if (!propertyId || !checkIn || !checkOut || !guests) {
    return next(new AppError('Missing required booking information', 400));
  }

  // Get property
  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  if (property.status !== 'active') {
    return next(new AppError('Property is not available for booking', 400));
  }

  // STRICT availability check - no overlapping dates allowed
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  const conflictingBookings = await Booking.find({
    property: propertyId,
    status: { $in: ['confirmed', 'active', 'pending'] },
    $or: [
      {
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      },
    ],
  });

  if (conflictingBookings.length > 0) {
    return next(new AppError('Property is not available for these dates. Please select different dates.', 400));
  }

  // Check guest capacity
  const totalGuests = (guests.adults || 0) + (guests.children || 0);
  if (totalGuests > property.details.maxGuests) {
    return next(new AppError(`Maximum guests allowed is ${property.details.maxGuests}`, 400));
  }

  // Calculate nights
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  
  // Check minimum stay
  if (nights < property.pricing.minimumStay) {
    return next(new AppError(`Minimum stay is ${property.pricing.minimumStay} nights`, 400));
  }

  // Calculate pricing
  const basePrice = property.pricing.basePrice;
  let pricing = calculateTotalPrice(basePrice, nights, {
    cleaningFee: property.pricing.cleaningFee || 0,
    serviceFee: property.pricing.serviceFee || 0,
    taxRate: property.pricing.taxRate || 13.5,
  });

  // Apply coupon if provided
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      status: 'active',
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (coupon) {
      let discountAmount = 0;
      if (coupon.type === 'percentage') {
        discountAmount = (pricing.baseTotal * coupon.value) / 100;
      } else {
        discountAmount = coupon.value;
      }
      
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
      
      pricing.discount = Math.round(discountAmount * 100) / 100;
      pricing.coupon = {
        code: coupon.code,
        discount: pricing.discount,
        type: coupon.type,
      };
      pricing.total = Math.round((pricing.total - pricing.discount) * 100) / 100;
    }
  }

  // Generate booking number
  const bookingNumber = `MIA${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  // Create booking with guest details
  const booking = await Booking.create({
    bookingNumber,
    user: req.user.id,
    property: propertyId,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: {
      adults: guests.adults || 1,
      children: guests.children || 0,
      infants: guests.infants || 0,
    },
    status: 'confirmed',
    payment: {
      status: 'pending',
      method: 'stripe',
      amountPaid: pricing.total,
    },
    pricing: {
      nightlyRate: basePrice,
      nights: nights,
      baseTotal: pricing.baseTotal,
      cleaningFee: pricing.cleaningFee,
      serviceFee: pricing.serviceFee,
      taxes: pricing.taxes,
      discount: pricing.discount || 0,
      coupon: pricing.coupon,
      subtotal: pricing.subtotal,
      total: pricing.total,
    },
    specialRequests: specialRequests || '',
    guestsInfo: {
      primaryGuest: {
        firstName: guestDetails?.firstName || req.user.firstName,
        lastName: guestDetails?.lastName || req.user.lastName,
        email: guestDetails?.email || req.user.email,
        phone: guestDetails?.phone || req.user.phone,
      },
      additionalGuests: [],
    },
    metadata: {
      source: 'direct',
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });

  // Add booking to property
  if (!property.bookings) property.bookings = [];
  property.bookings.push(booking._id);
  await property.save();

  // Add booking to user
  const user = await User.findById(req.user.id);
  if (!user.bookings) user.bookings = [];
  user.bookings.push(booking._id);
  await user.save();

  logger.info(`Booking created: ${booking.bookingNumber} by user ${req.user.id}`);

  res.status(201).json({
    success: true,
    booking,
  });
});

// @desc    Get user bookings
// @route   GET /api/v1/bookings/my-bookings
// @access  Private
export const getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate('property', 'name slug images type location')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookings.length,
    bookings,
  });
});

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
export const getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('property', 'name slug images type location houseRules')
    .populate('user', 'firstName lastName email phone');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if user owns the booking or is admin
  if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only view your own bookings', 403));
  }

  res.status(200).json({
    success: true,
    booking,
  });
});

// @desc    Cancel booking
// @route   PATCH /api/v1/bookings/:id/cancel
// @access  Private
export const cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check ownership
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only cancel your own bookings', 403));
  }

  // Check if booking can be cancelled
  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return next(new AppError('Booking cannot be cancelled', 400));
  }

  // Calculate refund
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const daysUntilCheckIn = Math.ceil((checkIn - now) / (1000 * 60 * 60 * 24));

  let refundAmount = 0;
  let cancellationFee = 0;

  if (daysUntilCheckIn > 30) {
    refundAmount = booking.pricing.total;
  } else if (daysUntilCheckIn > 14) {
    refundAmount = booking.pricing.total * 0.5;
    cancellationFee = booking.pricing.total * 0.5;
  } else if (daysUntilCheckIn > 7) {
    refundAmount = booking.pricing.total * 0.25;
    cancellationFee = booking.pricing.total * 0.75;
  } else {
    refundAmount = 0;
    cancellationFee = booking.pricing.total;
  }

  // Process refund if applicable
  if (refundAmount > 0 && booking.payment.stripePaymentIntentId) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: booking.payment.stripePaymentIntentId,
        amount: Math.round(refundAmount * 100),
      });

      booking.payment.amountRefunded = refundAmount;
      booking.payment.refundedAt = new Date();
      booking.payment.status = refundAmount === booking.pricing.total ? 'refunded' : 'partially_refunded';
    } catch (error) {
      logger.error('Refund failed:', error);
    }
  }

  // Update booking
  booking.status = 'cancelled';
  booking.cancellation = {
    cancelledAt: now,
    cancelledBy: req.user.id,
    reason: req.body.reason || 'Cancelled by user',
    refundAmount,
    cancellationFee,
  };

  await booking.save();

  logger.info(`Booking cancelled: ${booking.bookingNumber} by user ${req.user.id}`);

  res.status(200).json({
    success: true,
    booking,
  });
});

// @desc    Admin - Get all bookings
// @route   GET /api/v1/bookings/admin/all
// @access  Private/Admin
export const getAllBookings = catchAsync(async (req, res, next) => {
  const { property, status, page = 1, limit = 20 } = req.query;
  
  const query = {};
  if (property) query.property = property;
  if (status) query.status = status;

  const bookings = await Booking.find(query)
    .populate('user', 'firstName lastName email')
    .populate('property', 'name type slug')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(query);

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
    bookings,
  });
});

// @desc    Admin - Update booking status
// @route   PATCH /api/v1/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  logger.info(`Booking status updated: ${booking.bookingNumber} to ${status} by admin ${req.user.id}`);

  res.status(200).json({
    success: true,
    booking,
  });
});