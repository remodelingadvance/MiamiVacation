// controllers/notification.controller.js
import { Notification } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { getIO } from '../config/socket.js';

// @desc    Get all notifications (Admin)
// @route   GET /api/v1/notifications
// @access  Private/Admin
// controllers/notification.controller.js - Add this to getNotifications

export const getNotifications = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50, type, priority, read } = req.query;

  const query = { isAdmin: true };
  if (type) query.type = type;
  if (priority) query.priority = priority;
  if (read !== undefined) query.read = read === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Notification.countDocuments(query),
    Notification.getAdminUnreadCount(),
  ]);

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    unreadCount, // This is the badge count
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
    notifications,
  });
});

// @desc    Get unread notification count
// @route   GET /api/v1/notifications/unread-count
// @access  Private/Admin
export const getUnreadCount = catchAsync(async (req, res, next) => {
  const count = await Notification.getAdminUnreadCount();

  res.status(200).json({
    success: true,
    unreadCount: count,
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private/Admin
export const markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.markAsRead(req.params.id, req.user.id, req.user.role);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    success: true,
    notification,
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/v1/notifications/read-all
// @access  Private/Admin
export const markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.markAllAdminAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private/Admin
export const deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  // Emit updated count
  const io = getIO();
  if (io) {
    const unreadCount = await Notification.getAdminUnreadCount();
    io.to('admin').emit('admin:unread-count-update', unreadCount);
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
});

// @desc    Get notification settings
// @route   GET /api/v1/notifications/settings
// @access  Private/Admin
export const getNotificationSettings = catchAsync(async (req, res, next) => {
  const settings = {
    channels: {
      inApp: true,
      email: true,
      push: false,
    },
    types: {
      new_booking: { inApp: true, email: true, priority: 'high' },
      booking_cancelled: { inApp: true, email: true, priority: 'urgent' },
      booking_confirmed: { inApp: true, email: false, priority: 'high' },
      booking_completed: { inApp: true, email: false, priority: 'medium' },
      new_review: { inApp: true, email: true, priority: 'medium' },
      review_flagged: { inApp: true, email: true, priority: 'high' },
      review_approved: { inApp: true, email: false, priority: 'low' },
      new_contact: { inApp: true, email: true, priority: 'high' },
      payment_received: { inApp: true, email: true, priority: 'high' },
      payment_failed: { inApp: true, email: true, priority: 'urgent' },
      new_user: { inApp: true, email: false, priority: 'low' },
      system_alert: { inApp: true, email: true, priority: 'urgent' },
      newsletter_subscriber: { inApp: true, email: false, priority: 'low' },
    },
  };

  res.status(200).json({
    success: true,
    settings,
  });
});

// @desc    Bulk delete notifications
// @route   DELETE /api/v1/notifications/bulk
// @access  Private/Admin
export const bulkDeleteNotifications = catchAsync(async (req, res, next) => {
  const { notificationIds } = req.body;
  
  if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
    return next(new AppError('Please provide notification IDs to delete', 400));
  }
  
  const result = await Notification.deleteMany({ _id: { $in: notificationIds } });
  
  // Emit updated count
  const io = getIO();
  if (io) {
    const unreadCount = await Notification.getAdminUnreadCount();
    io.to('admin').emit('admin:unread-count-update', unreadCount);
  }
  
  res.status(200).json({
    success: true,
    message: `${result.deletedCount} notifications deleted`,
    deletedCount: result.deletedCount,
  });
});