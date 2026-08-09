import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiBadgeCheck,
  HiCalendar,
  HiCheck,
  HiChevronLeft,
  HiChevronRight,
  HiHeart,
  HiLocationMarker,
  HiMail,
  HiPhone,
  HiPhotograph,
  HiShare,
  HiShieldCheck,
  HiSparkles,
  HiStar,
  HiUsers,
  HiWifi,
  HiX,
} from 'react-icons/hi';
import {
  FaBath,
  FaBed,
  FaCar,
  FaRulerCombined,
  FaShieldAlt,
  FaSoap,
  FaTv,
  FaUtensils,
} from 'react-icons/fa';
import { PiSwimmingPoolBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import SEOHead from '../components/common/SEOHead';
import SkeletonLoader from '../components/common/SkeletonLoader';
import AvailabilityCalendar from '../components/common/AvailabilityCalendar';
import PropertyCard from '../components/properties/PropertyCard';
import BookingWidget from '../components/booking/BookingWidget';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import apiService from '../config/api';
import { formatTimeAgo } from '../utils/helpers';
import { THEME } from '../config/theme.config';
import { APP_CONFIG } from '../config/constants';
import backgroundImage from '../assets/why-choose-us-bg.png'

// All 7 tabs
const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'images', label: 'Images' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'availability', label: 'Availability' },
  { id: 'policies', label: 'Policies' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'location', label: 'Location' },
];

const getAmenityIcon = (category) => {
  const iconClass = 'h-4 w-4 sm:h-5 sm:w-5';

  const icons = {
    basic: <HiWifi className={iconClass} />,
    kitchen: <FaUtensils className={iconClass} />,
    bathroom: <FaSoap className={iconClass} />,
    outdoor: <PiSwimmingPoolBold className={iconClass} />,
    entertainment: <FaTv className={iconClass} />,
    safety: <FaShieldAlt className={iconClass} />,
    accessibility: <FaCar className={iconClass} />,
    other: <HiSparkles className={iconClass} />,
  };

  return icons[category] || icons.other;
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

// Format description into paragraphs
const formatDescriptionParagraphs = (description) => {
  if (!description) return [];
  const paragraphs = description.split(/\n\s*\n/);
  return paragraphs.filter(p => p.trim().length > 0);
};

// Full Images Grid Component
const FullImagesGrid = ({ images = [], alt }) => {
  const [modalIndex, setModalIndex] = useState(null);
  const galleryImages = images.filter((img) => img?.url);

  return (
    <>
      {galleryImages.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {galleryImages.map((image, index) => (
            <motion.button
              type="button"
              key={image._id || image.url}
              onClick={() => setModalIndex(index)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.5) }}
              className="group relative h-56 overflow-hidden rounded-xl bg-gray-100 shadow-sm ring-1 ring-black/5 sm:h-64 sm:rounded-2xl"
            >
              <img
                src={image.url}
                alt={`${alt} ${index + 1}`}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="absolute bottom-3 left-3 translate-y-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-gray-900 opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-4 sm:left-4 sm:px-4 sm:py-2 sm:text-sm">
                View Image
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No images available.</p>
      )}

      <AnimatePresence>
        {modalIndex !== null && (
          <GalleryModal
            images={galleryImages}
            currentIndex={modalIndex}
            setCurrentIndex={setModalIndex}
            onClose={() => setModalIndex(null)}
            alt={alt}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const GalleryModal = ({ images, currentIndex, setCurrentIndex, onClose, alt }) => {
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-xl transition hover:scale-105 sm:right-6 sm:top-6 sm:h-12 sm:w-12"
      >
        <HiX className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white hover:text-gray-900 sm:left-4 sm:h-12 sm:w-12"
          >
            <HiChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>

          <button
            type="button"
            onClick={nextImage}
            className="absolute right-2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white hover:text-gray-900 sm:right-4 sm:h-12 sm:w-12"
          >
            <HiChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>
        </>
      )}

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.25 }}
        className="relative flex max-h-[85vh] w-full max-w-6xl items-center justify-center"
      >
        <img
          src={images[currentIndex]?.url}
          alt={`${alt} ${currentIndex + 1}`}
          className="max-h-[85vh] w-full rounded-2xl object-contain shadow-2xl sm:rounded-3xl"
        />
      </motion.div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs font-semibold text-white backdrop-blur sm:gap-3 sm:px-5 sm:py-3 sm:text-sm">
        <HiPhotograph className="h-4 w-4 sm:h-5 sm:w-5" />
        {currentIndex + 1} / {images.length}
      </div>
    </motion.div>
  );
};

const PropertyImageShowcase = ({ images = [], alt }) => {
  const [modalIndex, setModalIndex] = useState(null);

  const galleryImages = images.filter((img) => img?.url);
  const previewImages = galleryImages.slice(0, 5);

  if (!galleryImages.length) return null;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-20 mx-auto -mt-12 max-w-[1400px] px-3 pb-8 sm:-mt-16 sm:px-4 lg:px-6"
      >
        <div className="rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 sm:rounded-3xl sm:p-3">
          <div className="grid gap-2 sm:gap-3 lg:grid-cols-4 lg:grid-rows-2">
            <motion.button
              type="button"
              onClick={() => setModalIndex(0)}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="group relative h-[220px] overflow-hidden rounded-xl sm:h-[300px] lg:col-span-2 lg:row-span-2 lg:h-[460px] xl:h-[500px]"
            >
              <img
                src={previewImages[0]?.url}
                alt={alt}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 sm:bottom-5 sm:left-5 sm:right-5">
                <div className="hidden sm:block">
                  <p className="text-left text-lg font-black text-white sm:text-xl lg:text-2xl">
                    Property Gallery
                  </p>
                  <p className="mt-0.5 text-left text-xs font-semibold text-white/80 sm:text-sm">
                    Tap to view fullscreen
                  </p>
                </div>
                <div className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-gray-900 sm:px-4 sm:py-2 sm:text-sm">
                  {galleryImages.length} Images
                </div>
              </div>
            </motion.button>

            {previewImages.slice(1, 5).map((image, index) => {
              const realIndex = index + 1;
              const showMore = realIndex === 4 && galleryImages.length > 5;

              return (
                <motion.button
                  type="button"
                  key={image._id || image.url}
                  onClick={() => setModalIndex(realIndex)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="group relative h-[110px] overflow-hidden rounded-xl sm:h-[150px] lg:h-full"
                >
                  <img
                    src={image.url}
                    alt={`${alt} ${realIndex + 1}`}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/25" />

                  {showMore && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 text-white backdrop-blur-sm">
                      <HiPhotograph className="mb-1 h-6 w-6 sm:mb-2 sm:h-7 sm:w-7" />
                      <span className="text-lg font-black sm:text-xl">+{galleryImages.length - 5}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 sm:text-xs">
                        View All
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {modalIndex !== null && (
          <GalleryModal
            images={galleryImages}
            currentIndex={modalIndex}
            setCurrentIndex={setModalIndex}
            onClose={() => setModalIndex(null)}
            alt={alt}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const MetricCard = ({ icon: Icon, label, value, color = 'var(--color-primary)', delay = 0 }) => (
  <motion.div
    variants={fadeInUp}
    custom={delay}
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    className="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md sm:rounded-2xl sm:p-4"
  >
    <Icon className="mx-auto mb-1 h-5 w-5 sm:mb-2 sm:h-6 sm:w-6" style={{ color }} />
    <p className="text-lg font-black text-gray-900 sm:text-xl">{value || 0}</p>
    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 sm:text-xs">
      {label}
    </p>
  </motion.div>
);

const ReviewCard = ({ review, index }) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05, duration: 0.4 }}
    whileHover={{ y: -3 }}
    className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md sm:rounded-2xl sm:p-5"
  >
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-black text-[var(--color-primary)] sm:h-11 sm:w-11 sm:text-sm">
          {review.user?.firstName?.[0]}
          {review.user?.lastName?.[0]}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-black text-gray-900 sm:text-base">
              {review.user?.firstName} {review.user?.lastName}
            </h4>
            {review.verified && (
              <HiBadgeCheck className="h-3 w-3 text-blue-500 sm:h-4 sm:w-4" />
            )}
          </div>
          <p className="text-[10px] font-medium text-gray-500 sm:text-xs">
            {formatTimeAgo(review.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-xs font-black text-gray-900 sm:px-3 sm:py-1 sm:text-sm">
        <HiStar className="h-3 w-3 text-[var(--color-primary)] sm:h-4 sm:w-4" />
        {review.rating}
      </div>
    </div>

    {review.title && (
      <h5 className="mt-3 text-sm font-black text-gray-900 sm:mt-4 sm:text-base">
        {review.title}
      </h5>
    )}

    <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-7">
      {review.content}
    </p>

    {review.response?.text && (
      <div className="mt-3 rounded-xl border-l-4 border-[var(--color-primary)] bg-gray-50 p-3 sm:mt-4 sm:p-4">
        <p className="text-[10px] font-black uppercase text-[var(--color-primary)] sm:text-xs">
          Response from Host
        </p>
        <p className="mt-1 text-xs text-gray-600 sm:text-sm">
          {review.response.text}
        </p>
      </div>
    )}
  </motion.article>
);

// Horizontal Tab Slider Component
const TabSlider = ({ tabs, activeTab, setActiveTab, totalImages, totalReviews }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 20);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 20
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      checkScroll();
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-6">
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white shadow-lg p-1.5 sm:p-2 hover:bg-gray-100 transition-all"
          aria-label="Scroll left"
        >
          <HiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide px-5 sm:px-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:px-4 sm:py-2.5 sm:text-sm font-bold capitalize transition-all ${activeTab === tab.id
                ? 'bg-[var(--color-primary)] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] shadow-sm'
              }`}
          >
            {tab.label}
            {tab.id === 'images' && totalImages > 0 && (
              <span className="ml-1 text-[10px] sm:text-xs">({totalImages})</span>
            )}
            {tab.id === 'reviews' && totalReviews > 0 && (
              <span className="ml-1 text-[10px] sm:text-xs">({totalReviews})</span>
            )}
          </motion.button>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white shadow-lg p-1.5 sm:p-2 hover:bg-gray-100 transition-all"
          aria-label="Scroll right"
        >
          <HiChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
        </button>
      )}
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
          const reviewsResponse = await apiService.getPropertyReviews(propertyData._id);

          const fetchedReviews =
            reviewsResponse.data.reviews ||
            reviewsResponse.data.data ||
            (Array.isArray(reviewsResponse.data) ? reviewsResponse.data : []);

          setReviews(
            fetchedReviews.filter(
              (review) => review.status === 'approved' || !review.status
            )
          );
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

  if (loading) {
    return (
      <div className="bg-gray-50 pt-20 sm:pt-24 lg:pt-28">
        <div className="mx-auto max-w-[1400px] px-3 py-8 sm:px-4 sm:py-10 lg:px-6">
          <SkeletonLoader type="detail" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-gray-50 pt-20 sm:pt-24 lg:pt-28">
        <div className="mx-auto max-w-[1400px] px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
              Property Not Found
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-gray-500 sm:text-base">
              The property you're looking for does not exist or is no longer available.
            </p>
            <Link
              to="/properties"
              className="mt-6 inline-flex rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 sm:mt-8"
            >
              Browse Properties
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const isFav = isFavorite(property._id);

  const averageRating = reviews.length
    ? Math.round(
      (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10
    ) / 10
    : property.ratings?.average || 0;

  const totalReviews = reviews.length || property.ratings?.count || 0;
  const totalImages = property.images?.length || 0;
  const heroImage = property.images?.[0]?.url || THEME.hero.heroImage;

  const descriptionParagraphs = formatDescriptionParagraphs(
    property.description?.full || property.description?.short || ''
  );

  const propertyUrl = `/properties/${property.slug || slug}`;
  const propertyImages = property.images?.map((image) => image?.url).filter(Boolean) || [];
  const propertyDescription = property.description?.full || property.description?.short || '';
  const propertyStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: property.name,
    description: propertyDescription,
    image: propertyImages.length ? propertyImages : [heroImage],
    url: `${APP_CONFIG.url.replace(/\/+$/, '')}${propertyUrl}`,
    telephone: APP_CONFIG.phoneHref,
    priceRange: property.pricing?.basePrice ? `$${property.pricing.basePrice}+ per night` : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.location?.address,
      addressLocality: property.location?.city || 'Miami',
      addressRegion: property.location?.state || 'FL',
      addressCountry: property.location?.country || 'US',
    },
    aggregateRating: totalReviews > 0 && averageRating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: totalReviews,
    } : undefined,
    amenityFeature: property.amenities?.map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity.name || amenity,
      value: true,
    })),
  };

  return (
    <>
      <SEOHead
        title={property.name}
        description={property.description?.short || propertyDescription}
        image={heroImage}
        url={propertyUrl}
        type="website"
        keywords={`${property.name}, Miami vacation rental, luxury Miami stay, ${property.location?.neighborhood || property.location?.city || 'Miami'} rental`}
        structuredData={propertyStructuredData}
      />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-gray-900 pt-20 text-white sm:pt-24 lg:pt-28">
        <img
          src={heroImage}
          alt={property.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="mb-4 flex flex-wrap gap-2 sm:mb-5">
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur sm:px-4 sm:py-1.5 sm:text-xs capitalize">
                {property.type}
              </span>
              {property.featured && (
                <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white sm:px-4 sm:py-1.5 sm:text-xs">
                  Featured
                </span>
              )}
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur sm:px-4 sm:py-1.5 sm:text-xs">
                Verified Stay
              </span>
            </div>

            <h1 className="text-3xl font-black uppercase leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              {property.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/85 sm:mt-5 sm:gap-4 sm:text-sm">
              <span className="flex items-center gap-1.5 sm:gap-2">
                <HiLocationMarker className="h-4 w-4 text-[var(--color-primary)] sm:h-5 sm:w-5" />
                <span className="max-w-[200px] truncate sm:max-w-none">
                  {property.location?.neighborhood}, {property.location?.city}
                </span>
              </span>
              <span className="flex items-center gap-1.5 sm:gap-2">
                <HiStar className="h-4 w-4 text-yellow-400 sm:h-5 sm:w-5" />
                {averageRating} ({totalReviews})
              </span>
              <span className="flex items-center gap-1.5 sm:gap-2">
                <HiUsers className="h-4 w-4 text-[var(--color-accent)] sm:h-5 sm:w-5" />
                {property.details?.maxGuests} guests
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  if (isAuthenticated) toggleFavorite(property._id);
                  else toast.error('Please login to save favorites');
                }}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-lg transition-all sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm ${isFav
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-white text-gray-900'
                  }`}
              >
                <HiHeart className={`h-4 w-4 sm:h-5 sm:w-5 ${isFav ? 'fill-current' : ''}`} />
                Save
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }}
                className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-900 shadow-lg transition-all sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                <HiShare className="h-4 w-4 sm:h-5 sm:w-5" />
                Share
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="bg-gray-50 pb-12 sm:pb-16 lg:pb-20">
        <PropertyImageShowcase images={property.images} alt={property.name} />

        <div className="mx-auto max-w-[1400px] px-3 sm:px-4 lg:px-6">
          {/* Tab Slider */}
          <TabSlider
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            totalImages={totalImages}
            totalReviews={totalReviews}
          />

          <div className="grid gap-6 lg:grid-cols-[1fr_360px] xl:gap-8">
            {/* Main Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:rounded-2xl sm:p-6">
                  <h2 className="mb-3 text-xl font-black text-gray-900 sm:mb-4 sm:text-2xl">
                    About this stay
                  </h2>

                  <div className="space-y-4">
                    {descriptionParagraphs.map((paragraph, idx) => (
                      <motion.p
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-8"
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </div>

                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:grid-cols-4 sm:gap-4"
                  >
                    <MetricCard icon={FaBed} label="Bedrooms" value={property.details?.bedrooms} delay={0} />
                    <MetricCard icon={FaBath} label="Bathrooms" value={property.details?.bathrooms} color="var(--color-secondary)" delay={1} />
                    <MetricCard icon={HiUsers} label="Guests" value={property.details?.maxGuests} color="var(--color-accent)" delay={2} />
                    <MetricCard icon={FaRulerCombined} label="Sq Ft" value={property.details?.squareFeet} color="#FFB82E" delay={3} />
                  </motion.div>

                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4"
                  >
                    {[
                      { icon: HiCalendar, text: 'Flexible stay dates', sub: 'Weekend & extended stays', color: 'var(--color-primary)' },
                      { icon: HiShieldCheck, text: 'Verified stay', sub: 'Quality checked before arrival', color: 'var(--color-secondary)' },
                      { icon: HiPhone, text: 'Local concierge', sub: '24/7 guest support', color: 'var(--color-accent)' },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        variants={fadeInUp}
                        className="rounded-xl bg-gray-50 p-3 sm:rounded-2xl sm:p-4"
                      >
                        <item.icon className="mb-2 h-5 w-5 sm:mb-3 sm:h-6 sm:w-6" style={{ color: item.color }} />
                        <p className="text-sm font-black text-gray-900 sm:text-base">{item.text}</p>
                        <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">{item.sub}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* Images Tab */}
              {activeTab === 'images' && (
                <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:rounded-2xl sm:p-6">
                  <h2 className="mb-3 text-xl font-black text-gray-900 sm:mb-4 sm:text-2xl">
                    All Images ({totalImages})
                  </h2>
                  <FullImagesGrid images={property.images} alt={property.name} />
                </div>
              )}

              {/* Amenities Tab */}
              {activeTab === 'amenities' && (
                <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:rounded-2xl sm:p-6">
                  <h2 className="mb-3 text-xl font-black text-gray-900 sm:mb-4 sm:text-2xl">
                    Amenities
                  </h2>
                  {property.amenities?.length > 0 ? (
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="grid gap-2 sm:grid-cols-2 sm:gap-3"
                    >
                      {property.amenities.map((amenity, index) => (
                        <motion.div
                          key={index}
                          variants={fadeInUp}
                          whileHover={{ y: -2 }}
                          className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 transition-all hover:shadow-sm sm:gap-4 sm:p-4"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] sm:h-10 sm:w-10">
                            {getAmenityIcon(amenity.category)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 sm:text-base">
                              {amenity.name}
                            </p>
                            {amenity.description && (
                              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                {amenity.description}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <p className="text-sm text-gray-500">No amenities listed.</p>
                  )}
                </div>
              )}

              {/* Availability Tab */}
              {activeTab === 'availability' && (
                <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:rounded-2xl sm:p-6">
                  <h2 className="mb-2 text-xl font-black text-gray-900 sm:mb-3 sm:text-2xl">
                    Availability Calendar
                  </h2>
                  <p className="mb-4 text-xs text-gray-500 sm:mb-6 sm:text-sm">
                    Check open nights before starting checkout. Booked dates are disabled.
                  </p>
                  <AvailabilityCalendar propertyId={property._id} />
                  <div className="mt-4 flex flex-col gap-2 rounded-xl bg-gray-50 p-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                    <div>
                      <p className="text-sm font-black text-gray-900 sm:text-base">
                        Ready to reserve?
                      </p>
                      <p className="text-xs text-gray-500 sm:text-sm">
                        Continue to checkout to select dates and guests.
                      </p>
                    </div>
                    <Link
                      to={`/booking/${property._id}`}
                      className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-2 text-center text-xs font-semibold text-white transition hover:-translate-y-0.5 sm:px-6 sm:py-2.5 sm:text-sm"
                    >
                      Start Booking
                    </Link>
                  </div>
                </div>
              )}

              {/* Policies Tab */}
              {activeTab === 'policies' && (
                <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:rounded-2xl sm:p-6">
                  <h2 className="mb-3 text-xl font-black text-gray-900 sm:mb-4 sm:text-2xl">
                    Policies & Important Notes
                  </h2>
                  {property.policiesAndNotes?.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {property.policiesAndNotes.map((policy, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="rounded-xl border border-gray-100 p-4 sm:rounded-2xl sm:p-5"
                        >
                          <h3 className="flex items-center gap-2 font-black text-gray-900 text-sm sm:text-base">
                            <HiShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-primary)]" />
                            {policy.title}
                          </h3>
                          <ul className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
                            {policy.points?.map((point, pointIndex) => (
                              <li key={pointIndex} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                                <HiCheck className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-[var(--color-accent)]" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No policies listed.</p>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:rounded-2xl sm:p-6">
                  <h2 className="mb-3 text-xl font-black text-gray-900 sm:mb-4 sm:text-2xl">
                    Guest Reviews
                  </h2>
                  <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-gray-50 p-3 sm:mb-6 sm:gap-4 sm:p-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <HiStar className="h-6 w-6 text-[var(--color-primary)] sm:h-7 sm:w-7" />
                      <span className="text-2xl font-black text-gray-900 sm:text-3xl">
                        {averageRating}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 sm:text-sm">
                      Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>

                  {reviews.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {reviews.map((review, index) => (
                        <ReviewCard key={review._id} review={review} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center sm:p-10">
                      <HiStar className="mx-auto mb-3 h-10 w-10 text-gray-300 opacity-40 sm:mb-4 sm:h-12 sm:w-12" />
                      <p className="text-base font-black text-gray-900 sm:text-lg">
                        No reviews yet
                      </p>
                      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        Be the first to share this stay experience.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:rounded-2xl sm:p-6">
                  <h2 className="mb-3 text-xl font-black text-gray-900 sm:mb-4 sm:text-2xl">
                    Location
                  </h2>
                  <div className="mb-4 grid gap-2 sm:mb-6 sm:grid-cols-3 sm:gap-3">
                    {[
                      { label: 'Neighborhood', value: property.location?.neighborhood },
                      { label: 'City', value: `${property.location?.city}, ${property.location?.state}` },
                      { label: 'Address', value: property.location?.address },
                    ].map((item, idx) => (
                      <div key={idx} className="rounded-xl bg-gray-50 p-3 sm:p-4">
                        <p className="text-[10px] font-black uppercase text-[var(--color-primary)] sm:text-xs">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-gray-900 sm:text-base">
                          {item.value || 'Not specified'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {property.location?.coordinates?.coordinates && (
                    <div className="h-[280px] overflow-hidden rounded-xl ring-1 ring-black/5 sm:h-[380px] sm:rounded-2xl">
                      <MapContainer
                        center={[
                          property.location.coordinates.coordinates[1],
                          property.location.coordinates.coordinates[0],
                        ]}
                        zoom={14}
                        scrollWheelZoom={false}
                        className="h-full w-full"
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
                            <strong className="text-sm">{property.name}</strong>
                            <br />
                            <span className="text-xs">{property.location?.address}</span>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Sidebar - Booking Widget */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <BookingWidget property={property} />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:mt-5 sm:rounded-2xl sm:p-5"
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)] sm:text-xs">
                  Local Support
                </p>
                <h3 className="mt-1 text-base font-black text-gray-900 sm:text-lg">
                  Need help planning?
                </h3>
                <div className="mt-3 space-y-2 text-xs font-semibold text-gray-600 sm:mt-4 sm:space-y-3 sm:text-sm">
                  <a
                    href={`tel:${APP_CONFIG.phoneHref}`}
                    className="flex items-center gap-2 transition hover:text-[var(--color-primary)]"
                  >
                    <HiPhone className="h-3.5 w-3.5 text-[var(--color-primary)] sm:h-4 sm:w-4" />
                    {APP_CONFIG.phone}
                  </a>
                  <a
                    href={`mailto:${APP_CONFIG.email}`}
                    className="flex items-center gap-2 transition hover:text-[var(--color-primary)]"
                  >
                    <HiMail className="h-3.5 w-3.5 text-[var(--color-primary)] sm:h-4 sm:w-4" />
                    {APP_CONFIG.email}
                  </a>
                </div>
              </motion.div>
            </motion.aside>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-[1400px] px-3 pt-12 sm:px-4 sm:pt-16 lg:px-6"
          >
            <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)] sm:text-xs">
                  More Options
                </p>
                <h2 className="text-xl font-black text-gray-900 sm:text-2xl lg:text-3xl">
                  Similar Properties
                </h2>
              </div>
              <Link
                to="/properties"
                className="text-xs font-semibold text-[var(--color-primary)] transition hover:underline sm:text-sm"
              >
                View all stays â†’
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
              {similarProperties.slice(0, 4).map((similar, index) => (
                <motion.div
                  key={similar._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <PropertyCard property={similar} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </>
  );
};

export default PropertyDetailsPage;
