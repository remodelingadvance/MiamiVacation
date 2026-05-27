import { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiGlobeAlt,
  HiHeart,
  HiHome,
  HiInformationCircle,
  HiMail,
  HiMap,
  HiPhone,
  HiSparkles,
  HiUser,
  HiX,
} from 'react-icons/hi';
import { FaBuilding } from 'react-icons/fa';
import { GiTrophyCup } from 'react-icons/gi';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { APP_CONFIG } from '../../config/constants';
import { THEME } from '../../config/theme.config';

const iconMap = {
  Home: HiHome,
  Stays: FaBuilding,
  Experiences: HiSparkles,
  Guide: HiMap,
  About: HiInformationCircle,
  Contact: HiMail,
};

const MobileMenu = ({ isOpen, onClose }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { favorites } = useWishlist();
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 lg:hidden"
    >
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-[rgba(7,20,76,0.46)] backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="absolute bottom-0 right-0 top-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-5 py-5" style={{ borderColor: THEME.colors.border }}>
          <Link to="/" onClick={onClose} className="flex items-center gap-3">
            <div className="event-logo-mark event-logo-mark-sm">
              <span>2</span>
              <GiTrophyCup aria-hidden="true" />
              <span>6</span>
            </div>
            <div className="leading-none">
              <p className="text-[0.78rem] font-black uppercase" style={{ color: THEME.colors.textDark, letterSpacing: 0 }}>
                {THEME.logo.line1}
              </p>
              <p className="mt-1 text-[0.92rem] font-medium uppercase" style={{ color: THEME.colors.textDark, letterSpacing: 0 }}>
                {THEME.logo.line2}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 transition-colors hover:bg-gray-100"
            style={{ color: THEME.colors.textDark }}
            aria-label="Close menu"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <ul className="space-y-1">
            {THEME.nav.links.map((item) => {
              const Icon = iconMap[item.label] ?? HiGlobeAlt;
              return (
                <li key={item.label}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                        isActive ? 'text-white' : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                    style={({ isActive }) =>
                      isActive ? { background: THEME.colors.primary } : {}
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <div className="my-5 h-px" style={{ background: THEME.colors.border }} />

          {isAuthenticated ? (
            <div className="space-y-1">
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                  style={{ background: THEME.colors.primary }}
                >
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate" style={{ color: THEME.colors.textDark }}>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs font-medium" style={{ color: THEME.colors.textLight }}>
                    View Profile
                  </p>
                </div>
              </Link>

              <Link
                to="/my-bookings"
                onClick={onClose}
                className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <FaBuilding className="h-5 w-5 shrink-0" style={{ color: THEME.colors.primary }} />
                My Bookings
              </Link>

              <Link
                to="/wishlist"
                onClick={onClose}
                className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <HiHeart className="h-5 w-5 shrink-0" style={{ color: THEME.colors.primary }} />
                Wishlist
                {favorites.length > 0 && (
                  <span className="ml-auto rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs font-bold text-white">
                    {favorites.length}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="btn-outline mt-3 w-full py-2.5 text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                to="/login"
                onClick={onClose}
                className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm"
              >
                <HiUser className="h-4 w-4" />
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="btn-outline flex w-full items-center justify-center gap-2 py-3 text-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </nav>

        <div className="space-y-3 border-t px-6 py-5" style={{ borderColor: THEME.colors.border }}>
          <a
            href={`tel:${APP_CONFIG.phone}`}
            className="flex items-center gap-3 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
            style={{ color: THEME.colors.textMedium }}
          >
            <HiPhone className="h-4 w-4 shrink-0" />
            {APP_CONFIG.phone}
          </a>
          <a
            href={`mailto:${APP_CONFIG.email}`}
            className="flex items-center gap-3 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
            style={{ color: THEME.colors.textMedium }}
          >
            <HiMail className="h-4 w-4 shrink-0" />
            {APP_CONFIG.email}
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MobileMenu;
