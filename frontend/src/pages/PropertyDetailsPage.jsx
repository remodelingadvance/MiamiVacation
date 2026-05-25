import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {
    HiStar,
    HiUsers,
    HiHome,
    HiCalendar,
    HiLocationMarker,
    HiCheck,
    HiHeart,
    HiShare,
    HiShieldCheck,
    HiSparkles,
    HiWifi,
    HiCreditCard,
    HiPhone,
    HiMail,
    HiClock,
    HiX,
    HiThumbUp,
    HiThumbDown,
    HiBadgeCheck,
} from 'react-icons/hi';
import { FaBed, FaBath, FaRulerCombined, FaParking, FaUtensils, FaTv, FaSoap, FaShieldAlt } from 'react-icons/fa';
import { PiSwimmingPoolBold } from "react-icons/pi";
import { FaCar } from "react-icons/fa";
import SEOHead from '../components/common/SEOHead';
import ImageGallery from '../components/common/ImageGallery';
import SkeletonLoader from '../components/common/SkeletonLoader';
import PropertyCard from '../components/properties/PropertyCard';
import BookingWidget from '../components/booking/BookingWidget';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../config/api';
import { formatCurrency, formatTimeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';
import AvailabilityCalendar from '../components/common/AvailabilityCalendar';

// Icon mapping for amenities
const getAmenityIcon = (category) => {
    const icons = {
        basic: <HiWifi className="w-5 h-5" />,
        kitchen: <FaUtensils className="w-5 h-5" />,
        bathroom: <FaSoap className="w-5 h-5" />,
        outdoor: <PiSwimmingPoolBold className="w-5 h-5" />,
        entertainment: <FaTv className="w-5 h-5" />,
        safety: <FaShieldAlt className="w-5 h-5" />,
        accessibility: <FaCar className="w-5 h-5" />,
        other: <HiSparkles className="w-5 h-5" />,
    };
    return icons[category] || <HiSparkles className="w-5 h-5" />;
};

// Review Card Component
const ReviewCardComponent = ({ review }) => {
    const { isAuthenticated } = useAuth();
    const [helpfulVote, setHelpfulVote] = useState(null);
    const [voting, setVoting] = useState(false);

    const handleVote = async (vote) => {
        if (!isAuthenticated) {
            toast.error('Please login to vote');
            return;
        }
        if (voting) return;
        try {
            setVoting(true);
            await apiService.markHelpful(review._id, vote);
            setHelpfulVote(vote);
            toast.success('Thank you for your feedback!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Vote failed');
        } finally {
            setVoting(false);
        }
    };

    const ratings = review.ratings || {};

    return (
        <div className="glass rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                        <span className="text-[var(--color-primary)] font-semibold">
                            {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">
                                {review.user?.firstName} {review.user?.lastName}
                            </h4>
                            {review.verified && (
                                <HiBadgeCheck className="w-4 h-4 text-[var(--color-primary)]" title="Verified Stay" />
                            )}
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            {formatTimeAgo(review.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <HiStar className="w-5 h-5 text-[var(--color-primary)]" />
                    <span className="text-white font-semibold">{review.rating}</span>
                </div>
            </div>

            {review.title && (
                <h5 className="text-white font-semibold mb-2">{review.title}</h5>
            )}

            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-4">
                {review.content}
            </p>

            {Object.keys(ratings).length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {Object.entries(ratings).map(([key, value]) => (
                        <div key={key} className="text-center">
                            <p className="text-xs text-[var(--color-text-muted)] capitalize mb-1">{key}</p>
                            <div className="flex items-center justify-center gap-1">
                                <HiStar className="w-3 h-3 text-[var(--color-primary)]" />
                                <span className="text-xs text-white">{value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {review.response?.text && (
                <div className="mt-4 p-4 rounded-lg glass-light border-l-2 border-[var(--color-primary)]">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Response from Miami Luxury Rentals</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{review.response.text}</p>
                </div>
            )}

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                <span className="text-xs text-[var(--color-text-muted)]">Was this helpful?</span>
                <button
                    onClick={() => handleVote('yes')}
                    disabled={voting || helpfulVote}
                    className={`flex items-center gap-1 text-xs transition-colors ${
                        helpfulVote === 'yes'
                            ? 'text-[var(--color-success)]'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-success)]'
                    }`}
                >
                    <HiThumbUp className="w-4 h-4" />
                    Yes ({review.helpful?.yes || 0})
                </button>
                <button
                    onClick={() => handleVote('no')}
                    disabled={voting || helpfulVote}
                    className={`flex items-center gap-1 text-xs transition-colors ${
                        helpfulVote === 'no'
                            ? 'text-red-500'
                            : 'text-[var(--color-text-muted)] hover:text-red-500'
                    }`}
                >
                    <HiThumbDown className="w-4 h-4" />
                    No ({review.helpful?.no || 0})
                </button>
            </div>
        </div>
    );
};

const PropertyDetailsPage = () => {
    const { slug } = useParams();
    const { isAuthenticated } = useAuth();
    const { isFavorite, toggleFavorite } = useWishlist();
    const [property, setProperty] = useState(null);
    const [similarProperties, setSimilarProperties] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setLoading(true);
                const response = await apiService.getPropertyBySlug(slug);
                const propertyData = response.data.property;
                setProperty(propertyData);
                setSimilarProperties(response.data.similarProperties || []);

                if (propertyData._id) {
                    await fetchReviews(propertyData._id);
                }
            } catch (error) {
                console.error('Failed to fetch property:', error);
                toast.error('Property not found');
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
        window.scrollTo(0, 0);
    }, [slug]);

    const fetchReviews = async (propertyId) => {
        try {
            const reviewsResponse = await apiService.getPropertyReviews(propertyId);
            let fetchedReviews = [];
            
            if (reviewsResponse.data.reviews) {
                fetchedReviews = reviewsResponse.data.reviews;
            } else if (reviewsResponse.data.data) {
                fetchedReviews = reviewsResponse.data.data;
            } else if (Array.isArray(reviewsResponse.data)) {
                fetchedReviews = reviewsResponse.data;
            }
            
            const approvedReviews = fetchedReviews.filter(r => r.status === 'approved' || !r.status);
            setReviews(approvedReviews);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            setReviews([]);
        }
    };

    const getOverallStats = () => {
        if (reviews.length === 0) {
            return {
                average: property?.ratings?.average || 0,
                total: property?.ratings?.count || 0,
                breakdown: property?.ratings?.breakdown || {},
            };
        }
        
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / reviews.length;
        
        const breakdown = {
            cleanliness: 0,
            accuracy: 0,
            communication: 0,
            location: 0,
            checkIn: 0,
            value: 0,
        };
        
        let reviewCount = 0;
        reviews.forEach(review => {
            if (review.ratings && Object.keys(review.ratings).length > 0) {
                reviewCount++;
                if (review.ratings.cleanliness) breakdown.cleanliness += review.ratings.cleanliness;
                if (review.ratings.accuracy) breakdown.accuracy += review.ratings.accuracy;
                if (review.ratings.communication) breakdown.communication += review.ratings.communication;
                if (review.ratings.location) breakdown.location += review.ratings.location;
                if (review.ratings.checkIn) breakdown.checkIn += review.ratings.checkIn;
                if (review.ratings.value) breakdown.value += review.ratings.value;
            }
        });
        
        if (reviewCount > 0) {
            Object.keys(breakdown).forEach(key => {
                breakdown[key] = Math.round((breakdown[key] / reviewCount) * 10) / 10;
            });
        }
        
        return {
            average: Math.round(avgRating * 10) / 10,
            total: reviews.length,
            breakdown: breakdown,
        };
    };

    if (loading) {
        return (
            <div className="pt-24">
                <div className="container-custom py-8">
                    <SkeletonLoader type="detail" />
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="pt-24">
                <div className="container-custom py-20 text-center">
                    <h1 className="text-3xl font-display font-bold text-white mb-4">Property Not Found</h1>
                    <p className="text-[var(--color-text-secondary)] mb-8">The property you're looking for doesn't exist.</p>
                    <Link to="/properties" className="btn-primary">Browse Properties</Link>
                </div>
            </div>
        );
    }

    const isFav = isFavorite(property._id);
    const stats = getOverallStats();
    const averageRating = stats.average;
    const totalReviews = stats.total;
    const overallBreakdown = stats.breakdown;

    return (
        <>
            <SEOHead
                title={property.name}
                description={property.description?.short}
                image={property.images?.[0]?.url}
                type="property"
            />

            {/* Header */}
            <section className="pt-24 pb-0">
                <div className="container-custom py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <span className="badge badge-primary capitalize">{property.type}</span>
                                {property.featured && (
                                    <span className="badge badge-warning">Featured</span>
                                )}
                                <span className="badge badge-success capitalize">{property.status}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                                {property.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-[var(--color-text-secondary)]">
                                <div className="flex items-center gap-1">
                                    <HiLocationMarker className="w-4 h-4 text-[var(--color-primary)]" />
                                    <span>{property.location?.address}, {property.location?.neighborhood}, {property.location?.city}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <HiStar className="w-4 h-4 text-[var(--color-primary)]" />
                                    <span>{averageRating} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <HiUsers className="w-4 h-4 text-[var(--color-primary)]" />
                                    <span>Up to {property.details?.maxGuests} guests</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (isAuthenticated) {
                                        toggleFavorite(property._id);
                                    } else {
                                        toast.error('Please login to save favorites');
                                    }
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isFav
                                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                                        : 'glass-light text-white/70 hover:text-white'
                                    }`}
                            >
                                <HiHeart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success('Link copied!');
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg glass-light text-white/70 hover:text-white transition-all"
                            >
                                <HiShare className="w-5 h-5" />
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Image Gallery */}
            {property.images && property.images.length > 0 && (
                <section className="pb-8">
                    <div className="container-custom">
                        <ImageGallery images={property.images} alt={property.name} />
                    </div>
                </section>
            )}

            {/* Content */}
            <section className="py-8">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Tabs */}
                            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                                {['overview', 'amenities', 'policies', 'reviews', 'availability', 'location'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab
                                                ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
                                                : 'text-[var(--color-text-secondary)] hover:text-white'
                                            }`}
                                    >
                                        {tab}
                                        {tab === 'reviews' && totalReviews > 0 && (
                                            <span className="ml-1 text-xs">({totalReviews})</span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-display font-bold text-white mb-4">About this property</h2>
                                        <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                                            {property.description?.full || property.description?.short}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-display font-bold text-white mb-4">Property Details</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="p-4 rounded-xl glass-light text-center">
                                                <FaBed className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
                                                <p className="text-white font-semibold">{property.details?.bedrooms}</p>
                                                <p className="text-xs text-[var(--color-text-muted)]">Bedrooms</p>
                                            </div>
                                            <div className="p-4 rounded-xl glass-light text-center">
                                                <FaBath className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
                                                <p className="text-white font-semibold">{property.details?.bathrooms}</p>
                                                <p className="text-xs text-[var(--color-text-muted)]">Bathrooms</p>
                                            </div>
                                            <div className="p-4 rounded-xl glass-light text-center">
                                                <HiUsers className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
                                                <p className="text-white font-semibold">{property.details?.maxGuests}</p>
                                                <p className="text-xs text-[var(--color-text-muted)]">Max Guests</p>
                                            </div>
                                            <div className="p-4 rounded-xl glass-light text-center">
                                                <FaRulerCombined className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
                                                <p className="text-white font-semibold">{property.details?.size || 'N/A'} {property.details?.size ? 'sq ft' : ''}</p>
                                                <p className="text-xs text-[var(--color-text-muted)]">Size</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Amenities Tab */}
                            {activeTab === 'amenities' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">Amenities & Features</h2>
                                    {property.amenities && property.amenities.length > 0 ? (
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {property.amenities.map((amenity, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg glass-light">
                                                    <div className="text-[var(--color-primary)] text-xl">{getAmenityIcon(amenity.category)}</div>
                                                    <div>
                                                        <p className="text-white font-medium">{amenity.name}</p>
                                                        {amenity.description && <p className="text-[var(--color-text-muted)] text-sm mt-1">{amenity.description}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[var(--color-text-muted)]">No amenities listed</p>
                                    )}
                                </motion.div>
                            )}

                            {/* Policies Tab */}
                            {activeTab === 'policies' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">Policies & Important Notes</h2>
                                    {property.policiesAndNotes && property.policiesAndNotes.length > 0 ? (
                                        <div className="space-y-6">
                                            {property.policiesAndNotes.map((policy, index) => (
                                                <div key={index} className="p-5 rounded-xl glass-light">
                                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                        <HiShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
                                                        {policy.title}
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {policy.points.map((point, pointIndex) => (
                                                            <li key={pointIndex} className="flex items-start gap-2 text-[var(--color-text-secondary)]">
                                                                <HiCheck className="w-4 h-4 text-[var(--color-success)] mt-0.5 flex-shrink-0" />
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[var(--color-text-muted)]">No policies listed</p>
                                    )}
                                </motion.div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <h2 className="text-2xl font-display font-bold text-white">Guest Reviews</h2>
                                        <div className="flex items-center gap-2">
                                            <HiStar className="w-6 h-6 text-[var(--color-primary)]" />
                                            <span className="text-2xl font-bold text-white">{averageRating}</span>
                                            <span className="text-[var(--color-text-muted)]">· {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</span>
                                        </div>
                                    </div>

                                    {overallBreakdown && Object.keys(overallBreakdown).length > 0 && (
                                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[var(--color-text-secondary)] capitalize">Cleanliness</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${(overallBreakdown.cleanliness / 5) * 100}%` }} />
                                                    </div>
                                                    <span className="text-white text-sm font-medium">{overallBreakdown.cleanliness.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[var(--color-text-secondary)] capitalize">Accuracy</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${(overallBreakdown.accuracy / 5) * 100}%` }} />
                                                    </div>
                                                    <span className="text-white text-sm font-medium">{overallBreakdown.accuracy.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[var(--color-text-secondary)] capitalize">Communication</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${(overallBreakdown.communication / 5) * 100}%` }} />
                                                    </div>
                                                    <span className="text-white text-sm font-medium">{overallBreakdown.communication.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[var(--color-text-secondary)] capitalize">Location</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${(overallBreakdown.location / 5) * 100}%` }} />
                                                    </div>
                                                    <span className="text-white text-sm font-medium">{overallBreakdown.location.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[var(--color-text-secondary)] capitalize">Check-in</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${(overallBreakdown.checkIn / 5) * 100}%` }} />
                                                    </div>
                                                    <span className="text-white text-sm font-medium">{overallBreakdown.checkIn.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[var(--color-text-secondary)] capitalize">Value</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${(overallBreakdown.value / 5) * 100}%` }} />
                                                    </div>
                                                    <span className="text-white text-sm font-medium">{overallBreakdown.value.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {reviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {reviews.map((review) => (
                                                <ReviewCardComponent key={review._id} review={review} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 glass rounded-2xl">
                                            <HiStar className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4 opacity-50" />
                                            <p className="text-[var(--color-text-muted)] text-lg">No reviews yet</p>
                                            <p className="text-sm text-[var(--color-text-muted)] mt-1">Be the first to share your experience!</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Availability Tab */}
                            {activeTab === 'availability' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">Availability Calendar</h2>
                                    <p className="text-[var(--color-text-secondary)] mb-6">Select your dates to check availability. Booked dates are marked in red.</p>
                                    <AvailabilityCalendar propertyId={property._id} />
                                </motion.div>
                            )}

                            {/* Location Tab - WITH NEARBY PLACES RESTORED */}
                            {activeTab === 'location' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        Location
                                    </h2>

                                    {/* Address Information */}
                                    <div className="p-4 rounded-xl glass-light">
                                        <p className="text-[var(--color-text-secondary)]">
                                            <strong className="text-white">Address:</strong> {property.location?.address}
                                        </p>
                                        <p className="text-[var(--color-text-secondary)] mt-1">
                                            <strong className="text-white">Neighborhood:</strong> {property.location?.neighborhood}
                                        </p>
                                        <p className="text-[var(--color-text-secondary)] mt-1">
                                            <strong className="text-white">City:</strong> {property.location?.city}, {property.location?.state} {property.location?.zipCode}
                                        </p>
                                    </div>

                                    {/* Map */}
                                    {property.location?.coordinates?.coordinates && (
                                        <div className="h-[400px] rounded-2xl overflow-hidden">
                                            <MapContainer
                                                center={[
                                                    property.location.coordinates.coordinates[1],
                                                    property.location.coordinates.coordinates[0],
                                                ]}
                                                zoom={14}
                                                scrollWheelZoom={false}
                                                className="w-full h-full"
                                            >
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <Marker
                                                    position={[
                                                        property.location.coordinates.coordinates[1],
                                                        property.location.coordinates.coordinates[0],
                                                    ]}
                                                >
                                                    <Popup>
                                                        <strong>{property.name}</strong>
                                                        <br />
                                                        {property.location.address}
                                                    </Popup>
                                                </Marker>
                                            </MapContainer>
                                        </div>
                                    )}

                                    {/* Nearby Places - RESTORED */}
                                    {property.location?.nearbyPlaces && property.location.nearbyPlaces.length > 0 && (
                                        <div>
                                            <h3 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                                                <HiLocationMarker className="w-5 h-5 text-[var(--color-primary)]" />
                                                Nearby Places
                                            </h3>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                {property.location.nearbyPlaces.map((place, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg glass-light">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                                                                {place.type === 'airport' && <FaCar className="w-4 h-4 text-[var(--color-primary)]" />}
                                                                {place.type === 'beach' && <PiSwimmingPoolBold className="w-4 h-4 text-[var(--color-primary)]" />}
                                                                {place.type === 'metro' && <HiLocationMarker className="w-4 h-4 text-[var(--color-primary)]" />}
                                                                {(place.type === 'restaurant' || place.type === 'shopping') && <HiStar className="w-4 h-4 text-[var(--color-primary)]" />}
                                                                {!place.type && <HiLocationMarker className="w-4 h-4 text-[var(--color-primary)]" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium">{place.name}</p>
                                                                <p className="text-xs text-[var(--color-text-muted)] capitalize">{place.type?.replace('_', ' ')}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[var(--color-primary)] text-sm font-medium bg-[var(--color-primary)]/10 px-2 py-1 rounded-full">
                                                            {place.distance}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <BookingWidget property={property} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Similar properties */}
            {similarProperties.length > 0 && (
                <section className="py-16 bg-[var(--color-bg-medium)]">
                    <div className="container-custom">
                        <h2 className="section-title text-white text-center mb-12">Similar Properties</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {similarProperties.slice(0, 4).map((property) => (
                                <PropertyCard key={property._id} property={property} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
};

export default PropertyDetailsPage;