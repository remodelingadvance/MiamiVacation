import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['pageview', 'booking', 'search', 'click', 'conversion', 'other'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  session: String,
  metadata: {
    ip: String,
    userAgent: String,
    referrer: String,
    page: String,
    duration: Number
  }
}, {
  timestamps: true
});

// Indexes for analytics
analyticsSchema.index({ type: 1, createdAt: -1 });
analyticsSchema.index({ session: 1 });
analyticsSchema.index({ user: 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;