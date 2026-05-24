import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiStar, HiLocationMarker, HiHeart, HiUsers } from 'react-icons/hi';
import { FaBed, FaBath } from 'react-icons/fa';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PropertyCard = ({ property }) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useWishlist();
  const fav = isFavorite(property._id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }
    
    toggleFavorite(property._id);
  };

  return (
    <Link
      to={`/properties/${property.slug}`}
      className="group block glass rounded-2xl overflow-hidden card-hover"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.images?.[0]?.url || '/placeholder-property.jpg'}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Wishlist button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full glass-strong flex items-center justify-center transition-all hover:scale-110 ${
            fav ? 'text-red-500' : 'text-white/70 hover:text-white'
          }`}
        >
          <HiHeart className={`w-5 h-5 ${fav ? 'fill-current' : ''}`} />
        </button>

        {/* Price */}
        <div className="absolute top-4 left-4">
          <div className="px-3 py-1.5 rounded-lg glass-strong">
            <span className="text-white font-bold text-lg">
              {formatCurrency(property.pricing?.basePrice)}
            </span>
            <span className="text-white/70 text-sm">/night</span>
          </div>
        </div>

        {/* Rating */}
        {property.ratings?.average > 0 && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1 px-2 py-1 rounded-lg glass-strong">
            <HiStar className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-white text-sm font-medium">{property.ratings.average}</span>
            <span className="text-white/60 text-xs">({property.ratings.count})</span>
          </div>
        )}

        {/* Property type badge */}
        <div className="absolute bottom-4 right-4">
          <span className="badge badge-primary capitalize">{property.type}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-display font-bold text-lg mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
          {property.name}
        </h3>
        
        <div className="flex items-center gap-1 text-[var(--color-text-muted)] text-sm mb-4">
          <HiLocationMarker className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
          <span className="truncate">{property.location?.neighborhood}, {property.location?.city}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-1">
              <FaBed className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{property.details?.bedrooms} beds</span>
            </div>
            <div className="flex items-center gap-1">
              <FaBath className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{property.details?.bathrooms} baths</span>
            </div>
            <div className="flex items-center gap-1">
              <HiUsers className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{property.details?.maxGuests}</span>
            </div>
          </div>
          
          {property.featured && (
            <span className="text-xs text-[var(--color-primary)] font-medium uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;