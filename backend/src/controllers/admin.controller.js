import { User, Property, Booking, Review, Payment, Contact, Coupon, Analytics } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import logger from '../utils/logger.js';

// @desc    Get admin dashboard stats
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = catchAsync(async (req, res, next) => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalUsers,
    newUsersThisMonth,
    totalProperties,
    activeProperties,
    totalBookings,
    bookingsThisMonth,
    totalRevenue,
    revenueThisMonth,
    pendingReviews,
    unreadContacts,
    activeCoupons,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
    Property.countDocuments(),
    Property.countDocuments({ status: 'active' }),
    Booking.countDocuments(),
    Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Booking.aggregate([
      {
        $match: { 'payment.status': 'paid' },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' },
        },
      },
    ]),
    Booking.aggregate([
      {
        $match: {
          'payment.status': 'paid',
          'payment.paidAt': { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' },
        },
      },
    ]),
    Review.countDocuments({ status: 'pending' }),
    Contact.countDocuments({ status: 'unread' }),
    Coupon.countDocuments({ status: 'active' }),
  ]);

  // Get recent bookings
  const recentBookings = await Booking.find()
    .populate('user', 'firstName lastName email')
    .populate('property', 'name')
    .sort('-createdAt')
    .limit(5);

  // Get monthly revenue for the last 12 months
  const monthlyRevenue = await Booking.aggregate([
    {
      $match: {
        'payment.status': 'paid',
        'payment.paidAt': {
          $gte: new Date(today - 365 * 24 * 60 * 60 * 1000),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$payment.paidAt' },
          month: { $month: '$payment.paidAt' },
        },
        revenue: { $sum: '$pricing.total' },
        bookings: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  // Get top properties
  const topProperties = await Booking.aggregate([
    {
      $match: { status: { $in: ['completed', 'active'] } },
    },
    {
      $group: {
        _id: '$property',
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
      },
    },
    {
      $sort: { totalBookings: -1 },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: 'properties',
        localField: '_id',
        foreignField: '_id',
        as: 'property',
      },
    },
    {
      $unwind: '$property',
    },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
      },
      properties: {
        total: totalProperties,
        active: activeProperties,
      },
      bookings: {
        total: totalBookings,
        thisMonth: bookingsThisMonth,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        thisMonth: revenueThisMonth[0]?.total || 0,
      },
      reviews: {
        pending: pendingReviews,
      },
      contacts: {
        unread: unreadContacts,
      },
      coupons: {
        active: activeCoupons,
      },
    },
    monthlyRevenue,
    topProperties,
    recentBookings,
  });
});

// @desc    Get all users (Admin)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
export const getUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, role, status } = req.query;

  const query = {};
  if (role) query.role = role;
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;

  const users = await User.find(query)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
    users,
  });
});

// @desc    Get single user (Admin)
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate('bookings')
    .populate('reviews');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Update user (Admin)
// @route   PATCH /api/v1/admin/users/:id
// @access  Private/Admin
export const updateUser = catchAsync(async (req, res, next) => {
  const { role, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, isActive },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  logger.info(`User updated: ${user.email} by admin ${req.user.id}`);

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Soft delete - deactivate
  user.isActive = false;
  await user.save();

  logger.info(`User deactivated: ${user.email} by admin ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully',
  });
});

// @desc    Get analytics data
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
export const getAnalytics = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const query = {};
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const analytics = await Analytics.find(query)
    .sort('-createdAt')
    .limit(1000);

  res.status(200).json({
    success: true,
    count: analytics.length,
    analytics,
  });
});