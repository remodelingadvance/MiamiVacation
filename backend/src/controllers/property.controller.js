import mongoose from 'mongoose';
import { Property, Review, Booking } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import ApiFeatures from '../utils/ApiFeatures.js';
import logger from '../utils/logger.js';
import {
  addDaysToKey,
  buildRateCalendar,
  calculateStayPricing,
  dateKeyToUTCDate,
  getDateKeysBetween,
  toDateKey,
} from '../utils/rateCalendar.js';

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');

const buildPropertyImageAlt = (propertyData, index) => {
  const name = cleanText(propertyData.name) || 'Stay Wise Miami vacation rental';
  const location = propertyData.location || {};
  const locationLabel = [
    cleanText(location.neighborhood),
    cleanText(location.city) || 'Miami',
    cleanText(location.state),
  ].filter(Boolean).join(', ');

  return `${name}${locationLabel ? ` in ${locationLabel}` : ''} - vacation rental photo ${index + 1}`;
};

const normalizePropertyImageAltText = (propertyData) => {
  if (!Array.isArray(propertyData.images)) return propertyData;

  propertyData.images = propertyData.images.map((image, index) => ({
    ...image,
    alt: cleanText(image.alt) || buildPropertyImageAlt(propertyData, index),
  }));

  return propertyData;
};
// @desc    Get all properties
// @route   GET /api/v1/properties
// @access  Public
export const getProperties = catchAsync(async (req, res, next) => {
  // Build query
  const features = new ApiFeatures(Property.find({ status: 'active' }), req.query)
    .filter()
    .search(['name', 'description.short', 'location.address', 'location.neighborhood'])
    .sort()
    .limitFields()
    .paginate();

  const properties = await features.query
    .populate('reviews')
    .lean();

  // Get total count for pagination
  const total = await Property.countDocuments({ status: 'active' });

  res.status(200).json({
    success: true,
    count: properties.length,
    total,
    pagination: {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      totalPages: Math.ceil(total / (parseInt(req.query.limit) || 10)),
    },
    properties,
  });
});

// @desc    Get featured properties
// @route   GET /api/v1/properties/featured
// @access  Public
export const getFeaturedProperties = catchAsync(async (req, res, next) => {
  const properties = await Property.find({
    featured: true,
    status: 'active',
  })
    .sort('-priority -ratings.average')
    .limit(8)
    .populate('reviews')
    .lean();

  res.status(200).json({
    success: true,
    count: properties.length,
    properties,
  });
});

// @desc    Get active property neighborhoods with counts
// @route   GET /api/v1/properties/neighborhoods
// @access  Public
export const getPropertyNeighborhoods = catchAsync(async (req, res, next) => {
  const neighborhoods = await Property.aggregate([
    {
      $match: {
        status: 'active',
        'location.neighborhood': { $exists: true, $type: 'string' },
      },
    },
    {
      $addFields: {
        normalizedNeighborhood: { $trim: { input: '$location.neighborhood' } },
      },
    },
    {
      $match: {
        normalizedNeighborhood: { $ne: '' },
      },
    },
    {
      $sort: {
        featured: -1,
        priority: -1,
        createdAt: -1,
      },
    },
    {
      $group: {
        _id: '$normalizedNeighborhood',
        count: { $sum: 1 },
        city: { $first: '$location.city' },
        image: { $first: { $arrayElemAt: ['$images.url', 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        neighborhood: '$_id',
        city: 1,
        count: 1,
        image: 1,
      },
    },
    {
      $sort: {
        count: -1,
        neighborhood: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    count: neighborhoods.length,
    neighborhoods,
  });
});

// @desc    Get single property
// @route   GET /api/v1/properties/:id
// @access  Public
export const getProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id)
    .populate({
      path: 'reviews',
      match: { status: 'approved' },
      options: { sort: { createdAt: -1 }, limit: 10 },
      populate: {
        path: 'user',
        select: 'firstName lastName avatar',
      },
    })
    .populate('bookings');

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Get similar properties
  const similarProperties = await Property.find({
    _id: { $ne: property._id },
    type: property.type,
    status: 'active',
    'pricing.basePrice': {
      $gte: property.pricing.basePrice * 0.7,
      $lte: property.pricing.basePrice * 1.3,
    },
  })
    .limit(4)
    .sort('-ratings.average')
    .lean();

  res.status(200).json({
    success: true,
    property,
    similarProperties,
  });
});

// @desc    Get property by slug
// @route   GET /api/v1/properties/slug/:slug
// @access  Public
export const getPropertyBySlug = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({ slug: req.params.slug })
    .populate({
      path: 'reviews',
      match: { status: 'approved' },
      options: { sort: { createdAt: -1 }, limit: 10 },
      populate: {
        path: 'user',
        select: 'firstName lastName avatar',
      },
    });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  res.status(200).json({
    success: true,
    property,
  });
});

// @desc    Create property
// @route   POST /api/v1/properties
// @access  Private/Admin
export const createProperty = catchAsync(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  normalizePropertyImageAltText(req.body);

  const property = await Property.create(req.body);

  logger.info(`Property created: ${property.name} by user ${req.user.id}`);

  res.status(201).json({
    success: true,
    property,
  });
});

// @desc    Update property
// @route   PATCH /api/v1/properties/:id
// @access  Private/Admin
export const updateProperty = catchAsync(async (req, res, next) => {
  req.body.updatedBy = req.user.id;
  normalizePropertyImageAltText(req.body);

  const property = await Property.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  logger.info(`Property updated: ${property.name} by user ${req.user.id}`);

  res.status(200).json({
    success: true,
    property,
  });
});

// @desc    Delete property
// @route   DELETE /api/v1/properties/:id
// @access  Private/Admin
export const deleteProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Soft delete - change status to inactive
  property.status = 'inactive';
  await property.save();

  logger.info(`Property deactivated: ${property.name} by user ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'Property deactivated successfully',
  });
});

// @desc    Search properties
// @route   GET /api/v1/properties/search
// @access  Public
export const searchProperties = catchAsync(async (req, res, next) => {
  const {
    search,
    type,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    guests,
    amenities,
    checkIn,
    checkOut,
    lat,
    lng,
    radius,
    neighborhood,
    neighbourhood,
    sort = "-ratings.average",
    page = 1,
    limit = 12,
  } = req.query;

  const query = { status: "active" };

  const selectedNeighborhood = neighborhood || neighbourhood;

  if (selectedNeighborhood) {
    query["location.neighborhood"] = {
      $regex: selectedNeighborhood,
      $options: "i",
    };
  }

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };

    query.$or = [
      { name: searchRegex },
      { "description.short": searchRegex },
      { "description.full": searchRegex },
      { "location.address": searchRegex },
      { "location.city": searchRegex },
      { "location.neighborhood": searchRegex },
    ];
  }

  if (type) {
    query.type = { $in: type.split(",") };
  }

  if (minPrice || maxPrice) {
    query["pricing.basePrice"] = {};
    if (minPrice) query["pricing.basePrice"].$gte = Number(minPrice);
    if (maxPrice) query["pricing.basePrice"].$lte = Number(maxPrice);
  }

  if (bedrooms) {
    query["details.bedrooms"] = { $gte: Number(bedrooms) };
  }

  if (bathrooms) {
    query["details.bathrooms"] = { $gte: Number(bathrooms) };
  }

  if (guests) {
    query["details.maxGuests"] = { $gte: Number(guests) };
  }

  if (amenities) {
    query["amenities.name"] = { $all: amenities.split(",") };
  }

  if (lat && lng) {
    const earthRadius = 6378.1;
    const searchRadius = Number(radius) || 10;

    query["location.coordinates"] = {
      $geoWithin: {
        $centerSphere: [[Number(lng), Number(lat)], searchRadius / earthRadius],
      },
    };
  }

  if (checkIn && checkOut) {
    query.bookings = {
      $not: {
        $elemMatch: {
          checkIn: { $lt: new Date(checkOut) },
          checkOut: { $gt: new Date(checkIn) },
          status: { $in: ["confirmed", "active", "pending"] },
        },
      },
    };
  }

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const properties = await Property.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limitNumber)
    .populate("reviews")
    .lean();

  const total = await Property.countDocuments(query);

  res.status(200).json({
    success: true,
    count: properties.length,
    total,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
    properties,
  });
});

// @desc    Check property availability
// @route   GET /api/v1/properties/:id/availability
// @access  Public
export const checkAvailability = catchAsync(async (req, res, next) => {
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    return next(new AppError('Please provide checkIn and checkOut dates', 400));
  }

  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const stayPricing = calculateStayPricing(property, checkIn, checkOut);
  const blockedDay = stayPricing.dailyRates.find((day) => day.isAvailable === false);
  const isUnderMaintenance = (property.maintenanceDates || []).some((md) => {
    const maintenanceStart = new Date(md.startDate);
    const maintenanceEnd = new Date(md.endDate);
    return checkInDate <= maintenanceEnd && checkOutDate >= maintenanceStart;
  });

  // Check if property is available for the given dates
  const conflictingBookings = await Booking.find({
    property: property._id,
    status: { $in: ['confirmed', 'active', 'pending'] },
    $or: [
      {
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      },
    ],
  });

  const meetsMinimumStay = stayPricing.nights >= stayPricing.minimumStay;
  const isAvailable =
    conflictingBookings.length === 0 &&
    !isUnderMaintenance &&
    !blockedDay &&
    meetsMinimumStay;

  res.status(200).json({
    success: true,
    isAvailable,
    reason: isAvailable
      ? null
      : isUnderMaintenance
        ? 'maintenance'
        : blockedDay
          ? 'blocked'
          : !meetsMinimumStay
            ? 'minimum_stay'
            : 'booked',
    conflictingBookings: conflictingBookings.length,
    minimumStay: stayPricing.minimumStay,
    pricing: {
      nights: stayPricing.nights,
      baseTotal: stayPricing.baseTotal,
      averageNightlyRate: stayPricing.averageNightlyRate,
      dailyRates: stayPricing.dailyRates,
    },
    bookedDates: conflictingBookings.map(booking => ({
      checkIn: booking.checkIn,
      checkOut: booking.checkOut
    }))
  });
});

// @desc    Get day-wise price and availability calendar
// @route   GET /api/v1/properties/:id/rate-calendar
// @access  Public
export const getRateCalendar = catchAsync(async (req, res, next) => {
  const startDate = toDateKey(req.query.startDate) || toDateKey(new Date());
  const endDate = toDateKey(req.query.endDate) || addDaysToKey(startDate, 365);

  if (startDate > endDate) {
    return next(new AppError('Start date must be before end date', 400));
  }

  const property = await Property.findById(req.params.id).select(
    'name pricing availability maintenanceDates'
  );

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const bookings = await Booking.find({
    property: property._id,
    status: { $in: ['confirmed', 'active', 'pending'] },
    checkIn: { $lt: dateKeyToUTCDate(addDaysToKey(endDate, 1)) },
    checkOut: { $gt: dateKeyToUTCDate(startDate) },
  }).select('checkIn checkOut status');

  const days = buildRateCalendar(property, {
    startDate,
    endDate,
    bookings,
  });

  res.status(200).json({
    success: true,
    propertyId: property._id,
    propertyName: property.name,
    currency: property.pricing?.currency || 'USD',
    basePrice: property.pricing?.basePrice || 0,
    startDate,
    endDate,
    count: days.length,
    days,
  });
});

// @desc    Create/update day-wise price and availability overrides
// @route   PATCH /api/v1/properties/:id/rate-calendar
// @access  Private/Admin
export const updateRateCalendar = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const requestedUpdates = Array.isArray(req.body.updates) ? [...req.body.updates] : [];
  const resetDates = new Set((req.body.removeDates || []).map(toDateKey).filter(Boolean));

  if (!requestedUpdates.length && req.body.startDate && req.body.endDate) {
    const dateKeys = getDateKeysBetween(req.body.startDate, req.body.endDate, true);
    requestedUpdates.push(
      ...dateKeys.map((date) => ({
        date,
        price: req.body.price,
        isAvailable: req.body.isAvailable,
        minimumStay: req.body.minimumStay,
        reset: req.body.reset,
      }))
    );
  }

  if (!requestedUpdates.length && !resetDates.size) {
    return next(new AppError('Please provide calendar updates or dates to reset', 400));
  }

  requestedUpdates.forEach((update) => {
    const dateKey = toDateKey(update.date);

    if (!dateKey) {
      throw new AppError('Each update must include a valid date', 400);
    }

    if (update.reset) {
      resetDates.add(dateKey);
    }
  });

  property.availability = property.availability || [];

  resetDates.forEach((dateKey) => {
    const index = property.availability.findIndex((item) => toDateKey(item.date) === dateKey);
    if (index >= 0) property.availability.splice(index, 1);
  });

  requestedUpdates.forEach((update) => {
    const dateKey = toDateKey(update.date);
    if (update.reset || resetDates.has(dateKey)) return;

    const hasPrice = update.price !== undefined && update.price !== null && update.price !== '';
    const hasMinimumStay =
      update.minimumStay !== undefined && update.minimumStay !== null && update.minimumStay !== '';
    const hasAvailability = typeof update.isAvailable === 'boolean';

    if (!hasPrice && !hasMinimumStay && !hasAvailability) return;

    const nextOverride = {
      date: dateKeyToUTCDate(dateKey),
    };

    if (hasPrice) {
      const price = Number(update.price);
      if (Number.isNaN(price) || price < 0) {
        throw new AppError('Calendar price must be a positive number', 400);
      }
      nextOverride.price = Math.round(price * 100) / 100;
    }

    if (hasMinimumStay) {
      const minimumStay = parseInt(update.minimumStay, 10);
      if (Number.isNaN(minimumStay) || minimumStay < 1) {
        throw new AppError('Minimum stay must be at least 1 night', 400);
      }
      nextOverride.minimumStay = minimumStay;
    }

    if (hasAvailability) {
      nextOverride.isAvailable = update.isAvailable;
    }

    const existing = property.availability.find((item) => toDateKey(item.date) === dateKey);
    if (existing) {
      if (hasPrice) existing.price = nextOverride.price;
      if (hasMinimumStay) existing.minimumStay = nextOverride.minimumStay;
      if (hasAvailability) existing.isAvailable = nextOverride.isAvailable;
    } else {
      property.availability.push({
        isAvailable: true,
        ...nextOverride,
      });
    }
  });

  property.updatedBy = req.user.id;
  await property.save();

  const calendarStart = toDateKey(req.body.calendarStartDate || req.body.startDate) || toDateKey(new Date());
  const calendarEnd =
    toDateKey(req.body.calendarEndDate || req.body.endDate) || addDaysToKey(calendarStart, 365);
  const bookings = await Booking.find({
    property: property._id,
    status: { $in: ['confirmed', 'active', 'pending'] },
    checkIn: { $lt: dateKeyToUTCDate(addDaysToKey(calendarEnd, 1)) },
    checkOut: { $gt: dateKeyToUTCDate(calendarStart) },
  }).select('checkIn checkOut status');

  const days = buildRateCalendar(property, {
    startDate: calendarStart,
    endDate: calendarEnd,
    bookings,
  });

  logger.info(`Rate calendar updated for property ${property.name} by admin ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'Rate calendar updated successfully',
    propertyId: property._id,
    currency: property.pricing?.currency || 'USD',
    days,
  });
});

// @desc    Get property statistics
// @route   GET /api/v1/properties/:id/stats
// @access  Private/Admin
export const getPropertyStats = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id)
    .populate('bookings')
    .populate('reviews');

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Calculate booking stats
  const confirmedBookings = property.bookings.filter(b => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  
  // Get monthly bookings
  const monthlyBookings = {};
  property.bookings.forEach(booking => {
    const month = booking.createdAt.toISOString().slice(0, 7);
    monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;
  });

  const stats = {
    totalBookings: property.bookings.length,
    confirmedBookings: confirmedBookings.length,
    cancelledBookings: property.bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue,
    averageRating: property.ratings.average,
    totalReviews: property.reviews.length,
    occupancyRate: property.bookings.length > 0 ? 
      (property.bookings.filter(b => b.status === 'confirmed').length / property.bookings.length) * 100 : 0,
    monthlyBookings,
    amenitiesCount: property.amenities.length,
    imagesCount: property.images.length,
    nearbyPlacesCount: property.location.nearbyPlaces?.length || 0,
    policiesCount: property.policiesAndNotes?.length || 0,
  };

  res.status(200).json({
    success: true,
    stats,
  });
});

// @desc    Get property bookings for calendar
// @route   GET /api/v1/properties/:id/bookings
// @access  Public
export const getPropertyBookings = async (req, res) => {
  const { id } = req.params;
  
  logger.debug('Get property bookings request');
  logger.debug('Property bookings lookup', { propertyId: id });
  
  try {
    // First, verify the property exists
    const property = await Property.findById(id);
    if (!property) {
      logger.debug('Property not found while fetching bookings', { propertyId: id });
      return res.status(200).json({
        success: true,
        count: 0,
        bookings: []
      });
    }
    
    // Get the Booking model
    const Booking = mongoose.model('Booking');
    
    // Find all bookings for this property with confirmed/active status
    const bookings = await Booking.find({
      property: id,
      status: { $in: ['confirmed', 'active', 'pending'] }
    });
    
    logger.debug('Property bookings found', { propertyId: id, count: bookings.length });
    
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: bookings.map(booking => ({
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status,
        bookingNumber: booking.bookingNumber
      }))
    });
    
  } catch (error) {
    console.error('Error in getPropertyBookings:', error);
    // Always return success true to not break the frontend
    res.status(200).json({
      success: true,
      count: 0,
      bookings: [],
      error: error.message
    });
  }
};

// controllers/property.controller.js - Add these functions

// @desc    Add maintenance dates to property
// @route   POST /api/v1/properties/:id/maintenance-dates
// @access  Private/Admin
export const addMaintenanceDates = catchAsync(async (req, res, next) => {
  const { startDate, endDate, reason, description } = req.body;
  const { id } = req.params;

  if (!startDate || !endDate) {
    return next(new AppError('Please provide start date and end date', 400));
  }

  const property = await Property.findById(id);
  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Parse dates
  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);

  if (newStart > newEnd) {
    return next(new AppError('Start date must be before end date', 400));
  }

  // Check for overlapping maintenance dates
  const overlapping = property.maintenanceDates.some(date => {
    const existingStart = new Date(date.startDate);
    const existingEnd = new Date(date.endDate);
    return (newStart <= existingEnd && newEnd >= existingStart);
  });

  if (overlapping) {
    return next(new AppError('Maintenance dates overlap with existing maintenance period', 400));
  }

  // Add new maintenance date
  property.maintenanceDates.push({
    startDate: newStart,
    endDate: newEnd,
    reason: reason || 'maintenance',
    description: description || '',
    createdBy: req.user.id,
    createdAt: new Date()
  });

  await property.save();

  logger.info(`Maintenance dates added to property ${property.name} by admin ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'Maintenance dates added successfully',
    maintenanceDates: property.maintenanceDates
  });
});

// @desc    Remove maintenance date
// @route   DELETE /api/v1/properties/:id/maintenance-dates/:dateId
// @access  Private/Admin
export const removeMaintenanceDate = catchAsync(async (req, res, next) => {
  const { id, dateId } = req.params;

  const property = await Property.findById(id);
  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const maintenanceDateIndex = property.maintenanceDates.findIndex(
    date => date._id.toString() === dateId
  );

  if (maintenanceDateIndex === -1) {
    return next(new AppError('Maintenance date not found', 404));
  }

  property.maintenanceDates.splice(maintenanceDateIndex, 1);
  await property.save();

  logger.info(`Maintenance date removed from property ${property.name} by admin ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'Maintenance date removed successfully',
    maintenanceDates: property.maintenanceDates
  });
});

// @desc    Get all maintenance dates for a property
// @route   GET /api/v1/properties/:id/maintenance-dates
// @access  Public
export const getMaintenanceDates = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id).select('maintenanceDates name');

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  res.status(200).json({
    success: true,
    maintenanceDates: property.maintenanceDates || [],
    propertyName: property.name
  });
});

// @desc    Get all properties with filter for maintenance mode
// @route   GET /api/v1/properties/admin/all-with-filter
// @access  Private/Admin
export const getAllPropertiesWithFilter = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, statusFilter = 'all', search } = req.query;

  let query = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
  
  logger.debug('Maintenance filter date prepared', { today });
  
  // Apply status filter based on the selected filter
  if (statusFilter === 'active') {
    // Active properties: status = 'active' AND no active maintenance
    query = {
      status: 'active',
      $or: [
        { maintenanceDates: { $exists: false } },
        { maintenanceDates: { $size: 0 } },
        {
          maintenanceDates: {
            $not: {
              $elemMatch: {
                startDate: { $lte: today },
                endDate: { $gte: today }
              }
            }
          }
        }
      ]
    };
  } 
  else if (statusFilter === 'maintenance_mode') {
    // Properties currently under maintenance (has active maintenance dates)
    query = {
      $or: [
        {
          maintenanceDates: {
            $exists: true,
            $elemMatch: {
              startDate: { $lte: today },
              endDate: { $gte: today }
            }
          }
        }
      ]
    };
  } 
  else if (statusFilter === 'inactive') {
    query = { status: 'inactive' };
  }
  // 'all' - no additional filters, show everything

  // Add search filter if provided
  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } },
      { 'location.neighborhood': { $regex: search, $options: 'i' } }
    ];
  }

  logger.debug('Property status filter query prepared', { statusFilter });

  // Execute query with pagination
  const properties = await Property.find(query)
    .sort('-createdAt')
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  const total = await Property.countDocuments(query);

  // Get counts for all filter types for the badges
  const counts = {
    all: await Property.countDocuments(),
    active: await Property.countDocuments({
      status: 'active',
      $or: [
        { maintenanceDates: { $exists: false } },
        { maintenanceDates: { $size: 0 } },
        {
          maintenanceDates: {
            $not: {
              $elemMatch: {
                startDate: { $lte: today },
                endDate: { $gte: today }
              }
            }
          }
        }
      ]
    }),
    maintenance_mode: await Property.countDocuments({
      maintenanceDates: {
        $exists: true,
        $elemMatch: {
          startDate: { $lte: today },
          endDate: { $gte: today }
        }
      }
    }),
    inactive: await Property.countDocuments({ status: 'inactive' })
  };

  logger.debug('Property status filter counts calculated', { counts });
  logger.debug('Properties found for status filter', { count: properties.length });

  res.status(200).json({
    success: true,
    properties,
    total,
    counts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  });
});
