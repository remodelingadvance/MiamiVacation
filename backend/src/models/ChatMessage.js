import crypto from 'crypto';
import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    trim: true,
  },
  mimeType: {
    type: String,
    trim: true,
  },
  size: {
    type: Number,
    min: 0,
  },
  publicId: String,
}, { _id: false });

const chatMessageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
    index: true,
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatConversation',
    required: true,
    index: true,
  },
  senderType: {
    type: String,
    enum: ['customer', 'admin', 'system', 'ai'],
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  guestSessionId: {
    type: String,
    trim: true,
  },
  body: {
    type: String,
    trim: true,
    maxlength: 4000,
  },
  attachments: [attachmentSchema],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent',
    index: true,
  },
  deliveredAt: Date,
  readAt: Date,
  metadata: {
    currentUrl: String,
    ip: String,
    userAgent: String,
    model: String,
    sources: [{
      type: String,
    }],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

chatMessageSchema.index({ conversation: 1, createdAt: 1 });
chatMessageSchema.index({ createdAt: -1 });

chatMessageSchema.pre('validate', function (next) {
  if (!this.messageId) {
    this.messageId = `msg_${crypto.randomBytes(12).toString('hex')}`;
  }
  next();
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
