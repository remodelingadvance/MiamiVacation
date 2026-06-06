import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HiHome, HiMenu, HiOutlineHeart } from 'react-icons/hi';
import { FaUmbrellaBeach } from 'react-icons/fa';
import { useWishlist } from '../../contexts/WishlistContext';
import { THEME } from '../../config/theme.config';
import MobileMenu from './MobileMenu';

const BrandLogo = ({ compact = false }) => (
  <Link to="/" className="flex shrink-0 items-center gap-3 lg:gap-4">
    <div className={compact ? 'miami-brand-mark miami-brand-mark-sm' : 'miami-brand-mark'}>
      <span>M</span>
      <FaUmbrellaBeach aria-hidden="true" />
    </div>
    <div className="leading-none">
      <p
        className={`${compact ? 'text-[0.72rem]' : 'text-[1.1rem]'} font-black uppercase`}
        style={{ color: THEME.colors.textDark, letterSpacing: 0 }}
      >
        {THEME.logo.line1}
      </p>
      <p
        className={`${compact ? 'text-[0.9rem]' : 'text-[1.25rem]'} mt-1 font-medium uppercase`}
        style={{ color: THEME.colors.textDark, letterSpacing: 0 }}
      >
        {THEME.logo.line2}
      </p>
    </div>
  </Link>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { favorites } = useWishlist();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isTransparent = location.pathname === '/' && !isScrolled;

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-white/10 backdrop-blur-[2px]'
          : 'bg-white/92 shadow-[0_10px_35px_rgba(8,51,68,0.08)] backdrop-blur-xl'
      }`}
    >
      <nav className="mx-auto flex h-[76px] w-full max-w-[1500px] items-center justify-between px-6 lg:h-[96px] lg:px-8">
        <BrandLogo />

        <div className="hidden items-center gap-9 lg:flex">
          {THEME.nav.links.map((link) => (
            <NavLink
              key={link.label}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `relative py-3 text-base font-bold transition-colors ${
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-primary)] hover:text-[var(--color-primary)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-5 left-0 h-[3px] w-full rounded-full bg-[var(--color-primary)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/wishlist"
            className="relative hidden h-[50px] w-[50px] items-center justify-center rounded-lg bg-white/80 text-[var(--color-text-primary)] shadow-[0_8px_26px_rgba(8,51,68,0.08)] ring-1 ring-white/70 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:text-[var(--color-primary)] md:flex"
            aria-label="Wishlist"
          >
            <HiOutlineHeart className="h-7 w-7" />
            {favorites.length > 0 && (
              <span className="absolute right-1 top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </Link>

          <Link
            to={THEME.nav.ctaPath}
            className="hidden h-[50px] items-center gap-3 rounded-lg bg-[var(--color-primary)] px-7 text-base font-bold text-white shadow-[0_13px_24px_rgba(0,169,200,0.20)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary-dark)] md:flex"
          >
            <HiHome className="h-6 w-6" />
            {THEME.nav.ctaLabel}
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/88 text-[var(--color-text-primary)] shadow-[0_8px_22px_rgba(8,51,68,0.08)] ring-1 ring-white/70 lg:hidden"
            aria-label="Open menu"
          >
            <HiMenu className="h-6 w-6" />
          </button>
        </div>
      </nav>

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
