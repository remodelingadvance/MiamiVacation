import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HiHome, HiMenu, HiOutlineHeart } from 'react-icons/hi';
import { GiTrophyCup } from 'react-icons/gi';
import { useWishlist } from '../../contexts/WishlistContext';
import { THEME } from '../../config/theme.config';
import MobileMenu from './MobileMenu';

const BrandLogo = ({ compact = false }) => (
  <Link to="/" className="flex shrink-0 items-center gap-3 lg:gap-4">
    <div className={compact ? 'event-logo-mark event-logo-mark-sm' : 'event-logo-mark'}>
      <span>2</span>
      <GiTrophyCup aria-hidden="true" />
      <span>6</span>
    </div>
    <div className="leading-none">
      <p
        className={`${compact ? 'text-[0.78rem]' : 'text-[1.35rem]'} font-black uppercase`}
        style={{ color: THEME.colors.textDark, letterSpacing: 0 }}
      >
        {THEME.logo.line1}
      </p>
      <p
        className={`${compact ? 'text-[0.92rem]' : 'text-[1.42rem]'} mt-1 font-medium uppercase`}
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
          ? 'bg-transparent'
          : 'bg-white/95 shadow-[0_10px_35px_rgba(8,19,76,0.08)] backdrop-blur-xl'
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
            className="relative hidden h-[54px] w-[54px] items-center justify-center rounded-full bg-white/75 text-[var(--color-text-primary)] shadow-[0_8px_26px_rgba(8,19,76,0.08)] ring-1 ring-white/70 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:text-[var(--color-primary)] md:flex"
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
            className="hidden h-[54px] items-center gap-3 rounded-full bg-[var(--color-primary)] px-8 text-base font-bold text-white shadow-[0_13px_24px_rgba(244,20,82,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary-dark)] md:flex"
          >
            <HiHome className="h-6 w-6" />
            {THEME.nav.ctaLabel}
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[var(--color-text-primary)] shadow-[0_8px_22px_rgba(8,19,76,0.08)] ring-1 ring-white/70 lg:hidden"
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
