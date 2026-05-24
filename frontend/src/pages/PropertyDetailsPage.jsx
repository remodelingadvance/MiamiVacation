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
    HiFire,
    HiDesktopComputer,
    HiSun,
    HiKey,
    HiCreditCard,
    HiPhone,
    HiMail,
    HiClock,
    HiX,
    HiPlus,
    HiInformationCircle,
} from 'react-icons/hi';
import { FaBed, FaBath, FaRulerCombined, FaParking, FaSnowflake, FaUtensils, FaTv, FaSoap, FaShieldAlt } from 'react-icons/fa';
import { GiBarbecue, GiHotSpices } from 'react-icons/gi';
import { PiSwimmingPoolBold } from "react-icons/pi";
import { FaCar, FaCoffee } from "react-icons/fa";
import SEOHead from '../components/common/SEOHead';
import ImageGallery from '../components/common/ImageGallery';
import StarRating from '../components/common/StarRating';
import SkeletonLoader from '../components/common/SkeletonLoader';
import ReviewCard from '../components/reviews/ReviewCard';
import PropertyCard from '../components/properties/PropertyCard';
import BookingWidget from '../components/booking/BookingWidget';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../config/api';
import { formatCurrency, formatDate } from '../utils/helpers';
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
                setProperty(response.data.property);
                setSimilarProperties(response.data.similarProperties || []);

                // Fetch reviews
                const reviewsResponse = await apiService.getPropertyReviews(response.data.property._id);
                setReviews(reviewsResponse.data.reviews || []);
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

    return (
        <>
            <SEOHead
                title={property.name}
                description={property.description.short}
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
                                    <span>{property.ratings?.average || 0} ({property.ratings?.count || 0} reviews)</span>
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
                        {/* Main content */}
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
                                    </button>
                                ))}
                            </div>

                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    {/* Description */}
                                    <div>
                                        <h2 className="text-2xl font-display font-bold text-white mb-4">
                                            About this property
                                        </h2>
                                        <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                                            {property.description?.full || property.description?.short}
                                        </p>
                                    </div>

                                    {/* Key details */}
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
                                            {property.details?.floor && (
                                                <div className="p-4 rounded-xl glass-light text-center">
                                                    <HiHome className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
                                                    <p className="text-white font-semibold">Floor {property.details.floor}</p>
                                                    <p className="text-xs text-[var(--color-text-muted)]">Floor</p>
                                                </div>
                                            )}
                                            {property.details?.yearBuilt && (
                                                <div className="p-4 rounded-xl glass-light text-center">
                                                    <HiCalendar className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
                                                    <p className="text-white font-semibold">{property.details.yearBuilt}</p>
                                                    <p className="text-xs text-[var(--color-text-muted)]">Year Built</p>
                                                </div>
                                            )}
                                            {property.details?.parking > 0 && (
                                                <div className="p-4 rounded-xl glass-light text-center">
                                                    <FaParking className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
                                                    <p className="text-white font-semibold">{property.details.parking}</p>
                                                    <p className="text-xs text-[var(--color-text-muted)]">Parking Spots</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Nearby Places */}
                                    {property.location?.nearbyPlaces && property.location.nearbyPlaces.length > 0 && (
                                        <div>
                                            <h3 className="text-xl font-display font-bold text-white mb-4">Nearby Places</h3>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                {property.location.nearbyPlaces.map((place, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg glass-light">
                                                        <div className="flex items-center gap-3">
                                                            <HiLocationMarker className="w-5 h-5 text-[var(--color-primary)]" />
                                                            <div>
                                                                <p className="text-white font-medium">{place.name}</p>
                                                                <p className="text-xs text-[var(--color-text-muted)] capitalize">{place.type?.replace('_', ' ')}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[var(--color-primary)] text-sm font-medium">{place.distance}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* House rules */}
                                    <div>
                                        <h3 className="text-xl font-display font-bold text-white mb-4">House Rules</h3>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <div className="flex items-center gap-3 p-3 rounded-lg glass-light">
                                                <HiClock className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                                                <div>
                                                    <p className="text-white text-sm font-medium">Check-in</p>
                                                    <p className="text-[var(--color-text-secondary)] text-sm">{property.houseRules?.checkIn || '15:00'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-lg glass-light">
                                                <HiClock className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                                                <div>
                                                    <p className="text-white text-sm font-medium">Check-out</p>
                                                    <p className="text-[var(--color-text-secondary)] text-sm">{property.houseRules?.checkOut || '11:00'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-lg glass-light">
                                                {property.houseRules?.smoking ? (
                                                    <HiCheck className="w-5 h-5 text-[var(--color-success)] flex-shrink-0" />
                                                ) : (
                                                    <HiX className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                )}
                                                <p className="text-[var(--color-text-secondary)] text-sm">
                                                    {property.houseRules?.smoking ? 'Smoking allowed' : 'No smoking'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-lg glass-light">
                                                {property.houseRules?.pets ? (
                                                    <HiCheck className="w-5 h-5 text-[var(--color-success)] flex-shrink-0" />
                                                ) : (
                                                    <HiX className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                )}
                                                <p className="text-[var(--color-text-secondary)] text-sm">
                                                    {property.houseRules?.pets ? 'Pets allowed' : 'No pets'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-lg glass-light">
                                                {property.houseRules?.parties ? (
                                                    <HiCheck className="w-5 h-5 text-[var(--color-success)] flex-shrink-0" />
                                                ) : (
                                                    <HiX className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                )}
                                                <p className="text-[var(--color-text-secondary)] text-sm">
                                                    {property.houseRules?.parties ? 'Parties allowed' : 'No parties/events'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Additional Rules */}
                                        {property.houseRules?.additionalRules && property.houseRules.additionalRules.length > 0 && (
                                            <div className="mt-4 p-4 rounded-lg glass-light">
                                                <h4 className="text-white font-medium mb-2">Additional Rules</h4>
                                                <ul className="space-y-1">
                                                    {property.houseRules.additionalRules.map((rule, index) => (
                                                        <li key={index} className="text-[var(--color-text-secondary)] text-sm flex items-center gap-2">
                                                            <HiShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                                                            {rule}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pricing Information */}
                                    <div>
                                        <h3 className="text-xl font-display font-bold text-white mb-4">Pricing Information</h3>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <div className="p-3 rounded-lg glass-light">
                                                <p className="text-[var(--color-text-muted)] text-sm">Base Price</p>
                                                <p className="text-white font-bold text-lg">{formatCurrency(property.pricing?.basePrice)} <span className="text-sm font-normal text-[var(--color-text-muted)]">/night</span></p>
                                            </div>
                                            {property.pricing?.cleaningFee > 0 && (
                                                <div className="p-3 rounded-lg glass-light">
                                                    <p className="text-[var(--color-text-muted)] text-sm">Cleaning Fee</p>
                                                    <p className="text-white font-semibold">{formatCurrency(property.pricing.cleaningFee)}</p>
                                                </div>
                                            )}
                                            {property.pricing?.serviceFee > 0 && (
                                                <div className="p-3 rounded-lg glass-light">
                                                    <p className="text-[var(--color-text-muted)] text-sm">Service Fee</p>
                                                    <p className="text-white font-semibold">{formatCurrency(property.pricing.serviceFee)}</p>
                                                </div>
                                            )}
                                            <div className="p-3 rounded-lg glass-light">
                                                <p className="text-[var(--color-text-muted)] text-sm">Minimum Stay</p>
                                                <p className="text-white font-semibold">{property.pricing?.minimumStay || 2} nights</p>
                                            </div>
                                            {property.pricing?.weeklyDiscount > 0 && (
                                                <div className="p-3 rounded-lg glass-light">
                                                    <p className="text-[var(--color-text-muted)] text-sm">Weekly Discount</p>
                                                    <p className="text-[var(--color-success)] font-semibold">{property.pricing.weeklyDiscount}% off</p>
                                                </div>
                                            )}
                                            {property.pricing?.monthlyDiscount > 0 && (
                                                <div className="p-3 rounded-lg glass-light">
                                                    <p className="text-[var(--color-text-muted)] text-sm">Monthly Discount</p>
                                                    <p className="text-[var(--color-success)] font-semibold">{property.pricing.monthlyDiscount}% off</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Amenities Tab */}
                            {activeTab === 'amenities' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        Amenities & Features
                                    </h2>
                                    {property.amenities && property.amenities.length > 0 ? (
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {property.amenities.map((amenity, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg glass-light">
                                                    <div className="text-[var(--color-primary)] text-xl">
                                                        {getAmenityIcon(amenity.category)}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{amenity.name}</p>
                                                        {amenity.description && (
                                                            <p className="text-[var(--color-text-muted)] text-sm mt-1">{amenity.description}</p>
                                                        )}
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
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        Policies & Important Notes
                                    </h2>
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

                                    {/* Cancellation info placeholder */}
                                    <div className="p-5 rounded-xl glass-light">
                                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <HiCreditCard className="w-5 h-5 text-[var(--color-primary)]" />
                                            Cancellation Policy
                                        </h3>
                                        <p className="text-[var(--color-text-secondary)]">
                                            Free cancellation up to 30 days before check-in. For more details, please contact the host.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <h2 className="text-2xl font-display font-bold text-white">
                                            Reviews ({reviews.length})
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <HiStar className="w-6 h-6 text-[var(--color-primary)]" />
                                            <span className="text-2xl font-bold text-white">{property.ratings?.average || 0}</span>
                                            <span className="text-[var(--color-text-muted)]">
                                                · {property.ratings?.count || 0} reviews
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rating breakdown */}
                                    {property.ratings?.breakdown && Object.keys(property.ratings.breakdown).length > 0 && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(property.ratings.breakdown).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between p-3 rounded-lg glass-light">
                                                    <span className="text-[var(--color-text-secondary)] capitalize">{key}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-[var(--color-primary)] rounded-full"
                                                                style={{ width: `${(value / 5) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-white text-sm font-medium">{value?.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Review list */}
                                    <div className="space-y-4">
                                        {reviews.length > 0 ? (
                                            reviews.map((review) => (
                                                <ReviewCard key={review._id} review={review} />
                                            ))
                                        ) : (
                                            <p className="text-[var(--color-text-muted)] text-center py-8">
                                                No reviews yet. Be the first to review!
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'availability' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        Availability Calendar
                                    </h2>
                                    <p className="text-[var(--color-text-secondary)] mb-6">
                                        Select your dates to check availability. Booked dates are marked in red.
                                    </p>
                                    <AvailabilityCalendar
                                        propertyId={property._id}
                                        onDateSelect={(dates) => {
                                            if (dates.start && dates.end) {
                                                // Scroll to booking widget or auto-fill dates
                                                const bookingWidget = document.querySelector('.booking-widget');
                                                if (bookingWidget) {
                                                    bookingWidget.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }
                                        }}
                                    />
                                </motion.div>
                            )}

                            {/* Location Tab */}
                            {activeTab === 'location' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-display font-bold text-white mb-4">
                                        Location
                                    </h2>

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

                                    {/* Nearby Places - detailed */}
                                    {property.location?.nearbyPlaces && property.location.nearbyPlaces.length > 0 && (
                                        <div>
                                            <h3 className="text-xl font-display font-bold text-white mb-4">
                                                Nearby Places
                                            </h3>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                {property.location.nearbyPlaces.map((place, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg glass-light">
                                                        <div className="flex items-center gap-3">
                                                            <HiLocationMarker className="w-5 h-5 text-[var(--color-primary)]" />
                                                            <div>
                                                                <p className="text-white font-medium">{place.name}</p>
                                                                <p className="text-xs text-[var(--color-text-muted)] capitalize">{place.type?.replace('_', ' ')}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[var(--color-primary)] text-sm font-medium">{place.distance}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Sidebar - Booking widget */}
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
                        <h2 className="section-title text-white text-center mb-12">
                            Similar Properties
                        </h2>
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