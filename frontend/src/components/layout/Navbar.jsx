import { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiMenu,
  HiX,
  HiSearch,
  HiHeart,
  HiUser,
  HiChevronDown,
  HiPhone,
  HiMail,
} from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import MegaMenu from './MegaMenu';
import MobileMenu from './MobileMenu';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuth();
  const { favorites } = useWishlist();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/properties?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass-strong shadow-lg'
          : 'bg-transparent'
      }`}
    >
      {/* Top bar */}
      <div className={`hidden lg:block transition-all duration-300 ${
        isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-10 opacity-100'
      }`}>
        <div className="container-custom h-full flex items-center justify-between text-sm">
          <div className="flex items-center gap-6 text-white/70">
            <a href="tel:+13051234567" className="hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
              <HiPhone className="w-4 h-4" />
              +1 (305) 123-4567
            </a>
            <a href="mailto:info@miamiluxuryrentals.com" className="hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
              <HiMail className="w-4 h-4" />
              info@miamiluxuryrentals.com
            </a>
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <Link to="/about" className="hover:text-[var(--color-primary)] transition-colors">About</Link>
            <Link to="/contact" className="hover:text-[var(--color-primary)] transition-colors">Contact</Link>
            <span className="text-white/30">|</span>
            <span>🇺🇸 USD</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <span className="text-xl font-bold text-[var(--color-bg-dark)]">M</span>
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-white leading-tight">
                Miami Luxury
              </h1>
              <p className="text-xs text-[var(--color-primary)] tracking-wider uppercase">
                Rentals
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-[var(--color-primary)] ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-white/80'
                }`
              }
            >
              Home
            </NavLink>

            {/* Properties Mega Menu Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-[var(--color-primary)] transition-colors"
              >
                Properties
                <HiChevronDown className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {isMegaMenuOpen && <MegaMenu />}
              </AnimatePresence>
            </div>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-[var(--color-primary)] ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-white/80'
                }`
              }
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-[var(--color-primary)] ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-white/80'
                }`
              }
            >
              Contact
            </NavLink>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Search toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-white/70 hover:text-[var(--color-primary)] transition-all"
            >
              <HiSearch className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="relative w-10 h-10 rounded-full glass-light flex items-center justify-center text-white/70 hover:text-[var(--color-primary)] transition-all"
              >
                <HiHeart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-primary)] text-xs font-bold text-[var(--color-bg-dark)] flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
            )}

            {/* User menu / Login */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass-light text-white/70 hover:text-[var(--color-primary)] transition-all"
              >
                <HiUser className="w-5 h-5" />
                <span className="text-sm font-medium">{user?.firstName}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:block btn-primary text-sm"
              >
                Sign In
              </Link>
            )}

            {/* Book Now CTA */}
            <Link
              to="/properties"
              className="hidden md:block btn-primary text-sm"
            >
              Book Now
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-full glass-light flex items-center justify-center text-white"
            >
              <HiMenu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10"
            >
              <form onSubmit={handleSearch} className="py-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search properties, locations, amenities..."
                    className="flex-1 input-field"
                    autoFocus
                  />
                  <button type="submit" className="btn-primary">
                    Search
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;