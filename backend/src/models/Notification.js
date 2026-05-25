// models/Notification.js
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
      'review_approved',
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  isAdmin: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
}, {
  timestamps: true,
});

// Indexes for performance
notificationSchema.index({ read: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ createdAt: -1 });

// Static method to create notification with deduplication
notificationSchema.statics.createNotification = async function(data) {
  // Prevent duplicate notifications for same action within 5 seconds
  const recentThreshold = new Date(Date.now() - 5000);
  const existing = await this.findOne({
    type: data.type,
    'data.bookingId': data.data?.bookingId,
    'data.contactId': data.data?.contactId,
    'data.reviewId': data.data?.reviewId,
    createdAt: { $gte: recentThreshold },
  });

  if (existing) {
    return existing;
  }

  const notification = await this.create(data);
  
  // Emit via socket if available
  try {
    const { getIO } = await import('../config/socket.js');
    const io = getIO();
    
    if (io) {
      if (data.userId) {
        io.to(`user:${data.userId}`).emit('new-notification', notification);
      }
      // Always emit to admin room
      io.to('admin').emit('admin:new-notification', notification);
      
      // Emit updated counts
      const adminUnreadCount = await this.countDocuments({ read: false, isAdmin: true });
      io.to('admin').emit('admin:unread-count-update', adminUnreadCount);
    }
  } catch (error) {
    console.error('Socket emission error:', error);
  }
  
  return notification;
};

// Get unread count for admin
notificationSchema.statics.getAdminUnreadCount = async function() {
  return await this.countDocuments({ read: false, isAdmin: true });
};

// Get unread count for specific user
notificationSchema.statics.getUserUnreadCount = async function(userId) {
  return await this.countDocuments({ userId, read: false });
};

// Mark as read
notificationSchema.statics.markAsRead = async function(notificationId, userId, userRole) {
  const update = {
    read: true,
    readAt: new Date(),
    readBy: userId,
  };
  
  const notification = await this.findByIdAndUpdate(notificationId, update, { new: true });
  
  if (notification) {
    try {
      const { getIO } = await import('../config/socket.js');
      const io = getIO();
      if (io) {
        const adminUnreadCount = await this.countDocuments({ read: false, isAdmin: true });
        io.to('admin').emit('admin:unread-count-update', adminUnreadCount);
        
        if (notification.userId) {
          const userUnreadCount = await this.countDocuments({ userId: notification.userId, read: false });
          io.to(`user:${notification.userId}`).emit('unread-count-update', userUnreadCount);
        }
      }
    } catch (error) {
      console.error('Socket update error:', error);
    }
  }
  
  return notification;
};

// Mark all as read for admin
notificationSchema.statics.markAllAdminAsRead = async function(userId) {
  const result = await this.updateMany(
    { read: false, isAdmin: true },
    { read: true, readAt: new Date(), readBy: userId }
  );
  
  try {
    const { getIO } = await import('../config/socket.js');
    const io = getIO();
    if (io) {
      io.to('admin').emit('admin:all-marked-read');
      io.to('admin').emit('admin:unread-count-update', 0);
    }
  } catch (error) {
    console.error('Socket update error:', error);
  }
  
  return result;
};

// Get recent notifications with pagination
notificationSchema.statics.getRecent = async function(limit = 50, skip = 0, isAdmin = true) {
  return await this.find({ isAdmin })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Delete old notifications
notificationSchema.statics.cleanupOld = async function(daysToKeep = 90) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  return await this.deleteMany({ 
    createdAt: { $lt: cutoffDate },
    read: true,
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;