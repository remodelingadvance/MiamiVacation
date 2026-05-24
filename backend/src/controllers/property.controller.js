import { Property, Review, Booking } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import ApiFeatures from '../utils/ApiFeatures.js';
import logger from '../utils/logger.js';

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
  } = req.query;

  const query = { status: 'active' };

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Property type filter
  if (type) {
    query.type = { $in: type.split(',') };
  }

  // Price range
  if (minPrice || maxPrice) {
    query['pricing.basePrice'] = {};
    if (minPrice) query['pricing.basePrice'].$gte = parseFloat(minPrice);
    if (maxPrice) query['pricing.basePrice'].$lte = parseFloat(maxPrice);
  }

  // Bedrooms
  if (bedrooms) {
    query['details.bedrooms'] = { $gte: parseInt(bedrooms) };
  }

  // Bathrooms
  if (bathrooms) {
    query['details.bathrooms'] = { $gte: parseFloat(bathrooms) };
  }

  // Guests
  if (guests) {
    query['details.maxGuests'] = { $gte: parseInt(guests) };
  }

  // Amenities
  if (amenities) {
    const amenityList = amenities.split(',');
    query['amenities.name'] = { $all: amenityList };
  }

  // Location-based search
  if (lat && lng) {
    const earthRadius = 6378.1; // Earth's radius in km
    const searchRadius = radius || 10; // Default 10km
    
    query['location.coordinates'] = {
      $geoWithin: {
        $centerSphere: [[parseFloat(lng), parseFloat(lat)], searchRadius / earthRadius],
      },
    };
  }

  // Availability check
  if (checkIn && checkOut) {
    query['bookings'] = {
      $not: {
        $elemMatch: {
          checkIn: { $lt: new Date(checkOut) },
          checkOut: { $gt: new Date(checkIn) },
          status: { $in: ['confirmed', 'active'] },
        },
      },
    };
  }

  const properties = await Property.find(query)
    .sort('-ratings.average')
    .populate('reviews')
    .lean();

  res.status(200).json({
    success: true,
    count: properties.length,
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

  // Check if property is available for the given dates
  const conflictingBookings = await Booking.find({
    property: property._id,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      {
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) },
      },
    ],
  });

  const isAvailable = conflictingBookings.length === 0;

  res.status(200).json({
    success: true,
    isAvailable,
    conflictingBookings: conflictingBookings.length,
    bookedDates: conflictingBookings.map(booking => ({
      checkIn: booking.checkIn,
      checkOut: booking.checkOut
    }))
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
export const getPropertyBookings = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const bookings = await Booking.find({
    property: property._id,
    status: { $in: ['confirmed', 'active'] }
  }).select('checkIn checkOut status guestCount totalPrice');

  res.status(200).json({
    success: true,
    count: bookings.length,
    bookings,
  });
});