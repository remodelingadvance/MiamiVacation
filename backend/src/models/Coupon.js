import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Coupon type is required']
  },
  value: {
    type: Number,
    required: [true, 'Coupon value is required'],
    min: [0, 'Value cannot be negative']
  },
  minimumBookingAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum booking amount cannot be negative']
  },
  maximumDiscount: {
    type: Number,
    default: null
  },
  minimumNights: {
    type: Number,
    default: 1,
    min: [1, 'Minimum nights must be at least 1']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  usageLimit: {
    total: {
      type: Number,
      default: null
    },
    perUser: {
      type: Number,
      default: 1,
      min: [1, 'Per user limit must be at least 1']
    }
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative']
  },
  applicableProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  excludedProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  applicableUserTypes: [{
    type: String,
    enum: ['new', 'returning', 'all'],
    default: ['all']
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ status: 1, startDate: 1, endDate: 1 });
couponSchema.index({ 'usedBy.user': 1 });

// Validate coupon
couponSchema.methods.isValid = function(bookingAmount, nights, userId, propertyId) {
  const now = new Date();
  
  if (this.status !== 'active') return { valid: false, message: 'Coupon is not active' };
  
  if (now < this.startDate) return { valid: false, message: 'Coupon is not yet valid' };
  if (now > this.endDate) return { valid: false, message: 'Coupon has expired' };
  
  if (this.usageLimit?.total && this.usedCount >= this.usageLimit.total) {
    return { valid: false, message: 'Coupon usage limit has been reached' };
  }
  
  if (userId !== 'guest') {
    const userUsage = this.usedBy.filter(u => u.user && u.user.toString() === userId.toString()).length;
    if (userUsage >= (this.usageLimit?.perUser || 1)) {
      return { valid: false, message: 'You have already used this coupon' };
    }
  }
  
  if (bookingAmount < this.minimumBookingAmount) {
    return { valid: false, message: `Minimum booking amount of $${this.minimumBookingAmount} required` };
  }
  
  if (nights < this.minimumNights) {
    return { valid: false, message: `Minimum stay of ${this.minimumNights} nights required` };
  }
  
  if (this.applicableProperties && this.applicableProperties.length > 0) {
    if (!this.applicableProperties.some(p => p.toString() === propertyId)) {
      return { valid: false, message: 'Coupon not valid for this property' };
    }
  }
  
  if (this.excludedProperties && this.excludedProperties.some(p => p.toString() === propertyId)) {
    return { valid: false, message: 'Coupon not valid for this property' };
  }
  
  return { valid: true, message: 'Coupon is valid' };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function(amount) {
  let discount = 0;
  
  if (this.type === 'percentage') {
    discount = amount * (this.value / 100);
    if (this.maximumDiscount && discount > this.maximumDiscount) {
      discount = this.maximumDiscount;
    }
  } else {
    discount = this.value;
  }
  
  return Math.min(discount, amount);
};

// Auto-update status based on dates
couponSchema.pre('save', function(next) {
  const now = new Date();
  if (this.endDate < now) {
    this.status = 'expired';
  }
  next();
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;