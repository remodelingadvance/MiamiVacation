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
} from 'react-icons/hi';
import { FaBed, FaBath, FaRulerCombined, FaParking } from 'react-icons/fa';
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
        image={property.images[0]?.url}
        type="property"
      />

      {/* Header */}
      <section className="pt-24 pb-0">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="badge badge-primary">{property.type}</span>
                {property.featured && (
                  <span className="badge badge-warning">Featured</span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {property.name}
              </h1>
              <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-1">
                  <HiLocationMarker className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>{property.location.neighborhood}, {property.location.city}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HiStar className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>{property.ratings.average} ({property.ratings.count} reviews)</span>
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isFav
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
      <section className="pb-8">
        <div className="container-custom">
          <ImageGallery images={property.images} alt={property.name} />
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-white/10 pb-4">
                {['overview', 'amenities', 'reviews', 'location'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      activeTab === tab
                        ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
                        : 'text-[var(--color-text-secondary)] hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Overview */}
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
                      {property.description.full}
                    </p>
                  </div>

                  {/* Key details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { icon: FaBed, label: 'Bedrooms', value: property.details.bedrooms },
                      { icon: FaBath, label: 'Bathrooms', value: property.details.bathrooms },
                      { icon: HiUsers, label: 'Max Guests', value: property.details.maxGuests },
                      { icon: FaRulerCombined, label: 'Size', value: `${property.details.size} sq ft` },
                    ].map((detail) => (
                      <div key={detail.label} className="p-4 rounded-xl glass-light text-center">
                        <detail.icon className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
                        <p className="text-white font-semibold">{detail.value}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{detail.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* House rules */}
                  <div>
                    <h3 className="text-xl font-display font-bold text-white mb-4">House Rules</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg glass-light">
                        <HiCalendar className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">Check-in</p>
                          <p className="text-[var(--color-text-secondary)] text-sm">{property.houseRules.checkIn}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg glass-light">
                        <HiCalendar className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">Check-out</p>
                          <p className="text-[var(--color-text-secondary)] text-sm">{property.houseRules.checkOut}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg glass-light">
                        <HiCheck className="w-5 h-5 text-[var(--color-success)] flex-shrink-0" />
                        <p className="text-[var(--color-text-secondary)] text-sm">
                          {property.houseRules.smoking ? 'Smoking allowed' : 'No smoking'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg glass-light">
                        <HiCheck className="w-5 h-5 text-[var(--color-success)] flex-shrink-0" />
                        <p className="text-[var(--color-text-secondary)] text-sm">
                          {property.houseRules.pets ? 'Pets allowed' : 'No pets'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Amenities */}
              {activeTab === 'amenities' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-display font-bold text-white mb-4">
                    Amenities
                  </h2>
                  {property.amenities && property.amenities.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {property.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg glass-light">
                          <span className="text-2xl">{amenity.icon || '✨'}</span>
                          <span className="text-[var(--color-text-secondary)]">{amenity.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--color-text-muted)]">No amenities listed</p>
                  )}
                </motion.div>
              )}

              {/* Reviews */}
              {activeTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display font-bold text-white">
                      Reviews ({reviews.length})
                    </h2>
                    <div className="flex items-center gap-2">
                      <HiStar className="w-6 h-6 text-[var(--color-primary)]" />
                      <span className="text-2xl font-bold text-white">{property.ratings.average}</span>
                      <span className="text-[var(--color-text-muted)]">
                        · {property.ratings.count} reviews
                      </span>
                    </div>
                  </div>

                  {/* Rating breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(property.ratings.breakdown || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg glass-light">
                        <span className="text-[var(--color-text-secondary)] capitalize">{key}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--color-primary)] rounded-full"
                              style={{ width: `${(value / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-white text-sm font-medium">{value.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

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

              {/* Location */}
              {activeTab === 'location' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-display font-bold text-white mb-4">
                    Location
                  </h2>
                  
                  {/* Map */}
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

                  {/* Nearby attractions */}
                  {property.location.nearbyAttractions && property.location.nearbyAttractions.length > 0 && (
                    <div>
                      <h3 className="text-xl font-display font-bold text-white mb-4">
                        Nearby Attractions
                      </h3>
                      <div className="space-y-3">
                        {property.location.nearbyAttractions.map((attraction, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg glass-light">
                            <div className="flex items-center gap-3">
                              <HiLocationMarker className="w-5 h-5 text-[var(--color-primary)]" />
                              <div>
                                <p className="text-white font-medium">{attraction.name}</p>
                                <p className="text-xs text-[var(--color-text-muted)] capitalize">{attraction.type}</p>
                              </div>
                            </div>
                            <span className="text-[var(--color-primary)] text-sm font-medium">
                              {attraction.distance}
                            </span>
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