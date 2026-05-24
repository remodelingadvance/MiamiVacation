import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PROPERTY_TYPES } from '../../config/constants';

const popularLocations = [
  { name: 'South Beach', image: '/locations/south-beach.jpg', count: 45 },
  { name: 'Brickell', image: '/locations/brickell.jpg', count: 32 },
  { name: 'Downtown Miami', image: '/locations/downtown.jpg', count: 28 },
  { name: 'Coral Gables', image: '/locations/coral-gables.jpg', count: 15 },
  { name: 'Key Biscayne', image: '/locations/key-biscayne.jpg', count: 12 },
  { name: 'Wynwood', image: '/locations/wynwood.jpg', count: 10 },
];

const MegaMenu = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-1/2 -translate-x-1/2 w-[800px] glass-strong rounded-2xl shadow-2xl mt-2 p-8"
    >
      <div className="grid grid-cols-3 gap-8">
        {/* Property types */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-4">
            Property Types
          </h4>
          <ul className="space-y-2">
            {PROPERTY_TYPES.map((type) => (
              <li key={type.value}>
                <Link
                  to={`/properties?type=${type.value}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-all group"
                >
                  <span>{type.label}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-primary)]">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Popular locations */}
        <div className="col-span-2">
          <h4 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-4">
            Popular Locations
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {popularLocations.map((location) => (
              <Link
                key={location.name}
                to={`/properties?search=${encodeURIComponent(location.name)}`}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="aspect-[16/9] bg-[var(--color-bg-light)]">
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col justify-end">
                  <h5 className="text-white font-semibold text-sm">
                    {location.name}
                  </h5>
                  <p className="text-xs text-white/70">
                    {location.count} properties
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured promotion */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <Link
          to="/properties?featured=true"
          className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent hover:from-[var(--color-primary)]/20 transition-all group"
        >
          <div>
            <h5 className="text-white font-semibold">Featured Properties</h5>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Explore our hand-picked luxury selections
            </p>
          </div>
          <span className="text-[var(--color-primary)] group-hover:translate-x-1 transition-transform">
            View All →
          </span>
        </Link>
      </div>
    </motion.div>
  );
};

export default MegaMenu;