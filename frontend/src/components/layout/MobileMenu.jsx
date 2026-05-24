import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiX, HiHome, HiBuilding, HiInformationCircle, HiMail, HiPhone, HiHeart } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { APP_CONFIG } from '../../config/constants';

const MobileMenu = ({ isOpen, onClose }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuItems = [
    { icon: HiHome, label: 'Home', to: '/' },
    { icon: HiBuilding, label: 'Properties', to: '/properties' },
    { icon: HiInformationCircle, label: 'About', to: '/about' },
    { icon: HiMail, label: 'Contact', to: '/contact' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 lg:hidden"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Menu panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm glass-strong"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Link to="/" className="flex items-center gap-2" onClick={onClose}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                <span className="text-lg font-bold text-[var(--color-bg-dark)]">M</span>
              </div>
              <span className="text-lg font-display font-bold text-white">Miami Luxury Rentals</span>
            </Link>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-white hover:text-[var(--color-primary)] transition-colors"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-6">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <item.icon className="w-5 h-5 text-[var(--color-primary)]" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Auth section */}
            <div className="mt-8 pt-8 border-t border-white/10">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link
                    to="/profile"
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                      <span className="text-[var(--color-primary)] font-semibold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">View Profile</p>
                    </div>
                  </Link>
                  <Link
                    to="/my-bookings"
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <HiBuilding className="w-5 h-5 text-[var(--color-primary)]" />
                    <span>My Bookings</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <HiHeart className="w-5 h-5 text-[var(--color-primary)]" />
                    <span>Wishlist</span>
                  </Link>
                  <button
                    onClick={() => { logout(); onClose(); }}
                    className="w-full mt-4 btn-primary"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="block w-full text-center btn-primary"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={onClose}
                    className="block w-full text-center btn-outline"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Contact info */}
          <div className="p-6 border-t border-white/10 space-y-3">
            <a
              href={`tel:${APP_CONFIG.phone}`}
              className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <HiPhone className="w-4 h-4" />
              {APP_CONFIG.phone}
            </a>
            <a
              href={`mailto:${APP_CONFIG.email}`}
              className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <HiMail className="w-4 h-4" />
              {APP_CONFIG.email}
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MobileMenu;