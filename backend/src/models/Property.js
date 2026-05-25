import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Property name is required'],
        trim: true,
        maxlength: [200, 'Property name cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        short: {
            type: String,
            required: [true, 'Short description is required'],
            maxlength: [500, 'Short description cannot exceed 500 characters']
        },
        full: {
            type: String,
            required: [true, 'Full description is required']
        }
    },
    type: {
        type: String,
        enum: ['condo', 'villa', 'penthouse', 'apartment', 'studio', 'house', 'mansion'],
        required: [true, 'Property type is required']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance', 'draft'],
        default: 'active'
    },
    location: {
        address: {
            type: String,
            required: [true, 'Address is required']
        },
        city: {
            type: String,
            default: 'Miami'
        },
        state: {
            type: String,
            default: 'Florida'
        },
        zipCode: String,
        country: {
            type: String,
            default: 'US'
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: [true, 'Coordinates are required'],
                validate: {
                    validator: function (v) {
                        return v.length === 2;
                    },
                    message: 'Coordinates must have exactly [longitude, latitude]'
                }
            }
        },
        neighborhood: String,
        nearbyPlaces: [{
            name: String,
            distance: String,
            type: {
                type: String,
                enum: ['airport', 'bus_station', 'metro', 'beach', 'restaurant', 'shopping', 'park', 'hospital', 'school', 'other']
            }
        }],
        nearbyAttractions: [{
            name: String,
            distance: String,
            type: {
                type: String,
                enum: ['beach', 'restaurant', 'shopping', 'entertainment', 'park', 'museum', 'airport', 'other']
            }
        }]
    },
    details: {
        bedrooms: {
            type: Number,
            required: [true, 'Number of bedrooms is required'],
            min: [0, 'Bedrooms cannot be negative']
        },
        bathrooms: {
            type: Number,
            required: [true, 'Number of bathrooms is required'],
            min: [0, 'Bathrooms cannot be negative']
        },
        maxGuests: {
            type: Number,
            required: [true, 'Maximum guests is required'],
            min: [1, 'Must accommodate at least 1 guest']
        },
        size: {
            type: Number,
            min: [0, 'Size cannot be negative']
        },
        floor: Number,
        yearBuilt: Number,
        parking: {
            type: Number,
            default: 0
        }
    },
    amenities: [{
        category: {
            type: String,
            enum: ['basic', 'kitchen', 'bathroom', 'outdoor', 'entertainment', 'safety', 'accessibility', 'other']
        },
        name: String,
        icon: String,
        description: String
    }],
    houseRules: {
        checkIn: {
            type: String,
            default: '15:00'
        },
        checkOut: {
            type: String,
            default: '11:00'
        },
        smoking: {
            type: Boolean,
            default: false
        },
        pets: {
            type: Boolean,
            default: false
        },
        parties: {
            type: Boolean,
            default: false
        },
        additionalRules: [String]
    },
    policiesAndNotes: [{
        title: {
            type: String,
            required: true
        },
        points: [{
            type: String,
            //   required: true
        }],
        order: {
            type: Number,
            default: 0
        }
    }],
    pricing: {
        basePrice: {
            type: Number,
            required: [true, 'Base price is required'],
            min: [0, 'Price cannot be negative']
        },
        cleaningFee: {
            type: Number,
            default: 0
        },
        serviceFee: {
            type: Number,
            default: 0
        },
        taxRate: {
            type: Number,
            default: 13.5
        },
        currency: {
            type: String,
            default: 'USD'
        },
        weekendMultiplier: {
            type: Number,
            default: 1.2
        },
        seasonalPricing: [{
            name: String,
            startDate: Date,
            endDate: Date,
            multiplier: Number,
            minimumStay: {
                type: Number,
                default: 2
            }
        }],
        minimumStay: {
            type: Number,
            default: 2
        },
        maximumStay: {
            type: Number,
            default: 30
        },
        weeklyDiscount: {
            type: Number,
            default: 0
        },
        monthlyDiscount: {
            type: Number,
            default: 0
        }
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: String,
        alt: String,
        isPrimary: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    video: {
        url: String,
        publicId: String,
        thumbnail: String
    },
    virtualTour: String,
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: [0, 'Rating must be at least 0'],
            max: [5, 'Rating cannot exceed 5']
        },
        count: {
            type: Number,
            default: 0
        },
        breakdown: {
            cleanliness: { type: Number, default: 0 },
            accuracy: { type: Number, default: 0 },
            communication: { type: Number, default: 0 },
            location: { type: Number, default: 0 },
            checkIn: { type: Number, default: 0 },
            value: { type: Number, default: 0 }
        }
    },
    availability: [{
        date: Date,
        isAvailable: {
            type: Boolean,
            default: true
        },
        price: Number,
        minimumStay: Number
    }],
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    featured: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 0
    },
    seo: {
        title: String,
        description: String,
        keywords: [String]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    maintenanceDates: [{
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        reason: {
            type: String,
            enum: ['maintenance', 'renovation', 'owner_use', 'seasonal_closing', 'other'],
            default: 'maintenance'
        },
        description: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Add property status filter options
    statusFilter: {
        type: String,
        enum: ['all', 'active', 'maintenance_mode', 'inactive'],
        default: 'all'
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for formatted address
propertySchema.virtual('fullAddress').get(function () {
    return `${this.location.address}, ${this.location.city}, ${this.location.state} ${this.location.zipCode}`;
});

// Indexes
propertySchema.index({ slug: 1 });
propertySchema.index({ 'location.coordinates': '2dsphere' });
propertySchema.index({ type: 1, status: 1 });
propertySchema.index({ 'pricing.basePrice': 1 });
propertySchema.index({ 'ratings.average': -1 });
propertySchema.index({ featured: 1, priority: -1 });
propertySchema.index({ name: 'text', 'description.short': 'text', 'description.full': 'text' });

// Create slug from name
propertySchema.pre('save', async function (next) {
    if (this.isModified('name')) {
        const slugify = (await import('slugify')).default;
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Calculate ratings
propertySchema.statics.calculateRatings = async function (propertyId) {
    const stats = await mongoose.model('Review').aggregate([
        {
            $match: { property: propertyId, status: 'approved' }
        },
        {
            $group: {
                _id: '$property',
                averageRating: { $avg: '$rating' },
                count: { $sum: 1 },
                cleanliness: { $avg: '$ratings.cleanliness' },
                accuracy: { $avg: '$ratings.accuracy' },
                communication: { $avg: '$ratings.communication' },
                location: { $avg: '$ratings.location' },
                checkIn: { $avg: '$ratings.checkIn' },
                value: { $avg: '$ratings.value' }
            }
        }
    ]);

    if (stats.length > 0) {
        await this.findByIdAndUpdate(propertyId, {
            'ratings.average': Math.round(stats[0].averageRating * 10) / 10,
            'ratings.count': stats[0].count,
            'ratings.breakdown.cleanliness': Math.round(stats[0].cleanliness * 10) / 10,
            'ratings.breakdown.accuracy': Math.round(stats[0].accuracy * 10) / 10,
            'ratings.breakdown.communication': Math.round(stats[0].communication * 10) / 10,
            'ratings.breakdown.location': Math.round(stats[0].location * 10) / 10,
            'ratings.breakdown.checkIn': Math.round(stats[0].checkIn * 10) / 10,
            'ratings.breakdown.value': Math.round(stats[0].value * 10) / 10
        });
    }
};

const Property = mongoose.model('Property', propertySchema);

export default Property;