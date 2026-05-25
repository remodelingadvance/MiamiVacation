import { Notification } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// @desc    Get all notifications (Admin)
// @route   GET /api/v1/notifications
// @access  Private/Admin
export const getNotifications = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, type, priority, read } = req.query;

  const query = {};
  if (type) query.type = type;
  if (priority) query.priority = priority;
  if (read !== undefined) query.read = read === 'true';

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.getUnreadCount();

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
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
  const count = await Notification.getUnreadCount();

  res.status(200).json({
    success: true,
    unreadCount: count,
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private/Admin
export const markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.markAsRead(req.params.id, req.user.id);

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
  await Notification.updateMany(
    { read: false },
    { read: true, readAt: new Date(), readBy: req.user.id }
  );

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
      new_booking: { inApp: true, email: true },
      booking_cancelled: { inApp: true, email: true },
      booking_confirmed: { inApp: true, email: false },
      new_review: { inApp: true, email: true },
      new_contact: { inApp: true, email: true },
      payment_received: { inApp: true, email: true },
      payment_failed: { inApp: true, email: true },
      new_user: { inApp: true, email: false },
      system_alert: { inApp: true, email: true },
    },
  };

  res.status(200).json({
    success: true,
    settings,
  });
});