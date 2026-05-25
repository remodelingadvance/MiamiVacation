import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking is required']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    title: {
        type: String,
        required: [true, 'Review title is required'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Review content is required'],
        minlength: [10, 'Review must be at least 10 characters'],
        maxlength: [2000, 'Review cannot exceed 2000 characters']
    },
    ratings: {
        cleanliness: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        },
        accuracy: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        },
        communication: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        },
        location: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        },
        checkIn: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        },
        value: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        }
    },
    images: [{
        url: String,
        publicId: String,
        caption: String
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged'],
        default: 'pending'
    },
    helpful: {
        yes: {
            type: Number,
            default: 0
        },
        no: {
            type: Number,
            default: 0
        },
        voters: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    response: {
        text: String,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: Date
    },
    verified: {
        type: Boolean,
        default: false
    },
    tags: [String],
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

// Indexes
reviewSchema.index({ property: 1, status: 1 });
reviewSchema.index({ user: 1, property: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ verified: 1 });

// Update property ratings after save
reviewSchema.post('save', async function () {
    const Property = mongoose.model('Property');
    await Property.calculateRatings(this.property);
});

// Update property ratings after findOneAndUpdate
reviewSchema.post('findOneAndUpdate', async function (doc) {
    if (doc) {
        const Property = mongoose.model('Property');
        await Property.calculateRatings(doc.property);
    }
});

// Update property ratings after deleteOne
reviewSchema.post('deleteOne', async function () {
    if (this._conditions._id) {
        const review = await this.model.findOne(this._conditions);
        if (review) {
            const Property = mongoose.model('Property');
            await Property.calculateRatings(review.property);
        }
    }
});

// Calculate average ratings for property - Remove duplicate, use the one from Property model
// The Property.calculateRatings method already exists in the Property model

const Review = mongoose.model('Review', reviewSchema);

export default Review;