import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PROPERTY_TYPES } from '../../config/constants';
import { THEME } from '../../config/theme.config';

const popularLocations = [
  { name: 'South Beach',    image: '/locations/south-beach.jpg',  count: 45 },
  { name: 'Brickell',       image: '/locations/brickell.jpg',      count: 32 },
  { name: 'Downtown Miami', image: '/locations/downtown.jpg',      count: 28 },
  { name: 'Coral Gables',   image: '/locations/coral-gables.jpg',  count: 15 },
  { name: 'Key Biscayne',   image: '/locations/key-biscayne.jpg',  count: 12 },
  { name: 'Wynwood',        image: '/locations/wynwood.jpg',        count: 10 },
];

const MegaMenu = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    transition={{ duration: 0.18 }}
    className="absolute top-full left-1/2 -translate-x-1/2 w-[760px] bg-white rounded-2xl shadow-2xl mt-3 p-8 border"
    style={{ borderColor: THEME.colors.border }}
  >
    <div className="grid grid-cols-3 gap-8">
      {/* Property types */}
      <div>
        <h4
          className="text-[10px] font-bold uppercase tracking-widest mb-4"
          style={{ color: THEME.colors.primary }}
        >
          Property Types
        </h4>
        <ul className="space-y-0.5">
          {PROPERTY_TYPES.map((type) => (
            <li key={type.value}>
              <Link
                to={`/properties?type=${type.value}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg text-sm font-medium transition-all group hover:bg-gray-50"
                style={{ color: THEME.colors.textMedium }}
              >
                <span className="group-hover:text-[var(--color-primary)] transition-colors">
                  {type.label}
                </span>
                <span
                  className="opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                  style={{ color: THEME.colors.primary }}
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Popular locations */}
      <div className="col-span-2">
        <h4
          className="text-[10px] font-bold uppercase tracking-widest mb-4"
          style={{ color: THEME.colors.primary }}
        >
          Popular Locations
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          {popularLocations.map((location) => (
            <Link
              key={location.name}
              to={`/properties?search=${encodeURIComponent(location.name)}`}
              className="group relative overflow-hidden rounded-xl"
            >
              <div className="aspect-[16/9] bg-gray-100">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex flex-col justify-end">
                <h5 className="text-white font-semibold text-sm">{location.name}</h5>
                <p className="text-xs text-white/70">{location.count} properties</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>

    {/* Featured promo */}
    <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${THEME.colors.border}` }}>
      <Link
        to="/properties?featured=true"
        className="flex items-center justify-between p-4 rounded-xl transition-all group hover:bg-gray-50"
      >
        <div>
          <h5 className="font-semibold text-sm" style={{ color: THEME.colors.textDark }}>
            Featured Properties
          </h5>
          <p className="text-xs mt-0.5" style={{ color: THEME.colors.textLight }}>
            Explore our hand-picked luxury selections
          </p>
        </div>
        <span
          className="font-bold text-sm group-hover:translate-x-1 transition-transform"
          style={{ color: THEME.colors.primary }}
        >
          View All →
        </span>
      </Link>
    </div>
  </motion.div>
);

export default MegaMenu;
