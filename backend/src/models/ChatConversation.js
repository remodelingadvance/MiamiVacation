import crypto from 'crypto';
import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  guestSessionId: {
    type: String,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    trim: true,
    maxlength: 120,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  ip: String,
  userAgent: String,
}, { _id: false });

const chatConversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    unique: true,
    index: true,
  },
  channel: {
    type: String,
    enum: ['admin', 'ai'],
    default: 'admin',
    index: true,
  },
  customer: customerSchema,
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  subject: {
    type: String,
    trim: true,
    maxlength: 180,
    default: 'Booking assistance',
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'resolved', 'archived'],
    default: 'open',
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  lastMessage: {
    text: String,
    senderType: {
      type: String,
      enum: ['customer', 'admin', 'system', 'ai'],
    },
    at: Date,
  },
  unread: {
    customer: {
      type: Number,
      default: 0,
    },
    admin: {
      type: Number,
      default: 0,
    },
  },
  online: {
    customer: {
      type: Boolean,
      default: false,
    },
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    lastCustomerSeenAt: Date,
    lastAdminSeenAt: Date,
  },
  metadata: {
    source: {
      type: String,
      default: 'website',
    },
    currentUrl: String,
    locale: String,
    referrer: String,
  },
  archivedAt: Date,
  resolvedAt: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

chatConversationSchema.index({ status: 1, updatedAt: -1 });
chatConversationSchema.index({ assignedTo: 1, status: 1 });
chatConversationSchema.index({ 'customer.user': 1, updatedAt: -1 });
chatConversationSchema.index({ 'customer.email': 1, updatedAt: -1 });
chatConversationSchema.index({ subject: 'text', 'customer.name': 'text', 'customer.email': 'text', tags: 'text' });

chatConversationSchema.pre('validate', function (next) {
  if (!this.conversationId) {
    this.conversationId = `SW-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }
  next();
});

const ChatConversation = mongoose.model('ChatConversation', chatConversationSchema);

export default ChatConversation;
