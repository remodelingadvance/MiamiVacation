import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiChevronDown,
  HiGlobeAlt,
  HiHeart,
  HiHome,
  HiInformationCircle,
  HiLogout,
  HiMail,
  HiMap,
  HiMenu,
  HiOutlineHeart,
  HiPhone,
  HiSparkles,
  HiUser,
  HiX,
} from "react-icons/hi";
import { FaBuilding, FaUmbrellaBeach } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { APP_CONFIG } from "../../config/constants";
import { THEME } from "../../config/theme.config";
import StayWiseLogo from "../../assets/stay-wise-logo-horiz.png";

const iconMap = {
  Home: HiHome,
  Stays: FaBuilding,
  Experiences: HiSparkles,
  Guide: HiMap,
  About: HiInformationCircle,
  Contact: HiMail,
};

const getInitials = (user) => {
  const first =
    user?.firstName?.[0] || user?.name?.[0] || user?.email?.[0] || "U";
  const last = user?.lastName?.[0] || "";
  return `${first}${last}`.toUpperCase();
};

const BrandLogo = ({ isTransparent = false, onClick }) => (
  <Link to="/" onClick={onClick} className="flex shrink-0 items-center gap-3">
    <motion.img
      src={StayWiseLogo}
      alt="StayWise Logo"
      className="h-12 w-42 sm:h-16 sm:w-52"
    />
  </Link>
);

const FillButton = ({ to, children, onClick, variant = "primary", className = "" }) => {
  const primary = variant === "primary";

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-2xl px-6 text-sm font-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        primary
          ? "bg-[var(--color-primary)] text-white shadow-[0_14px_28px_rgba(255,79,123,0.25)]"
          : "border border-gray-200 bg-white text-gray-900 shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
      } ${className}`}
    >
      <span
        className={`absolute inset-y-0 left-0 w-0 transition-all duration-500 ease-out group-hover:w-full ${
          primary ? "bg-[var(--color-secondary)]" : "bg-[var(--color-primary)]"
        }`}
      />
      <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-white">
        {children}
      </span>
    </Link>
  );
};

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuth();
  const { favorites } = useWishlist();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const isTransparent = location.pathname === "/" && !isScrolled;

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={`fixed left-0 right-0 top-0 z-[999] transition-all duration-300 ${
          isTransparent
            ? "bg-transparent"
            : "bg-white/95 shadow-[0_12px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl"
        }`}
      >
        <nav className="mx-auto flex h-[76px] w-full max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:h-[88px] lg:px-8">
          <BrandLogo isTransparent={isTransparent} />

          <div className="hidden items-center gap-8 lg:flex">
            {THEME.nav.links.map((link) => (
              <NavLink
                key={link.label}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `relative py-3 text-sm font-black transition-colors duration-300 ${
                    isActive
                      ? "text-[var(--color-primary)]"
                      : isTransparent
                      ? "text-white hover:text-[var(--color-primary)]"
                      : "text-gray-800 hover:text-[var(--color-primary)]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span
                      className={`absolute -bottom-2 left-0 h-[3px] rounded-full bg-[var(--color-primary)] transition-all duration-300 ${
                        isActive ? "w-full" : "w-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/wishlist"
              className={`relative hidden h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 hover:-translate-y-0.5 md:flex ${
                isTransparent
                  ? "bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md hover:bg-white/25"
                  : "bg-white text-gray-900 shadow-[0_10px_25px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 hover:text-[var(--color-primary)]"
              }`}
              aria-label="Wishlist"
            >
              <HiOutlineHeart className="h-6 w-6" />
              {favorites.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-white">
                  {favorites.length}
                </span>
              )}
            </Link>

            <FillButton to="/properties" className="hidden md:inline-flex">
              <HiHome className="h-5 w-5" />
              Book Now
            </FillButton>

            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className={`group relative flex h-12 items-center gap-3 overflow-hidden rounded-2xl px-3 pr-4 transition-all duration-300 hover:-translate-y-0.5 ${
                    isTransparent
                      ? "bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md"
                      : "bg-white text-gray-900 shadow-[0_10px_25px_rgba(0,0,0,0.08)] ring-1 ring-gray-100"
                  }`}
                >
                  <span className="absolute inset-y-0 left-0 w-0 bg-[var(--color-primary)] transition-all duration-500 ease-out group-hover:w-full" />
                  <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-black text-white ring-2 ring-white/70">
                    {getInitials(user)}
                  </span>
                  <span className="relative z-10 max-w-[120px] truncate text-sm font-black transition group-hover:text-white">
                    {user?.firstName || user?.name || "Profile"}
                  </span>
                  <HiChevronDown
                    className={`relative z-10 h-4 w-4 transition group-hover:text-white ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.96 }}
                      className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-3xl border border-gray-100 bg-white p-3 shadow-2xl"
                    >
                      <div className="mb-2 flex items-center gap-3 rounded-2xl bg-[var(--color-primary-light)] p-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-black text-white">
                          {getInitials(user)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-gray-950">
                            {user?.firstName || user?.name || "StayWise User"}
                          </p>
                          <p className="truncate text-xs font-medium text-gray-500">
                            {user?.email || "View your account"}
                          </p>
                        </div>
                      </div>

                      <Link to="/profile" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]">
                        <HiUser className="h-5 w-5" />
                        Profile
                      </Link>

                      <Link to="/my-bookings" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]">
                        <HiHome className="h-5 w-5" />
                        My Bookings
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-500"
                      >
                        <HiLogout className="h-5 w-5" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden items-center gap-3 md:flex">
                <FillButton to="/login" variant="secondary">
                  Login
                </FillButton>
                <FillButton to="/signup">Sign Up</FillButton>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 lg:hidden ${
                isTransparent
                  ? "bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md"
                  : "bg-white text-gray-900 shadow-[0_10px_25px_rgba(0,0,0,0.08)] ring-1 ring-gray-100"
              }`}
              aria-label="Open menu"
            >
              <HiMenu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] lg:hidden"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close menu"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 240 }}
              className="absolute bottom-0 right-0 top-0 flex w-[88%] max-w-sm flex-col overflow-hidden bg-white shadow-2xl"
            >
              <div className="relative overflow-hidden border-b border-gray-100 px-5 py-5">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--color-primary-light)]" />
                <div className="absolute -bottom-20 left-10 h-32 w-32 rounded-full bg-pink-100/60" />

                <div className="relative z-10 flex items-center justify-between">
                  <BrandLogo onClick={() => setIsMobileOpen(false)} />

                  <button
                    type="button"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-md ring-1 ring-gray-100 hover:bg-gray-950 hover:text-white"
                    aria-label="Close menu"
                  >
                    <HiX className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-5">
                <ul className="space-y-2">
                  {THEME.nav.links.map((item, index) => {
                    const Icon = iconMap[item.label] ?? HiGlobeAlt;

                    return (
                      <motion.li
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <NavLink
                          to={item.path}
                          end={item.path === "/"}
                          onClick={() => setIsMobileOpen(false)}
                          className={({ isActive }) =>
                            `relative flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-black transition ${
                              isActive
                                ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                                : "text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Icon className="h-5 w-5 shrink-0" />
                              <span>{item.label}</span>
                              {isActive && (
                                <span className="absolute bottom-2 left-4 h-[3px] w-8 rounded-full bg-[var(--color-primary)]" />
                              )}
                            </>
                          )}
                        </NavLink>
                      </motion.li>
                    );
                  })}
                </ul>

                <div className="my-5 h-px bg-gray-100" />

                <FillButton
                  to="/properties"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex w-full"
                >
                  <HiHome className="h-4 w-4" />
                  Book Now
                </FillButton>

                <div className="my-5 h-px bg-gray-100" />

                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileOpen(false)}
                      className="group relative flex items-center gap-3 overflow-hidden rounded-3xl bg-[var(--color-primary-light)] p-3"
                    >
                      <span className="absolute inset-y-0 left-0 w-0 bg-[var(--color-primary)] transition-all duration-500 ease-out group-hover:w-full" />
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-black text-white">
                        {getInitials(user)}
                      </div>
                      <div className="relative z-10 min-w-0">
                        <p className="truncate text-sm font-black text-gray-950 group-hover:text-white">
                          {user?.firstName || user?.name || "StayWise User"}
                        </p>
                        <p className="truncate text-xs font-medium text-gray-500 group-hover:text-white/80">
                          {user?.email || "View Profile"}
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/my-bookings"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-black text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]"
                    >
                      <FaBuilding className="h-5 w-5 text-[var(--color-primary)]" />
                      My Bookings
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-black text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]"
                    >
                      <HiHeart className="h-5 w-5 text-[var(--color-primary)]" />
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
                        setIsMobileOpen(false);
                      }}
                      className="group relative mt-3 flex w-full items-center justify-center overflow-hidden rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-black text-red-500"
                    >
                      <span className="absolute inset-y-0 left-0 w-0 bg-red-500 transition-all duration-500 ease-out group-hover:w-full" />
                      <span className="relative z-10 flex items-center gap-2 group-hover:text-white">
                        <HiLogout className="h-5 w-5" />
                        Sign Out
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FillButton
                      to="/login"
                      variant="secondary"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex w-full"
                    >
                      <HiUser className="h-4 w-4" />
                      Login
                    </FillButton>

                    <FillButton
                      to="/signup"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex w-full"
                    >
                      Create Account
                    </FillButton>
                  </div>
                )}
              </nav>

              <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
                <div className="space-y-3">
                  <a
                    href={`tel:${APP_CONFIG.phoneHref}`}
                    className="flex items-center gap-3 text-sm font-bold text-gray-600 hover:text-[var(--color-primary)]"
                  >
                    <HiPhone className="h-4 w-4" />
                    {APP_CONFIG.phone}
                  </a>

                  <a
                    href={`mailto:${APP_CONFIG.email}`}
                    className="flex items-center gap-3 text-sm font-bold text-gray-600 hover:text-[var(--color-primary)]"
                  >
                    <HiMail className="h-4 w-4" />
                    {APP_CONFIG.email}
                  </a>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;