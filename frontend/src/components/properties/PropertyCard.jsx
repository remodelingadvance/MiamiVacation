import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLocationMarker, HiHeart } from 'react-icons/hi';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatCurrency } from '../../utils/helpers';
import { getPropertyImageAlt } from '../../utils/propertyImageAlt';

const PropertyCard = ({ property }) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useWishlist();
  const fav = isFavorite(property._id);
  const primaryImage = property.images?.find((image) => image.isPrimary) || property.images?.[0] || {};
  const imageUrl = primaryImage.url || '/images/stay-wise-hero.png';
  const imageAlt = getPropertyImageAlt(property, primaryImage, 0);

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
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="h-full"
    >
      <Link
        to={`/properties/${property.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_12px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.04] transition-all duration-500 hover:shadow-[0_12px_28px_rgba(15,23,42,0.10),0_28px_60px_rgba(15,23,42,0.18)]"
      >
        {/* â”€â”€â”€ Image â”€â”€â”€ */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
            loading="lazy"
          />

          {/* Bottom gradient for location legibility */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

          {/* Top-left badges */}
          <div className="absolute left-4 top-4 flex items-center gap-2">
            {property.featured && (
              <span className="rounded-full bg-blue-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                Featured
              </span>
            )}
          </div>

          {/* Favorite (fades in on hover) */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-black/5 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-90 ${
              fav
                ? 'text-rose-500 opacity-100'
                : 'text-slate-700 opacity-0 group-hover:opacity-100 hover:text-rose-500'
            }`}
            aria-label={fav ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <HiHeart className={`h-[18px] w-[18px] ${fav ? 'fill-current' : ''}`} />
          </button>

          {/* Location at bottom of image */}
          <div className="absolute inset-x-4 bottom-4 flex items-center gap-1.5 text-white">
            <HiLocationMarker className="h-4 w-4 shrink-0" />
            <span className="truncate text-sm font-medium">
              {property.location?.address ||
                `${property.location?.neighborhood || ''}, ${property.location?.city || ''}`}
            </span>
          </div>
        </div>

        {/* â”€â”€â”€ Content â”€â”€â”€ */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-[var(--color-primary)]">
            {property.name}
          </h3>

          {/* Stats */}
          <div className="mt-3 flex items-center gap-5 text-sm">
            <div className="flex items-center gap-1.5">
              <FaBed className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">Beds:</span>
              <span className="font-bold text-slate-900">
                {property.details?.bedrooms || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaBath className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">Baths:</span>
              <span className="font-bold text-slate-900">
                {property.details?.bathrooms || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaRulerCombined className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">Sqft:</span>
              <span className="font-bold text-slate-900">
                {property.details?.area ||
                  property.details?.sqft ||
                  property.details?.maxGuests ||
                  0}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-slate-200" />

          {/* Host + Price */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {property.type || 'For Sale'}
            </span>
            </div>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(property.pricing?.basePrice)}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default PropertyCard;
