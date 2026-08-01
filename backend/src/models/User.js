import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: function () {
            return !this.firebaseUid;
        },
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    authProviders: [{
        provider: {
            type: String,
            enum: ['password', 'google.com', 'apple.com', 'phone', 'firebase'],
            default: 'password'
        },
        providerUid: String,
        linkedAt: {
            type: Date,
            default: Date.now
        }
    }],
    phone: {
        type: String,
        trim: true,
        match: [/^\+?[0-9\s().-]{7,20}$/, 'Please provide a valid phone number']
    },
    avatar: {
        type: String,
        default: 'default-avatar.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'super-admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    verificationCode: String,
    verificationCodeExpires: Date,
    verificationCodeAttempts: {
        type: Number,
        default: 0
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshToken: String,
    stripeCustomerId: String,
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'US'
        }
    },
    preferences: {
        currency: {
            type: String,
            default: 'USD'
        },
        language: {
            type: String,
            default: 'en'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            },
            promotions: {
                type: Boolean,
                default: true
            }
        }
    },
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    tokenVersion: {
        type: Number,
        default: 0
    },
    refreshToken: String,
    refreshTokenExpiry: Date,
    lastPasswordChange: Date,
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deletionReason: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for booking count
userSchema.virtual('bookingCount').get(function () {
    return this.bookings?.length || 0;
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ firebaseUid: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ deletedAt: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Update updatedAt before saving
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate verification token
userSchema.methods.generateVerificationToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return token;
};

// Generate email verification code
userSchema.methods.generateVerificationCode = function () {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationCode = crypto.createHash('sha256').update(code).digest('hex');
    this.verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    this.verificationCodeAttempts = 0;
    return code;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    return token;
};

// Check if account is locked
userSchema.methods.isAccountLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
    // Reset if lock has expired
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return await this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    // Increment attempts
    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account if max attempts reached
    if (this.loginAttempts + 1 >= 5) {
        updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // Lock for 30 minutes
    }

    return await this.updateOne(updates);
};

userSchema.methods.invalidateAllTokens = async function () {
    this.tokenVersion += 1;
    this.refreshToken = null;
    this.refreshTokenExpiry = null;
    await this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
