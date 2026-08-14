import mongoose from 'mongoose';

const businessKnowledgeSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['faq', 'booking', 'pricing', 'availability', 'cancellation', 'check-in', 'payment', 'local', 'policy', 'general'],
    default: 'general',
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 180,
  },
  question: {
    type: String,
    trim: true,
    maxlength: 300,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 4000,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  source: {
    type: String,
    trim: true,
    default: 'Stay Wise Miami approved knowledge',
  },
  isApproved: {
    type: Boolean,
    default: false,
    index: true,
  },
  priority: {
    type: Number,
    default: 0,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

businessKnowledgeSchema.index({
  title: 'text',
  question: 'text',
  answer: 'text',
  tags: 'text',
});
businessKnowledgeSchema.index({ isApproved: 1, category: 1, priority: -1 });

const BusinessKnowledge = mongoose.model('BusinessKnowledge', businessKnowledgeSchema);

export default BusinessKnowledge;
