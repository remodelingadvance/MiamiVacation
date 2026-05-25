import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    bookingNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Property is required']
    },
    checkIn: {
        type: Date,
        required: [true, 'Check-in date is required']
    },
    checkOut: {
        type: Date,
        required: [true, 'Check-out date is required']
    },
    guests: {
        adults: {
            type: Number,
            required: [true, 'Number of adults is required'],
            min: [1, 'Must have at least 1 adult']
        },
        children: {
            type: Number,
            default: 0
        },
        infants: {
            type: Number,
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    payment: {
        status: {
            type: String,
            enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'],
            default: 'pending'
        },
        method: {
            type: String,
            enum: ['stripe', 'paypal', 'bank_transfer'],
            default: 'stripe'
        },
        stripePaymentIntentId: String,
        stripeSessionId: String,
        amountPaid: Number,
        amountRefunded: {
            type: Number,
            default: 0
        },
        paidAt: Date,
        refundedAt: Date
    },
    pricing: {
        nightlyRate: Number,
        nights: Number,
        baseTotal: Number,
        cleaningFee: Number,
        serviceFee: Number,
        taxes: Number,
        discount: {
            type: Number,
            default: 0
        },
        coupon: {
            code: String,
            discount: Number,
            type: {
                type: String,
                enum: ['percentage', 'fixed']
            }
        },
        subtotal: Number,
        total: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    guestsInfo: {
        primaryGuest: {
            firstName: String,
            lastName: String,
            email: String,
            phone: String
        },
        additionalGuests: [{
            firstName: String,
            lastName: String,
            age: Number
        }]
    },
    specialRequests: String,
    checkInInstructions: String,
    cancellation: {
        cancelledAt: Date,
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String,
        refundAmount: Number,
        cancellationFee: Number
    },
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    },
    communications: [{
        type: {
            type: String,
            enum: ['email', 'sms', 'notification']
        },
        sentAt: {
            type: Date,
            default: Date.now
        },
        subject: String,
        content: String
    }],
    metadata: {
        source: {
            type: String,
            enum: ['direct', 'google', 'referral', 'other'],
            default: 'direct'
        },
        ip: String,
        userAgent: String
    },
    viewedByAdmin: {
        type: Boolean,
        default: false,
    },
    viewedAt: {
        type: Date,
    },
    viewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for total guests
bookingSchema.virtual('totalGuests').get(function () {
    return this.guests.adults + this.guests.children + this.guests.infants;
});

// Virtual for duration
bookingSchema.virtual('duration').get(function () {
    return Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
});

// Indexes
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ checkIn: 1, checkOut: 1, status: 1 });

// Generate booking number
bookingSchema.pre('save', async function (next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.bookingNumber = `MIA${year}${month}${random}`;
    }
    next();
});

// Validate dates
bookingSchema.pre('validate', function (next) {
    if (this.checkOut <= this.checkIn) {
        next(new Error('Check-out date must be after check-in date'));
    }
    if (this.checkIn < new Date()) {
        next(new Error('Check-in date cannot be in the past'));
    }
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;