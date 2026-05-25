// models/Newsletter.js
import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced'],
    default: 'active'
  },
  preferences: {
    promotions: { type: Boolean, default: true },
    newProperties: { type: Boolean, default: true },
    blog: { type: Boolean, default: false },
    events: { type: Boolean, default: false }
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: Date,
  source: {
    type: String,
    enum: ['homepage', 'booking', 'popup', 'manual', 'bulk_import', 'csv_import', 'api'],
    default: 'homepage'
  },
  metadata: {
    ip: String,
    userAgent: String,
    importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    importBatch: String
  }
}, {
  timestamps: true
});

// Indexes
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ source: 1 });
newsletterSchema.index({ createdAt: -1 });

const Newsletter = mongoose.model('Newsletter', newsletterSchema);
export default Newsletter;