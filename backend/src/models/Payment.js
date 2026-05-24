import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['card', 'bank_transfer', 'paypal'],
    default: 'card'
  },
  stripePaymentIntentId: String,
  stripeSessionId: String,
  stripeCustomerId: String,
  receiptUrl: String,
  description: String,
  error: {
    code: String,
    message: String,
    type: String
  },
  refund: {
    amount: Number,
    reason: String,
    stripeRefundId: String,
    refundedAt: Date
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;