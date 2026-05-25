import mongoose from 'mongoose';

const newsletterCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft',
  },
  scheduledAt: Date,
  sentAt: Date,
  recipients: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 },
  },
  targetAudience: {
    type: String,
    enum: ['all', 'active', 'inactive', 'new', 'returning'],
    default: 'all',
  },
  template: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

newsletterCampaignSchema.index({ status: 1 });
newsletterCampaignSchema.index({ scheduledAt: 1 });

const NewsletterCampaign = mongoose.model('NewsletterCampaign', newsletterCampaignSchema);

export default NewsletterCampaign;