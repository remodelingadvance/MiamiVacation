import mongoose from 'mongoose';
import moment from 'moment';
import { User, Property, Booking, Review, Payment, Contact, Coupon, Newsletter, Notification } from '../models/index.js';
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
    occupancyData,
    recentBookingsData,
    monthlyRevenueData,
    topPropertiesData,
    propertyTypeData,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
    Property.countDocuments(),
    Property.countDocuments({ status: 'active' }),
    Booking.countDocuments(),
    Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    Booking.aggregate([
      { $match: { 'payment.status': 'paid', 'payment.paidAt': { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    Review.countDocuments({ status: 'pending' }),
    Contact.countDocuments({ status: 'unread' }),
    Coupon.countDocuments({ status: 'active' }),
    // Occupancy calculation
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'active', 'completed'] } } },
      {
        $group: {
          _id: null,
          totalNights: {
            $sum: {
              $divide: [
                { $subtract: ['$checkOut', '$checkIn'] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
    ]),
    // Recent bookings
    Booking.find()
      .populate('user', 'firstName lastName email')
      .populate('property', 'name')
      .sort('-createdAt')
      .limit(5)
      .lean(),
    // Monthly revenue for last 12 months
    Booking.aggregate([
      {
        $match: {
          'payment.status': 'paid',
          'payment.paidAt': { $gte: new Date(today - 365 * 24 * 60 * 60 * 1000) },
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
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    // Top properties
    Booking.aggregate([
      { $match: { status: { $in: ['completed', 'active'] } } },
      {
        $group: {
          _id: '$property',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'properties',
          localField: '_id',
          foreignField: '_id',
          as: 'property',
        },
      },
      { $unwind: '$property' },
    ]),
    // Property type distribution
    Property.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Calculate occupancy rate
  const activePropertyCount = activeProperties;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const totalPossibleNights = activePropertyCount * daysInMonth;
  const bookedNights = occupancyData[0]?.totalNights || 0;
  const occupancyRate = totalPossibleNights > 0 
    ? Math.round((bookedNights / totalPossibleNights) * 100) 
    : 0;

  // Format property type distribution
  const propertyTypeDistribution = propertyTypeData.map(item => ({
    name: item._id ? (item._id.charAt(0).toUpperCase() + item._id.slice(1)) : 'Other',
    value: item.count,
  }));

  // Format monthly revenue for chart
  const formattedMonthlyRevenue = monthlyRevenueData.map(item => ({
    month: moment(`${item._id.year}-${item._id.month}`, 'YYYY-M').format('MMM YYYY'),
    revenue: item.revenue,
    bookings: item.bookings,
  }));

  res.status(200).json({
    success: true,
    stats: {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        trend: totalUsers > 0 ? Math.round((newUsersThisMonth / totalUsers) * 100) : 0,
      },
      properties: {
        total: totalProperties,
        active: activeProperties,
      },
      bookings: {
        total: totalBookings,
        thisMonth: bookingsThisMonth,
        trend: totalBookings > 0 ? Math.round((bookingsThisMonth / totalBookings) * 100) : 0,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        thisMonth: revenueThisMonth[0]?.total || 0,
        trend: totalRevenue[0]?.total > 0 
          ? Math.round(((revenueThisMonth[0]?.total || 0) / totalRevenue[0]?.total) * 100) 
          : 0,
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
      occupancy: {
        rate: occupancyRate,
      },
    },
    occupancyRate,
    propertyTypeDistribution,
    monthlyRevenue: formattedMonthlyRevenue,
    topProperties: topPropertiesData,
    recentBookings: recentBookingsData,
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

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const oldStatus = user.isActive;
  const oldRole = user.role;

  user.role = role || user.role;
  user.isActive = isActive !== undefined ? isActive : user.isActive;
  await user.save();

  // ✅ Create notification for user status change
  if (oldStatus !== user.isActive) {
    await Notification.createNotification({
      type: 'system_alert',
      title: user.isActive ? 'User Activated' : 'User Deactivated',
      message: `User ${user.email} has been ${user.isActive ? 'activated' : 'deactivated'} by ${req.user.email}`,
      priority: 'medium',
      data: {
        userId: user._id,
        email: user.email,
        action: user.isActive ? 'activated' : 'deactivated',
      },
      link: `/admin/users/${user._id}`,
    });
  }

  // ✅ Create notification for role change
  if (oldRole !== user.role) {
    await Notification.createNotification({
      type: 'system_alert',
      title: 'User Role Changed',
      message: `User ${user.email} role changed from ${oldRole} to ${user.role}`,
      priority: 'medium',
      data: {
        userId: user._id,
        email: user.email,
        oldRole: oldRole,
        newRole: user.role,
      },
      link: `/admin/users/${user._id}`,
    });
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
  const { startDate, endDate, period = 'month' } = req.query;

  // Calculate date ranges
  const now = new Date();
  let start, end;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    switch (period) {
      case 'week':
        start = moment().subtract(7, 'days').startOf('day').toDate();
        break;
      case 'year':
        start = moment().subtract(12, 'months').startOf('month').toDate();
        break;
      case 'month':
      default:
        start = moment().subtract(30, 'days').startOf('day').toDate();
        break;
    }
    end = now;
  }

  // Get all bookings for the date range
  const bookingsQuery = {
    createdAt: { $gte: start, $lte: end }
  };

  const paidBookingsQuery = {
    'payment.status': 'paid',
    'payment.paidAt': { $gte: start, $lte: end }
  };

  // Fetch all data in parallel
  const [
    allBookings,
    paidBookings,
    totalBookingsCount,
    totalPaidBookingsCount,
    totalRevenue,
    propertyStats,
    userCount,
    reviewStats,
    contactStats,
    couponCount,
    topProperties,
    bookingStatusDistribution,
    sourceDistribution,
    monthlyRevenue,
    dailyRevenue,
    occupancyStats,
  ] = await Promise.all([
    // All bookings in date range
    Booking.find(bookingsQuery).lean(),
    // Paid bookings in date range
    Booking.find(paidBookingsQuery).lean(),
    // Total bookings count
    Booking.countDocuments(bookingsQuery),
    // Total paid bookings count
    Booking.countDocuments(paidBookingsQuery),
    // Total revenue
    Booking.aggregate([
      { $match: paidBookingsQuery },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    // Property statistics
    Property.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricing.basePrice' },
        },
      },
    ]),
    // User count
    User.countDocuments({ role: 'user' }),
    // Review statistics
    Review.aggregate([
      {
        $match: { createdAt: { $gte: start, $lte: end } },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]),
    // Contact statistics
    Contact.aggregate([
      {
        $match: { createdAt: { $gte: start, $lte: end } },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          replied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } },
        },
      },
    ]),
    // Active coupons count
    Coupon.countDocuments({ status: 'active' }),
    // Top performing properties
    Booking.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'confirmed', 'active'] },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$property',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'properties',
          localField: '_id',
          foreignField: '_id',
          as: 'property',
        },
      },
      { $unwind: '$property' },
      {
        $project: {
          name: '$property.name',
          type: '$property.type',
          totalBookings: 1,
          totalRevenue: 1,
          image: { $arrayElemAt: ['$property.images.url', 0] },
        },
      },
    ]),
    // Booking status distribution
    Booking.aggregate([
      {
        $match: bookingsQuery,
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    // Source distribution
    Booking.aggregate([
      {
        $match: bookingsQuery,
      },
      {
        $group: {
          _id: { $ifNull: ['$metadata.source', 'direct'] },
          count: { $sum: 1 },
        },
      },
    ]),
    // Monthly revenue for chart
    Booking.aggregate([
      {
        $match: paidBookingsQuery,
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
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    // Daily revenue for chart
    Booking.aggregate([
      {
        $match: paidBookingsQuery,
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$payment.paidAt' } },
          revenue: { $sum: '$pricing.total' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Occupancy calculation
    calculateOccupancy(start, end),
  ]);

  // Calculate summary stats
  const totalRevenueAmount = totalRevenue[0]?.total || 0;
  const avgBookingValue = totalPaidBookingsCount > 0 ? totalRevenueAmount / totalPaidBookingsCount : 0;

  // Calculate occupancy rate
  const activeProperties = await Property.countDocuments({ status: 'active' });
  const occupancyRate = occupancyStats.rate || 0;

  // Calculate trends (compare with previous period)
  const periodDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const prevStart = moment(start).subtract(periodDays, 'days').toDate();
  const prevEnd = start;

  const prevRevenue = await Booking.aggregate([
    {
      $match: {
        'payment.status': 'paid',
        'payment.paidAt': { $gte: prevStart, $lt: prevEnd },
      },
    },
    { $group: { _id: null, total: { $sum: '$pricing.total' } } },
  ]);

  const prevBookings = await Booking.countDocuments({
    'payment.status': 'paid',
    'payment.paidAt': { $gte: prevStart, $lt: prevEnd },
  });

  const prevRevenueTotal = prevRevenue[0]?.total || 0;
  const revenueTrend = prevRevenueTotal > 0 
    ? Math.round(((totalRevenueAmount - prevRevenueTotal) / prevRevenueTotal) * 100) 
    : totalRevenueAmount > 0 ? 100 : 0;

  const bookingsTrend = prevBookings > 0 
    ? Math.round(((totalPaidBookingsCount - prevBookings) / prevBookings) * 100) 
    : totalPaidBookingsCount > 0 ? 100 : 0;

  // Calculate peak booking days
  const peakDays = await Booking.aggregate([
    {
      $match: bookingsQuery,
    },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const peakBookingDays = peakDays.map(d => ({
    day: dayNames[d._id - 1],
    bookings: d.count,
  }));

  // Calculate average stay duration
  const avgStayData = await Booking.aggregate([
    {
      $match: {
        status: { $in: ['completed', 'confirmed', 'active'] },
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        avgNights: {
          $avg: {
            $ceil: {
              $divide: [
                { $subtract: ['$checkOut', '$checkIn'] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
    },
  ]);

  const avgStayDuration = avgStayData[0]?.avgNights ? Math.round(avgStayData[0].avgNights * 10) / 10 : 0;

  // Format data for charts
  const formattedMonthlyRevenue = monthlyRevenue.map(item => ({
    month: moment(`${item._id.year}-${item._id.month}`, 'YYYY-M').format('MMM YYYY'),
    revenue: item.revenue,
    bookings: item.bookings,
  }));

  const formattedDailyRevenue = dailyRevenue.map(item => ({
    date: item._id,
    revenue: item.revenue,
    bookings: item.bookings,
  }));

  const propertyTypes = propertyStats.map(item => ({
    name: item._id ? (item._id.charAt(0).toUpperCase() + item._id.slice(1)) : 'Other',
    value: item.count,
    avgPrice: Math.round(item.avgPrice || 0),
  }));

  const bookingStatuses = bookingStatusDistribution.map(item => ({
    name: item._id ? (item._id.charAt(0).toUpperCase() + item._id.slice(1)) : 'Unknown',
    value: item.count,
  }));

  const sources = sourceDistribution.map(item => ({
    name: item._id === 'direct' ? 'Direct' : 
          item._id === 'google' ? 'Google' : 
          item._id === 'referral' ? 'Referral' : 
          item._id === 'social' ? 'Social Media' :
          item._id || 'Other',
    value: item.count,
  }));

  // User growth over time
  const userGrowth = await User.aggregate([
    {
      $match: {
        role: 'user',
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        newUsers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Rating distribution
  const ratingDistribution = reviewStats[0] ? [
    { stars: 5, count: reviewStats[0].rating5 || 0 },
    { stars: 4, count: reviewStats[0].rating4 || 0 },
    { stars: 3, count: reviewStats[0].rating3 || 0 },
    { stars: 2, count: reviewStats[0].rating2 || 0 },
    { stars: 1, count: reviewStats[0].rating1 || 0 },
  ] : [];

  // Send response
  res.status(200).json({
    success: true,
    summary: {
      totalRevenue: totalRevenueAmount,
      totalBookings: totalPaidBookingsCount,
      avgBookingValue: Math.round(avgBookingValue),
      occupancyRate,
      totalUsers: userCount,
      totalProperties: activeProperties,
      activeCoupons: couponCount,
      pendingReviews: reviewStats[0]?.pending || 0,
      unreadContacts: contactStats[0]?.unread || 0,
      avgStayDuration,
      revenueTrend,
      bookingsTrend,
    },
    charts: {
      revenue: formattedDailyRevenue,
      monthlyRevenue: formattedMonthlyRevenue,
      propertyTypes,
      bookingStatuses,
      sources,
      topProperties,
      peakBookingDays,
      userGrowth,
      ratingDistribution,
    },
    dateRange: {
      start,
      end,
    },
  });
});

// Helper function to calculate occupancy rate
async function calculateOccupancy(start, end) {
  const totalProperties = await Property.countDocuments({ status: 'active' });
  if (totalProperties === 0) return { rate: 0, bookedNights: 0, totalPossible: 0 };

  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const totalPossibleNights = totalProperties * totalDays;

  const bookings = await Booking.find({
    status: { $in: ['confirmed', 'active', 'completed'] },
    checkIn: { $lte: end },
    checkOut: { $gte: start },
  });

  let bookedNights = 0;
  bookings.forEach(booking => {
    const checkIn = new Date(Math.max(booking.checkIn, start));
    const checkOut = new Date(Math.min(booking.checkOut, end));
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    if (nights > 0) bookedNights += nights;
  });

  const rate = totalPossibleNights > 0 ? Math.round((bookedNights / totalPossibleNights) * 100) : 0;

  return { rate, bookedNights, totalPossible: totalPossibleNights };
}

// @desc    Get analytics summary
// @route   GET /api/v1/admin/analytics/summary
// @access  Private/Admin
export const getAnalyticsSummary = catchAsync(async (req, res, next) => {
  const now = new Date();
  const startOfMonth = moment().startOf('month').toDate();

  const [monthlyRevenue, totalUsers, totalProperties, pendingReviews, unreadContacts] = await Promise.all([
    Booking.aggregate([
      {
        $match: {
          'payment.status': 'paid',
          'payment.paidAt': { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    User.countDocuments({ role: 'user' }),
    Property.countDocuments({ status: 'active' }),
    Review.countDocuments({ status: 'pending' }),
    Contact.countDocuments({ status: 'unread' }),
  ]);

  res.status(200).json({
    success: true,
    summary: {
      revenue: {
        monthly: monthlyRevenue[0]?.total || 0,
      },
      users: {
        total: totalUsers,
      },
      properties: {
        active: totalProperties,
      },
      reviews: {
        pending: pendingReviews,
      },
      contacts: {
        unread: unreadContacts,
      },
    },
  });
});
// @desc    Export analytics data
// @route   GET /api/v1/admin/analytics/export
// @access  Private/Admin
export const exportAnalytics = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : moment().subtract(30, 'days').toDate();
  const end = endDate ? new Date(endDate) : new Date();

  const bookings = await Booking.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate('user', 'firstName lastName email')
    .populate('property', 'name type')
    .lean();

  const csv = [
    'Booking Number,Guest Name,Email,Property,Type,Check-in,Check-out,Nights,Total,Status,Payment Status,Created Date',
    ...bookings.map(b => 
      `${b.bookingNumber},${b.user?.firstName || ''} ${b.user?.lastName || ''},${b.user?.email || ''},${b.property?.name || ''},${b.property?.type || ''},${b.checkIn},${b.checkOut},${b.pricing?.nights || 0},${b.pricing?.total || 0},${b.status},${b.payment?.status},${b.createdAt}`
    ),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=analytics-${moment(start).format('YYYY-MM-DD')}-to-${moment(end).format('YYYY-MM-DD')}.csv`);
  res.send(csv);
});