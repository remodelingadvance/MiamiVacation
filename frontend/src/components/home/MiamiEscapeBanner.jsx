import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import { HiOutlineChatAlt2 } from 'react-icons/hi';
import {
  HiLocationMarker,
  HiUserGroup,
  HiStar,
  HiHome,
} from 'react-icons/hi';

const SunIcon = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const stats = [
  {
    icon: HiLocationMarker,
    value: '50+',
    label: 'Miami Locations',
    sub: 'Across the city',
  },
  {
    icon: HiHome,
    value: '500+',
    label: 'Verified Stays',
    sub: 'Handpicked rentals',
  },
  {
    icon: HiUserGroup,
    value: '12K+',
    label: 'Happy Guests',
    sub: 'And counting',
  },
  {
    icon: HiStar,
    value: '4.9★',
    label: 'Average Rating',
    sub: 'From 8K+ reviews',
  },
];

const MiamiEscapeBanner = () => {
  return (
    <section className="relative overflow-hidden bg-[#f3ecd9]">
      {/* ─── Right-side beach image (desktop diagonal clip) ─── */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{ clipPath: 'polygon(46% 0, 100% 0, 100% 100%, 30% 100%)' }}
      >
        <motion.img
          initial={{ scale: 1.08 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=2200&q=80"
          alt="Miami beach"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/15 to-black/45" />
      </div>

      {/* Mobile beach banner */}
      <div className="relative h-60 lg:hidden">
        <img
          src="https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=1200&q=80"
          alt="Miami beach"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-12 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* ─── LEFT: Content ─── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-5"
          >
            <div className="max-w-md">
              {/* Pulsing "Limited Time" badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                </span>
                Limited Time Offer
              </motion.div>

              {/* Title */}
              <h1
                className="font-bold leading-none text-[var(--color-secondary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span className="flex items-center gap-3 text-6xl lg:text-7xl">
                  Escape
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    className="inline-flex"
                  >
                    <SunIcon className="h-10 w-10 text-[var(--color-primary)] lg:h-12 lg:w-12" />
                  </motion.span>
                </span>
                <span className="mt-2 flex items-baseline gap-3">
                  <span
                    className="text-2xl font-normal italic text-[var(--color-text-muted)] lg:text-3xl"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    to
                  </span>
                  <span className="text-6xl lg:text-7xl">Miami</span>
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 text-lg font-semibold text-[var(--color-text-dark)] sm:text-xl"
              >
                Save up to 30% — this week only
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base"
              >
                Sun-kissed villas along Atlantic sands. Art Deco penthouses with
                rooftop pools. Oceanfront escapes minutes from Lincoln Road's
                neon glow — every stay hand-picked by our Miami concierge.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  to="/properties"
                  className="rounded-full bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-primary-dark)] hover:shadow-xl hover:shadow-[var(--color-primary)]/40"
                >
                  Explore stays
                </Link>
                <Link
                  to="/book"
                  className="rounded-full border-2 border-[var(--color-secondary)] px-7 py-3 text-sm font-semibold text-[var(--color-secondary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-secondary)] hover:text-white"
                >
                  Book now
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mt-12 flex items-center gap-3"
              >
                <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Follow
                </span>
                {[FaFacebookF, FaTwitter, FaInstagram, HiOutlineChatAlt2].map(
                  (Icon, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      whileHover={{ y: -3, scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-secondary)] text-white transition-colors hover:bg-[var(--color-primary)]"
                      aria-label="Social"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </motion.a>
                  )
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* ─── RIGHT: Stats Grid ─── */}
          <div className="lg:col-span-7 max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mb-8"
            >
              <h2
                className="text-3xl font-bold text-[var(--color-secondary)] sm:text-4xl lg:text-white lg:drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Trusted by travelers worldwide
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)] lg:text-white/85 lg:drop-shadow">
                Numbers that speak for our Miami experience.
              </p>
            </motion.div>

            {/* Stats Grid 2x2 */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 0.4 + i * 0.1,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5 transition-shadow hover:shadow-2xl sm:p-6"
                >
                  {/* Decorative corner accent */}
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--color-primary)]/5 transition-transform duration-500 group-hover:scale-150" />

                  {/* Icon */}
                  <div className="relative mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-all duration-300 group-hover:bg-[var(--color-primary)] group-hover:text-white">
                    <stat.icon className="h-5 w-5" />
                  </div>

                  {/* Value */}
                  <p
                    className="relative text-3xl font-black leading-none text-[var(--color-secondary)] sm:text-4xl"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {stat.value}
                  </p>

                  {/* Label */}
                  <p className="relative mt-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-dark)] sm:text-sm">
                    {stat.label}
                  </p>
                  <p className="relative mt-0.5 text-[11px] text-[var(--color-text-muted)] sm:text-xs">
                    {stat.sub}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Promo code */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.9, ease: 'backOut' }}
              className="mt-6 flex justify-end"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center overflow-hidden rounded-full bg-white shadow-2xl ring-1 ring-black/5"
              >
                <Link
                  to="/properties"
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-[var(--color-secondary)] transition-colors hover:text-[var(--color-primary)]"
                >
                  Book a stay
                </Link>
                <Link
                  to="/contact"
                  className="flex h-full items-center justify-center rounded-full bg-[var(--color-secondary)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--color-primary)]"
                >
                  Contact us
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiamiEscapeBanner;