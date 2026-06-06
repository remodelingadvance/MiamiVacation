import { useEffect, useState } from 'react';
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

const tabs = ['overview', 'images', 'amenities', 'availability', 'policies', 'reviews', 'location'];

const getAmenityIcon = (category) => {
  const iconClass = 'h-5 w-5';

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

const GalleryModal = ({ images, currentIndex, setCurrentIndex, onClose, alt }) => {
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--color-text-primary)] shadow-xl transition hover:scale-105 sm:right-8 sm:top-8"
      >
        <HiX className="h-6 w-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-3 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white hover:text-[var(--color-text-primary)] sm:left-8"
          >
            <HiChevronLeft className="h-8 w-8" />
          </button>

          <button
            type="button"
            onClick={nextImage}
            className="absolute right-3 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white hover:text-[var(--color-text-primary)] sm:right-8"
          >
            <HiChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.25 }}
        className="relative flex max-h-[88vh] w-full max-w-7xl items-center justify-center"
      >
        <img
          src={images[currentIndex]?.url}
          alt={`${alt} ${currentIndex + 1}`}
          className="max-h-[88vh] w-full rounded-3xl object-contain shadow-2xl"
        />
      </motion.div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/15 px-5 py-3 text-sm font-black text-white backdrop-blur">
        <HiPhotograph className="h-5 w-5" />
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
      <section className="relative z-20 mx-auto -mt-16 max-w-[1400px] px-4 pb-10 sm:px-6 lg:px-8">
        <div className="rounded-[34px] bg-white p-3 shadow-[0_28px_90px_rgba(17,24,39,0.18)] ring-1 ring-black/5">
          <div className="grid gap-3 lg:grid-cols-4 lg:grid-rows-2">
            <motion.button
              type="button"
              onClick={() => setModalIndex(0)}
              whileHover={{ scale: 1.01 }}
              className="group relative h-[280px] overflow-hidden rounded-[28px] sm:h-[380px] lg:col-span-2 lg:row-span-2 lg:h-[520px]"
            >
              <img
                src={previewImages[0]?.url}
                alt={alt}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-left text-2xl font-black text-white sm:text-3xl">
                    Property Gallery
                  </p>
                  <p className="mt-1 text-left text-sm font-semibold text-white/80">
                    Click image to view fullscreen
                  </p>
                </div>

                <div className="rounded-full bg-white px-4 py-2 text-sm font-black text-[var(--color-text-primary)]">
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
                  className="group relative h-[155px] overflow-hidden rounded-[24px] sm:h-[200px] lg:h-full"
                >
                  <img
                    src={image.url}
                    alt={`${alt} ${realIndex + 1}`}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/25" />

                  {showMore && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 text-white backdrop-blur-sm">
                      <HiPhotograph className="mb-2 h-9 w-9" />
                      <span className="text-2xl font-black">+{galleryImages.length - 5}</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                        View More
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

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

const FullImagesGrid = ({ images = [], alt }) => {
  const [modalIndex, setModalIndex] = useState(null);
  const galleryImages = images.filter((img) => img?.url);

  return (
    <>
      {galleryImages.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {galleryImages.map((image, index) => (
            <motion.button
              type="button"
              key={image._id || image.url}
              onClick={() => setModalIndex(index)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="group relative h-72 overflow-hidden rounded-[26px] bg-[var(--color-primary-light)] shadow-sm ring-1 ring-black/5"
            >
              <img
                src={image.url}
                alt={`${alt} ${index + 1}`}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

              <div className="absolute bottom-4 left-4 translate-y-4 rounded-full bg-white px-4 py-2 text-sm font-black text-[var(--color-text-primary)] opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100">
                View Image
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="text-[var(--color-text-muted)]">No images available.</p>
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

const MetricCard = ({ icon: Icon, label, value, color = 'var(--color-primary)' }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="rounded-2xl border border-[var(--color-border)] bg-white p-4 text-center shadow-sm transition-all hover:shadow-xl"
  >
    <Icon className="mx-auto mb-2 h-6 w-6" style={{ color }} />
    <p className="text-xl font-black text-[var(--color-text-primary)]">{value || 0}</p>
    <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
      {label}
    </p>
  </motion.div>
);

const ReviewCard = ({ review }) => (
  <motion.article
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -3 }}
    className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition-all hover:shadow-xl"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-black text-[var(--color-primary)]">
          {review.user?.firstName?.[0]}
          {review.user?.lastName?.[0]}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-black text-[var(--color-text-primary)]">
              {review.user?.firstName} {review.user?.lastName}
            </h4>

            {review.verified && (
              <HiBadgeCheck className="h-4 w-4 text-[var(--color-accent)]" />
            )}
          </div>

          <p className="text-xs font-medium text-[var(--color-text-muted)]">
            {formatTimeAgo(review.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-sm font-black text-[var(--color-text-primary)]">
        <HiStar className="h-4 w-4 text-[var(--color-primary)]" />
        {review.rating}
      </div>
    </div>

    {review.title && (
      <h5 className="mt-4 font-black text-[var(--color-text-primary)]">
        {review.title}
      </h5>
    )}

    <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
      {review.content}
    </p>

    {review.response?.text && (
      <div className="mt-4 rounded-xl border-l-4 border-[var(--color-primary)] bg-[var(--color-bg-medium)] p-4">
        <p className="text-xs font-black uppercase text-[var(--color-primary)]">
          Response from Miami Stay
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {review.response.text}
        </p>
      </div>
    )}
  </motion.article>
);

const SectionShell = ({ title, eyebrow, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.35 }}
    className="rounded-[30px] bg-white p-5 shadow-[0_18px_48px_rgba(8,19,76,0.08)] ring-1 ring-black/5 sm:p-7"
  >
    {eyebrow && (
      <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
        {eyebrow}
      </p>
    )}

    <h2 className="mb-5 text-2xl font-black text-[var(--color-text-primary)] sm:text-3xl">
      {title}
    </h2>

    {children}
  </motion.section>
);

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
      <div className="bg-[var(--color-bg-medium)] pt-28">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
          <SkeletonLoader type="detail" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-[var(--color-bg-medium)] pt-28">
        <div className="mx-auto max-w-[1400px] px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black text-[var(--color-text-primary)]">
            Property Not Found
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-[var(--color-text-secondary)]">
            The property you're looking for does not exist or is no longer available.
          </p>

          <Link to="/properties" className="btn-primary mt-8 inline-flex">
            Browse Properties
          </Link>
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

  return (
    <>
      <SEOHead
        title={property.name}
        description={property.description?.short}
        image={heroImage}
        type="property"
      />

      <section className="relative isolate overflow-hidden bg-[var(--color-secondary)] pt-28 text-white lg:pt-36">
        <img
          src={heroImage}
          alt={property.name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.92),rgba(17,24,39,0.72)_50%,rgba(17,24,39,0.22))]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.10),rgba(17,24,39,0.92))]" />
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-[var(--color-primary)]/30 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-5xl"
          >
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-wide text-white backdrop-blur capitalize">
                {property.type}
              </span>

              {property.featured && (
                <span className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
                  Featured
                </span>
              )}

              <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-wide text-white backdrop-blur">
                Verified Stay
              </span>
            </div>

            <h1 className="max-w-4xl font-hero text-5xl font-black uppercase leading-[0.92] sm:text-6xl lg:text-7xl">
              {property.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-semibold text-white/85">
              <span className="flex items-center gap-2">
                <HiLocationMarker className="h-5 w-5 text-[var(--color-primary)]" />
                {property.location?.address}, {property.location?.neighborhood},{' '}
                {property.location?.city}
              </span>

              <span className="flex items-center gap-2">
                <HiStar className="h-5 w-5 text-[#FFC83D]" />
                {averageRating} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>

              <span className="flex items-center gap-2">
                <HiUsers className="h-5 w-5 text-[var(--color-accent)]" />
                Up to {property.details?.maxGuests} guests
              </span>

              <span className="flex items-center gap-2">
                <HiPhotograph className="h-5 w-5 text-[var(--color-primary)]" />
                {totalImages} {totalImages === 1 ? 'image' : 'images'}
              </span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) toggleFavorite(property._id);
                  else toast.error('Please login to save favorites');
                }}
                className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black shadow-lg transition-all hover:-translate-y-0.5 ${
                  isFav
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-white text-[var(--color-text-primary)]'
                }`}
              >
                <HiHeart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }}
                className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[var(--color-text-primary)] shadow-lg transition-all hover:-translate-y-0.5"
              >
                <HiShare className="h-5 w-5" />
                Share
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="bg-[var(--color-bg-medium)] pb-16">
        <PropertyImageShowcase images={property.images} alt={property.name} />

        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-8">
              <div className="sticky top-[76px] z-30 -mx-4 overflow-x-auto border-y border-[var(--color-border)] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[96px] lg:mx-0 lg:rounded-[24px] lg:border lg:shadow-sm">
                <div className="flex min-w-max gap-2 lg:min-w-0 lg:flex-wrap">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-4 py-2 text-sm font-black capitalize transition-all ${
                        activeTab === tab
                          ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[rgba(255,79,123,0.25)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]'
                      }`}
                    >
                      {tab}
                      {tab === 'images' && totalImages > 0 && (
                        <span className="ml-1">({totalImages})</span>
                      )}
                      {tab === 'reviews' && totalReviews > 0 && (
                        <span className="ml-1">({totalReviews})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <SectionShell key="overview" title="About this stay" eyebrow="Overview">
                    <p className="whitespace-pre-line text-base leading-8 text-[var(--color-text-secondary)]">
                      {property.description?.full || property.description?.short}
                    </p>

                    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <MetricCard icon={FaBed} label="Bedrooms" value={property.details?.bedrooms} />
                      <MetricCard icon={FaBath} label="Bathrooms" value={property.details?.bathrooms} color="var(--color-secondary)" />
                      <MetricCard icon={HiUsers} label="Guests" value={property.details?.maxGuests} color="var(--color-accent)" />
                      <MetricCard icon={FaRulerCombined} label="Sq Ft" value={property.details?.squareFeet} color="#FFB82E" />
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl bg-[var(--color-primary-light)] p-5">
                        <HiCalendar className="mb-3 h-6 w-6 text-[var(--color-primary)]" />
                        <p className="font-black text-[var(--color-text-primary)]">Flexible stay dates</p>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          Weekend escapes and extended stays
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[var(--color-secondary-light)] p-5">
                        <HiShieldCheck className="mb-3 h-6 w-6 text-[var(--color-secondary)]" />
                        <p className="font-black text-[var(--color-text-primary)]">Verified stay</p>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          Quality checked before arrival
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#ECFDF3] p-5">
                        <HiPhone className="mb-3 h-6 w-6 text-[var(--color-accent)]" />
                        <p className="font-black text-[var(--color-text-primary)]">Local concierge</p>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          Help around the clock
                        </p>
                      </div>
                    </div>
                  </SectionShell>
                )}

                {activeTab === 'images' && (
                  <SectionShell key="images" title={`All Images (${totalImages})`} eyebrow="Gallery">
                    <FullImagesGrid images={property.images} alt={property.name} />
                  </SectionShell>
                )}

                {activeTab === 'amenities' && (
                  <SectionShell key="amenities" title="Amenities" eyebrow="Comforts">
                    {property.amenities?.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {property.amenities.map((amenity, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ y: -3 }}
                            className="flex items-start gap-4 rounded-2xl border border-[var(--color-border)] p-4 transition-all hover:shadow-lg"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                              {getAmenityIcon(amenity.category)}
                            </div>

                            <div>
                              <p className="font-black text-[var(--color-text-primary)]">
                                {amenity.name}
                              </p>

                              {amenity.description && (
                                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                                  {amenity.description}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[var(--color-text-muted)]">No amenities listed.</p>
                    )}
                  </SectionShell>
                )}

                {activeTab === 'availability' && (
                  <SectionShell key="availability" title="Availability calendar" eyebrow="Plan your dates">
                    <p className="mb-6 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
                      Check open nights before starting checkout. Booked and maintenance dates are disabled here.
                    </p>

                    <AvailabilityCalendar propertyId={property._id} />

                    <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-[var(--color-bg-medium)] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-black text-[var(--color-text-primary)]">Ready to reserve?</p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Continue to checkout to select dates and guests.
                        </p>
                      </div>

                      <Link to={`/booking/${property._id}`} className="btn-primary">
                        Start Booking
                      </Link>
                    </div>
                  </SectionShell>
                )}

                {activeTab === 'policies' && (
                  <SectionShell key="policies" title="Policies & important notes" eyebrow="Guest info">
                    {property.policiesAndNotes?.length > 0 ? (
                      <div className="space-y-4">
                        {property.policiesAndNotes.map((policy, index) => (
                          <div key={index} className="rounded-2xl border border-[var(--color-border)] p-5">
                            <h3 className="flex items-center gap-2 font-black text-[var(--color-text-primary)]">
                              <HiShieldCheck className="h-5 w-5 text-[var(--color-primary)]" />
                              {policy.title}
                            </h3>

                            <ul className="mt-3 space-y-2">
                              {policy.points.map((point, pointIndex) => (
                                <li key={pointIndex} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                                  <HiCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[var(--color-text-muted)]">No policies listed.</p>
                    )}
                  </SectionShell>
                )}

                {activeTab === 'reviews' && (
                  <SectionShell key="reviews" title="Guest reviews" eyebrow="Social proof">
                    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl bg-[var(--color-bg-medium)] p-5">
                      <div className="flex items-center gap-2">
                        <HiStar className="h-8 w-8 text-[var(--color-primary)]" />
                        <span className="text-4xl font-black text-[var(--color-text-primary)]">
                          {averageRating}
                        </span>
                      </div>

                      <p className="font-semibold text-[var(--color-text-secondary)]">
                        Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>

                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <ReviewCard key={review._id} review={review} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-10 text-center">
                        <HiStar className="mx-auto mb-4 h-14 w-14 text-[var(--color-text-muted)] opacity-40" />
                        <p className="text-lg font-black text-[var(--color-text-primary)]">No reviews yet</p>
                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                          Be the first to share this stay experience.
                        </p>
                      </div>
                    )}
                  </SectionShell>
                )}

                {activeTab === 'location' && (
                  <SectionShell key="location" title="Location" eyebrow="Neighborhood">
                    <div className="mb-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-[var(--color-bg-medium)] p-4">
                        <p className="text-xs font-black uppercase text-[var(--color-primary)]">Address</p>
                        <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                          {property.location?.address}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[var(--color-bg-medium)] p-4">
                        <p className="text-xs font-black uppercase text-[var(--color-primary)]">Neighborhood</p>
                        <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                          {property.location?.neighborhood}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[var(--color-bg-medium)] p-4">
                        <p className="text-xs font-black uppercase text-[var(--color-primary)]">City</p>
                        <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                          {property.location?.city}, {property.location?.state}
                        </p>
                      </div>
                    </div>

                    {property.location?.coordinates?.coordinates && (
                      <div className="h-[380px] overflow-hidden rounded-[22px] ring-1 ring-black/5">
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
                              <strong>{property.name}</strong>
                              <br />
                              {property.location.address}
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    )}
                  </SectionShell>
                )}
              </AnimatePresence>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <BookingWidget property={property} />

              <div className="mt-5 rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
                  Local support
                </p>

                <h3 className="mt-1 text-lg font-black text-[var(--color-text-primary)]">
                  Need help planning?
                </h3>

                <div className="mt-4 space-y-3 text-sm font-semibold text-[var(--color-text-secondary)]">
                  <a href="tel:+13051234567" className="flex items-center gap-2 transition hover:text-[var(--color-primary)]">
                    <HiPhone className="h-4 w-4 text-[var(--color-primary)]" />
                    +1 (305) 123-4567
                  </a>

                  <a href="mailto:support@miamistay.com" className="flex items-center gap-2 transition hover:text-[var(--color-primary)]">
                    <HiMail className="h-4 w-4 text-[var(--color-primary)]" />
                    support@miamistay.com
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {similarProperties.length > 0 && (
          <section className="mx-auto max-w-[1400px] px-4 pt-16 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
                  More options
                </p>

                <h2 className="text-3xl font-black text-[var(--color-text-primary)]">
                  Similar properties
                </h2>
              </div>

              <Link to="/properties" className="text-sm font-black text-[var(--color-primary)]">
                View all stays
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {similarProperties.slice(0, 4).map((similar) => (
                <PropertyCard key={similar._id} property={similar} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default PropertyDetailsPage;