import { Booking, Property, Coupon } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import emailService from '../utils/emailService.js';
import { calculateTotalPrice } from '../utils/helpers.js';
import stripe from '../config/stripe.js';
import logger from '../utils/logger.js';

// @desc    Create booking
// @route   POST /api/v1/bookings
// @access  Private
export const createBooking = catchAsync(async (req, res, next) => {
  const { propertyId, checkIn, checkOut, guests, couponCode, specialRequests } = req.body;

  // Get property
  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  if (property.status !== 'active') {
    return next(new AppError('Property is not available for booking', 400));
  }

  // Check availability
  const conflictingBookings = await Booking.find({
    property: propertyId,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      {
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) },
      },
    ],
  });

  if (conflictingBookings.length > 0) {
    return next(new AppError('Property is not available for these dates', 400));
  }

  // Check guest capacity
  const totalGuests = (guests.adults || 0) + (guests.children || 0);
  if (totalGuests > property.details.maxGuests) {
    return next(new AppError(`Maximum guests allowed is ${property.details.maxGuests}`, 400));
  }

  // Check minimum stay
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  if (nights < property.pricing.minimumStay) {
    return next(new AppError(`Minimum stay is ${property.pricing.minimumStay} nights`, 400));
  }

  // Calculate pricing
  const basePrice = property.pricing.basePrice;
  let pricing = calculateTotalPrice(basePrice, nights, {
    cleaningFee: property.pricing.cleaningFee,
    serviceFee: property.pricing.serviceFee,
    taxRate: property.pricing.taxRate,
  });

  // Apply coupon if provided
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      status: 'active',
    });

    if (!coupon) {
      return next(new AppError('Invalid or expired coupon code', 400));
    }

    const validation = coupon.isValid(
      pricing.baseTotal,
      nights,
      req.user.id,
      propertyId
    );

    if (!validation.valid) {
      return next(new AppError(validation.message, 400));
    }

    const discount = coupon.calculateDiscount(pricing.baseTotal);
    pricing.discount = discount;
    pricing.coupon = {
      code: coupon.code,
      discount,
      type: coupon.type,
    };
    pricing.total -= discount;
  }

  // Create booking
  const booking = await Booking.create({
    user: req.user.id,
    property: propertyId,
    checkIn,
    checkOut,
    guests: {
      adults: guests.adults || 1,
      children: guests.children || 0,
      infants: guests.infants || 0,
    },
    pricing: {
      nightlyRate: basePrice,
      nights,
      baseTotal: pricing.baseTotal,
      cleaningFee: pricing.cleaningFee,
      serviceFee: pricing.serviceFee,
      taxes: pricing.tax,
      discount: pricing.discount || 0,
      coupon: pricing.coupon,
      subtotal: pricing.subtotal,
      total: pricing.total,
    },
    specialRequests,
    guestsInfo: {
      primaryGuest: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
      },
    },
    metadata: {
      source: 'direct',
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });

  // Update coupon usage
  if (coupon) {
    coupon.usedCount += 1;
    coupon.usedBy.push({
      user: req.user.id,
      booking: booking._id,
    });
    await coupon.save();
  }

  // Add booking to property
  property.bookings.push(booking._id);
  await property.save();

  // Add booking to user
  req.user.bookings.push(booking._id);
  await req.user.save();

  // Send booking confirmation email
  try {
    await emailService.sendBookingConfirmation(booking, req.user);
  } catch (error) {
    logger.error('Booking confirmation email failed:', error);
  }

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
    .populate('property')
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
    .populate('property')
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
        amount: Math.round(refundAmount * 100), // Stripe uses cents
      });

      booking.payment.amountRefunded = refundAmount;
      booking.payment.refundedAt = new Date();
      booking.payment.status = refundAmount === booking.pricing.total ? 'refunded' : 'partially_refunded';
    } catch (error) {
      logger.error('Refund failed:', error);
      return next(new AppError('Refund processing failed. Please contact support.', 500));
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

  // Send cancellation email
  try {
    await emailService.send({
      to: req.user.email,
      subject: `Booking Cancelled - ${booking.bookingNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff6b6b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Cancelled</h1>
            </div>
            <div class="content">
              <h2>Hello ${req.user.firstName},</h2>
              <p>Your booking ${booking.bookingNumber} has been cancelled.</p>
              <p>Refund Amount: $${refundAmount.toFixed(2)}</p>
              <p>Cancellation Fee: $${cancellationFee.toFixed(2)}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    logger.error('Cancellation email failed:', error);
  }

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
  const bookings = await Booking.find()
    .populate('user', 'firstName lastName email')
    .populate('property', 'name type')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookings.length,
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