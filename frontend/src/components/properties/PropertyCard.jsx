import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiHeart,
  HiLocationMarker,
  HiShieldCheck,
  HiSparkles,
  HiStar,
  HiUsers,
} from 'react-icons/hi';
import { FaBath, FaBed } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatCurrency } from '../../utils/helpers';

const PropertyCard = ({ property }) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useWishlist();
  const fav = isFavorite(property._id);

  const handleFavoriteClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }

    toggleFavorite(property._id);
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="h-full"
    >
      <Link
        to={`/properties/${property.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_18px_48px_rgba(8,19,76,0.10)] ring-1 ring-black/5 transition-shadow hover:shadow-[0_24px_64px_rgba(8,19,76,0.16)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-light)]">
          <img
            src={property.images?.[0]?.url || '/images/miami-world-cup-hero.png'}
            alt={property.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07144c]/88 via-[#07144c]/12 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/92 px-3 py-1 text-xs font-black uppercase text-[var(--color-primary)] shadow-lg">
              {property.type}
            </span>
            {property.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-black uppercase text-white shadow-lg">
                <HiSparkles className="h-3.5 w-3.5" />
                Featured
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/92 shadow-lg backdrop-blur transition-all hover:scale-110 ${
              fav ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'
            }`}
            aria-label={fav ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <HiHeart className={`h-5 w-5 ${fav ? 'fill-current' : ''}`} />
          </button>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-white/80">From</p>
              <p className="text-2xl font-black leading-none text-white">
                {formatCurrency(property.pricing?.basePrice)}
                <span className="text-sm font-semibold text-white/78"> / night</span>
              </p>
            </div>
            {property.ratings?.average > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-[var(--color-text-primary)] shadow-lg">
                <HiStar className="h-4 w-4 text-[var(--color-primary)]" />
                {property.ratings.average}
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  ({property.ratings.count})
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-4">
            <h3 className="line-clamp-2 text-xl font-black leading-tight text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-primary)]">
              {property.name}
            </h3>
            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
              <HiLocationMarker className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
              <span className="truncate">
                {property.location?.neighborhood}, {property.location?.city}
              </span>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-3 gap-2 border-t border-[var(--color-border)] pt-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-secondary)]">
              <FaBed className="h-4 w-4 text-[var(--color-primary)]" />
              {property.details?.bedrooms || 0}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-secondary)]">
              <FaBath className="h-4 w-4 text-[var(--color-secondary)]" />
              {property.details?.bathrooms || 0}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-secondary)]">
              <HiUsers className="h-4 w-4 text-[var(--color-accent)]" />
              {property.details?.maxGuests || 0}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--color-secondary-light)] px-3 py-2 text-xs font-bold text-[var(--color-text-primary)]">
            <HiShieldCheck className="h-4 w-4 text-[var(--color-accent)]" />
            Verified Miami stay for match week
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default PropertyCard;
