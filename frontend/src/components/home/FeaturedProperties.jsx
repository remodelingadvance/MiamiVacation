import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiStar, HiLocationMarker, HiUsers } from 'react-icons/hi';
import { FaBed, FaBath } from 'react-icons/fa';
import SkeletonLoader from '../common/SkeletonLoader';
import { formatCurrency } from '../../utils/helpers';

const FeaturedProperties = ({ properties, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonLoader key={i} type="card" />
        ))}
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-muted)]">No featured properties available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {properties.slice(0, 8).map((property, index) => (
        <motion.div
          key={property._id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <Link
            to={`/properties/${property.slug}`}
            className="group block glass rounded-2xl overflow-hidden card-hover"
          >
            {/* Image */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={property.images?.[0]?.url || '/placeholder-property.jpg'}
                alt={property.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* Price tag */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg glass-strong">
                <span className="text-white font-bold text-lg">
                  {formatCurrency(property.pricing?.basePrice)}
                </span>
                <span className="text-white/70 text-sm">/night</span>
              </div>

              {/* Rating */}
              <div className="absolute top-4 right-4 px-2 py-1 rounded-lg glass-strong flex items-center gap-1">
                <HiStar className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-white text-sm font-medium">{property.ratings?.average || 'New'}</span>
              </div>

              {/* Property type badge */}
              <div className="absolute bottom-4 left-4">
                <span className="badge badge-primary capitalize">{property.type}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-white font-display font-bold text-lg mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                {property.name}
              </h3>
              
              <div className="flex items-center gap-1 text-[var(--color-text-muted)] text-sm mb-3">
                <HiLocationMarker className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                <span className="truncate">{property.location?.neighborhood}, {property.location?.city}</span>
              </div>

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
                  <span>{property.details?.maxGuests} guests</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default FeaturedProperties;