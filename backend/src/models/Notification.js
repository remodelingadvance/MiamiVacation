import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'new_booking',
      'booking_cancelled',
      'booking_confirmed',
      'booking_completed',
      'new_review',
      'review_flagged',
      'new_contact',
      'contact_replied',
      'new_user',
      'user_verified',
      'payment_received',
      'payment_failed',
      'payment_refunded',
      'property_created',
      'property_updated',
      'coupon_used',
      'coupon_expired',
      'system_alert',
      'newsletter_subscriber',
      'admin_message',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  link: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
});

// Indexes
notificationSchema.index({ read: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = await this.create(data);
  
  // Emit via socket if available
  try {
    const { emitAdminNotification, emitUserNotification } = await import('../config/socket.js');
    
    if (data.userId) {
      emitUserNotification(data.userId, 'notification', notification);
    }
    
    emitAdminNotification('admin:new-notification', notification);
  } catch (error) {
    // Socket might not be initialized
  }
  
  return notification;
};

// Get unread count
notificationSchema.statics.getUnreadCount = async function() {
  return await this.countDocuments({ read: false });
};

// Mark as read
notificationSchema.statics.markAsRead = async function(notificationId, userId) {
  return await this.findByIdAndUpdate(
    notificationId,
    {
      read: true,
      readAt: new Date(),
      readBy: userId,
    },
    { new: true }
  );
};

// Get recent notifications
notificationSchema.statics.getRecent = async function(limit = 20) {
  return await this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;