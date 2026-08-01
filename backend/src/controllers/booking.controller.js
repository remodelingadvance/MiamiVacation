// controllers/booking.controller.js - Complete updated version
import { Booking, Property, Coupon, User, Notification } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import emailService from '../utils/emailService.js';
import { generateBookingNumber } from '../utils/helpers.js';
import {
  calculatePriceBreakdown,
  calculateStayPricing,
  dateKeyToUTCDate,
} from '../utils/rateCalendar.js';
import { createBookingInvoicePdf } from '../utils/bookingInvoicePdf.js';
import stripe from '../config/stripe.js';
import logger from '../utils/logger.js';

const hasAdminBookingAccess = (user) => ['admin', 'super-admin'].includes(user?.role);
const phoneRegex = /^\+?[0-9\s().-]{7,20}$/;

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');

const buildPrimaryGuest = (guestDetails = {}, user = {}) => {
  const nestedAddress = typeof guestDetails.address === 'object' && guestDetails.address !== null
    ? guestDetails.address
    : {};
  const street = cleanText(nestedAddress.street || guestDetails.street || guestDetails.address);

  return {
    firstName: cleanText(guestDetails.firstName) || user.firstName,
    lastName: cleanText(guestDetails.lastName) || user.lastName,
    email: cleanText(guestDetails.email).toLowerCase() || user.email,
    phone: cleanText(guestDetails.phone || user.phone),
    address: {
      street,
      city: cleanText(nestedAddress.city || guestDetails.city),
      state: cleanText(nestedAddress.state || guestDetails.state),
      postalCode: cleanText(nestedAddress.postalCode || guestDetails.postalCode),
      country: cleanText(nestedAddress.country || guestDetails.country) || 'US',
    },
  };
};

const getPrimaryGuestValidationError = (primaryGuest) => {
  if (!primaryGuest.phone) {
    return 'Customer phone number is required for booking';
  }

  if (!phoneRegex.test(primaryGuest.phone)) {
    return 'Please provide a valid customer phone number';
  }

  if (!primaryGuest.address.street || !primaryGuest.address.city || !primaryGuest.address.postalCode || !primaryGuest.address.country) {
    return 'Customer address, city, postal code, and country are required for booking';
  }

  return null;
};

// @desc    Create booking
// @route   POST /api/v1/bookings
// @access  Private
export const createBooking = catchAsync(async (req, res, next) => {
  const { 
    propertyId, 
    checkIn, 
    checkOut, 
    guests, 
    couponCode, 
    specialRequests, 
    paymentMethodId, 
    guestDetails 
  } = req.body;

  logger.debug('Creating booking request', { propertyId, checkIn, checkOut, guests });

  // Validate required fields
  if (!propertyId || !checkIn || !checkOut || !guests) {
    return next(new AppError('Missing required booking information', 400));
  }

  const primaryGuest = buildPrimaryGuest(guestDetails, req.user);
  const primaryGuestError = getPrimaryGuestValidationError(primaryGuest);
  if (primaryGuestError) {
    return next(new AppError(primaryGuestError, 400));
  }

  // Get property
  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  if (property.status !== 'active') {
    return next(new AppError('Property is not available for booking', 400));
  }

  // Parse dates
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  if (checkInDate >= checkOutDate) {
    return next(new AppError('Check-out date must be after check-in date', 400));
  }

  if (checkInDate < new Date()) {
    return next(new AppError('Check-in date cannot be in the past', 400));
  }

  // Check for maintenance dates FIRST
  const maintenanceDates = property.maintenanceDates || [];
  const isUnderMaintenance = maintenanceDates.some(md => {
    const maintenanceStart = new Date(md.startDate);
    const maintenanceEnd = new Date(md.endDate);
    // Check if the booking dates overlap with any maintenance period
    return (checkInDate <= maintenanceEnd && checkOutDate >= maintenanceStart);
  });

  if (isUnderMaintenance) {
    return next(new AppError(
      'Property is under maintenance during selected dates. Please choose different dates.', 
      400
    ));
  }

  // Check for conflicting bookings
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

  // Calculate day-wise pricing from the property rate calendar
  const stayPricing = calculateStayPricing(property, checkIn, checkOut);
  const nights = stayPricing.nights;

  const blockedDay = stayPricing.dailyRates.find((day) => day.isAvailable === false);
  if (blockedDay) {
    return next(new AppError(
      `Property is unavailable on ${blockedDay.date}. Please choose different dates.`,
      400
    ));
  }

  // Check minimum stay, including day-specific overrides
  if (nights < stayPricing.minimumStay) {
    return next(new AppError(`Minimum stay is ${stayPricing.minimumStay} nights`, 400));
  }

  let pricing = calculatePriceBreakdown(stayPricing.baseTotal, nights, {
    cleaningFee: property.pricing.cleaningFee || 0,
    serviceFee: property.pricing.serviceFee || 0,
    taxRate: property.pricing.taxRate || 13.5,
  });

  // Apply coupon if provided
  let coupon = null;
  if (couponCode) {
    const now = new Date();
    coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      status: 'active',
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { validFrom: { $lte: now }, validUntil: { $gte: now } },
      ],
    });

    if (coupon) {
      let discountAmount = 0;
      if (coupon.type === 'percentage') {
        discountAmount = (pricing.baseTotal * coupon.value) / 100;
      } else {
        discountAmount = coupon.value;
      }
      
      const maxDiscount = coupon.maximumDiscount || coupon.maxDiscount;
      if (maxDiscount && discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
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

  const bookingNumber = generateBookingNumber();

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
      status: 'paid',
      method: 'stripe',
      amountPaid: pricing.total,
      paidAt: new Date(),
    },
    pricing: {
      nightlyRate: pricing.nightlyRate,
      nights: nights,
      baseTotal: pricing.baseTotal,
      cleaningFee: pricing.cleaningFee,
      serviceFee: pricing.serviceFee,
      taxes: pricing.taxes,
      discount: pricing.discount || 0,
      coupon: pricing.coupon,
      subtotal: pricing.subtotal,
      total: pricing.total,
      dailyRates: stayPricing.dailyRates.map((day) => ({
        date: dateKeyToUTCDate(day.date),
        price: day.price,
        source: day.source,
      })),
      currency: stayPricing.currency,
    },
    specialRequests: specialRequests || '',
    guestsInfo: {
      primaryGuest,
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
  user.phone = primaryGuest.phone;
  user.address = {
    ...(user.address?.toObject?.() || user.address || {}),
    street: primaryGuest.address.street,
    city: primaryGuest.address.city,
    state: primaryGuest.address.state,
    zipCode: primaryGuest.address.postalCode,
    country: primaryGuest.address.country,
  };
  await user.save();

  // Create notification for admin
  await Notification.createNotification({
    type: 'new_booking',
    title: 'New Booking Received',
    message: `New booking #${booking.bookingNumber} for ${property.name} by ${primaryGuest.firstName} ${primaryGuest.lastName}`,
    priority: 'high',
    data: {
      bookingId: booking._id,
      propertyId: property._id,
      bookingNumber: booking.bookingNumber,
      amount: pricing.total,
      guests: totalGuests,
      nights: nights,
    },
    link: `/admin/bookings/${booking._id}`,
  });

  // Send confirmation email
  try {
    await emailService.send({
      to: primaryGuest.email,
      subject: `Booking Confirmed - ${bookingNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Booking Confirmed! 🎉</h2>
          <p>Dear ${primaryGuest.firstName},</p>
          <p>Your booking has been confirmed. Here are the details:</p>
          <ul>
            <li><strong>Booking Number:</strong> ${bookingNumber}</li>
            <li><strong>Property:</strong> ${property.name}</li>
            <li><strong>Check-in:</strong> ${checkInDate.toLocaleDateString()}</li>
            <li><strong>Check-out:</strong> ${checkOutDate.toLocaleDateString()}</li>
            <li><strong>Total Amount:</strong> $${pricing.total}</li>
          </ul>
          <p>Thank you for choosing Miami Luxury Rentals!</p>
        </div>
      `,
    });
  } catch (error) {
    logger.error('Email sending failed:', error);
  }

  logger.info(`Booking created: ${booking.bookingNumber} by user ${req.user.id}`);

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    booking,
  });
});

// @desc    Update booking status
// @route   PATCH /api/v1/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id).populate('property user');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  const oldStatus = booking.status;
  booking.status = status;
  
  if (status === 'completed') {
    booking.payment.status = 'paid';
  }
  
  await booking.save();

  // Create notification for status change
  let title = '', message = '', priority = 'medium';
  
  if (status === 'confirmed' && oldStatus !== 'confirmed') {
    title = 'Booking Confirmed';
    message = `Booking #${booking.bookingNumber} for ${booking.property.name} has been confirmed`;
    priority = 'high';
  } else if (status === 'cancelled' && oldStatus !== 'cancelled') {
    title = 'Booking Cancelled';
    message = `Booking #${booking.bookingNumber} for ${booking.property.name} has been cancelled`;
    priority = 'urgent';
  } else if (status === 'completed') {
    title = 'Booking Completed';
    message = `Booking #${booking.bookingNumber} for ${booking.property.name} has been completed`;
    priority = 'medium';
  }

  if (title) {
    await Notification.createNotification({
      type: status === 'cancelled' ? 'booking_cancelled' : status === 'confirmed' ? 'booking_confirmed' : 'booking_completed',
      title,
      message,
      priority,
      data: {
        bookingId: booking._id,
        propertyId: booking.property._id,
        bookingNumber: booking.bookingNumber,
        oldStatus,
        newStatus: status,
      },
      link: `/admin/bookings/${booking._id}`,
    });
  }

  logger.info(`Booking status updated: ${booking.bookingNumber} to ${status} by admin ${req.user.id}`);

  res.status(200).json({
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
    .populate('user', 'firstName lastName email phone address');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if user owns the booking or is admin
  if (booking.user?._id?.toString() !== req.user.id && !hasAdminBookingAccess(req.user)) {
    return next(new AppError('You can only view your own bookings', 403));
  }

  // If admin is viewing, mark as viewed
  if (hasAdminBookingAccess(req.user)) {
    if (!booking.viewedByAdmin) {
      booking.viewedByAdmin = true;
      booking.viewedAt = new Date();
      booking.viewedBy = req.user.id;
      await booking.save();
    }
  }

  res.status(200).json({
    success: true,
    booking,
  });
});

// @desc    Download booking invoice PDF
// @route   GET /api/v1/bookings/:id/invoice
// @access  Private
export const downloadBookingInvoice = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('property', 'name slug images type location houseRules')
    .populate('user', 'firstName lastName email phone address');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.user?._id?.toString() !== req.user.id && !hasAdminBookingAccess(req.user)) {
    return next(new AppError('You can only download your own booking invoice', 403));
  }

  const pdfBuffer = createBookingInvoicePdf(booking);
  const fileName = `stay-wise-invoice-${booking.bookingNumber}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', pdfBuffer.length);
  res.status(200).send(pdfBuffer);
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
  if (booking.user.toString() !== req.user.id && !hasAdminBookingAccess(req.user)) {
    return next(new AppError('You can only cancel your own bookings', 403));
  }

  // Check if booking can be cancelled
  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return next(new AppError('Booking cannot be cancelled', 400));
  }

  // Calculate refund based on cancellation policy
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const daysUntilCheckIn = Math.ceil((checkIn - now) / (1000 * 60 * 60 * 24));

  let refundAmount = 0;
  let cancellationFee = 0;

  if (daysUntilCheckIn > 30) {
    refundAmount = booking.pricing.total;
    cancellationFee = 0;
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
    message: 'Booking cancelled successfully',
    booking,
  });
});

// @desc    Admin - Get all bookings with pending count
// @route   GET /api/v1/bookings/admin/all
// @access  Private/Admin
export const getAllBookings = catchAsync(async (req, res, next) => {
  const { property, status, page = 1, limit = 20 } = req.query;
  
  const query = {};
  if (property) query.property = property;
  if (status) query.status = status;

  const bookings = await Booking.find(query)
    .populate('user', 'firstName lastName email phone address')
    .populate('property', 'name type slug')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(query);
  
  // Get pending bookings count for badge
  const pendingBookingsCount = await Booking.countDocuments({ 
    status: { $in: ['pending', 'confirmed'] },
    viewedByAdmin: { $ne: true }
  });

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    pendingCount: pendingBookingsCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
    bookings,
  });
});

// @desc    Mark all pending bookings as viewed
// @route   POST /api/v1/bookings/mark-all-viewed
// @access  Private/Admin
export const markAllAsViewed = catchAsync(async (req, res, next) => {
  const result = await Booking.updateMany(
    { 
      status: { $in: ['pending', 'confirmed'] },
      viewedByAdmin: { $ne: true }
    },
    { 
      viewedByAdmin: true, 
      viewedAt: new Date(),
      viewedBy: req.user.id
    }
  );
  
  logger.info(`Marked ${result.modifiedCount} bookings as viewed by admin ${req.user.id}`);
  
  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} bookings marked as viewed`,
    modifiedCount: result.modifiedCount,
  });
});

// @desc    Get pending bookings count (for badge)
// @route   GET /api/v1/bookings/pending-count
// @access  Private/Admin
export const getPendingBookingsCount = catchAsync(async (req, res, next) => {
  const count = await Booking.countDocuments({ 
    status: { $in: ['pending', 'confirmed'] },
    viewedByAdmin: false 
  });
  
  res.status(200).json({
    success: true,
    count,
  });
});

// @desc    Mark single booking as viewed
// @route   POST /api/v1/bookings/:id/viewed
// @access  Private/Admin
export const markBookingViewed = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }
  
  if (!booking.viewedByAdmin) {
    booking.viewedByAdmin = true;
    booking.viewedAt = new Date();
    booking.viewedBy = req.user.id;
    await booking.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Booking marked as viewed',
  });
});

// @desc    Check booking availability (including maintenance)
// @route   GET /api/v1/bookings/check-availability
// @access  Public
export const checkAvailability = catchAsync(async (req, res, next) => {
  const { propertyId, checkIn, checkOut } = req.query;

  if (!propertyId || !checkIn || !checkOut) {
    return next(new AppError('Property ID, check-in and check-out dates are required', 400));
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const stayPricing = calculateStayPricing(property, checkIn, checkOut);
  const blockedDay = stayPricing.dailyRates.find((day) => day.isAvailable === false);

  if (blockedDay) {
    return res.status(200).json({
      success: true,
      isAvailable: false,
      reason: 'blocked',
      message: `Property is unavailable on ${blockedDay.date}`,
      pricing: {
        nights: stayPricing.nights,
        baseTotal: stayPricing.baseTotal,
        averageNightlyRate: stayPricing.averageNightlyRate,
        dailyRates: stayPricing.dailyRates,
      },
    });
  }

  if (stayPricing.nights < stayPricing.minimumStay) {
    return res.status(200).json({
      success: true,
      isAvailable: false,
      reason: 'minimum_stay',
      message: `Minimum stay is ${stayPricing.minimumStay} nights`,
      minimumStay: stayPricing.minimumStay,
      pricing: {
        nights: stayPricing.nights,
        baseTotal: stayPricing.baseTotal,
        averageNightlyRate: stayPricing.averageNightlyRate,
        dailyRates: stayPricing.dailyRates,
      },
    });
  }

  // Check maintenance dates
  const maintenanceDates = property.maintenanceDates || [];
  const isUnderMaintenance = maintenanceDates.some(md => {
    const maintenanceStart = new Date(md.startDate);
    const maintenanceEnd = new Date(md.endDate);
    return (checkInDate <= maintenanceEnd && checkOutDate >= maintenanceStart);
  });

  if (isUnderMaintenance) {
    return res.status(200).json({
      success: true,
      isAvailable: false,
      reason: 'maintenance',
      message: 'Property is under maintenance during selected dates',
      pricing: {
        nights: stayPricing.nights,
        baseTotal: stayPricing.baseTotal,
        averageNightlyRate: stayPricing.averageNightlyRate,
        dailyRates: stayPricing.dailyRates,
      },
    });
  }

  // Check conflicting bookings
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

  const isAvailable = conflictingBookings.length === 0;

  res.status(200).json({
    success: true,
    isAvailable,
    reason: isAvailable ? null : 'booked',
    conflictingBookings: conflictingBookings.length,
    minimumStay: stayPricing.minimumStay,
    pricing: {
      nights: stayPricing.nights,
      baseTotal: stayPricing.baseTotal,
      averageNightlyRate: stayPricing.averageNightlyRate,
      dailyRates: stayPricing.dailyRates,
    },
    maintenanceDates: maintenanceDates.filter(md => 
      (checkInDate <= new Date(md.endDate) && checkOutDate >= new Date(md.startDate))
    )
  });
});
