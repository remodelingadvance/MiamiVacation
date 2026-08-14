import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiSparkles, HiCheck } from 'react-icons/hi';
import { FaHome, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import FillButton from '../common/FillButton';

const EASE = [0.22, 1, 0.36, 1];

const images = [
  {
    src: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80',
    alt: 'Dream Miami home exterior',
    mt: 'lg:mt-10',
    badge: 'Featured',
  },
  {
    src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    alt: 'Modern Miami living room',
    mt: 'lg:mt-20',
    badge: 'Popular',
  },
  {
    src: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
    alt: 'Bright Miami interior',
    mt: 'lg:mt-0',
    badge: 'New',
  },
];

const features = [
  'Handpicked luxury properties',
  '24/7 concierge support',
  'Best price guarantee',
];

const RealEstateBanner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fdf6ef] via-white to-[#fef9f4] py-12 sm:py-16 lg:min-h-[680px] lg:py-0">
      {/* ═══ DECORATIVE BACKGROUND BLOBS ═══ */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-[#e8527a]/8 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-cyan-400/8 blur-3xl"
      />

      {/* ═══ DECORATIVE SHAPES ═══ */}
      {/* Diamond cluster - top center */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="pointer-events-none absolute left-[38%] top-12 hidden h-10 w-10 lg:block"
      >
        <motion.div
          animate={{ rotate: [0, 90, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="relative h-full w-full"
        >
          <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#e8527a]" />
          <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-[#e8527a]" />
          <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-[#e8527a]" />
          <span className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#e8527a]" />
        </motion.div>
      </motion.div>

      {/* Plus signs */}
      {[
        { top: '20%', left: '22%', size: 'text-2xl', delay: 0 },
        { top: '10%', left: '34%', size: 'text-xl', delay: 0.3 },
        { bottom: '26%', left: '44%', size: 'text-lg', delay: 0.6 },
      ].map((p, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
          className={`pointer-events-none absolute hidden font-light text-[#e8527a] lg:block ${p.size}`}
          style={{ top: p.top, left: p.left, bottom: p.bottom }}
        >
          +
        </motion.span>
      ))}

      {/* Sage circle - bottom left */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-[#dde2d3]/60 blur-xl"
      />

      {/* Diagonal hatch - bottom center */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-[36%] hidden h-12 w-28 text-[#e8527a]/35 lg:block"
      >
        {[...Array(7)].map((_, i) => (
          <line
            key={i}
            x1={i * 14}
            y1="48"
            x2={i * 14 + 22}
            y2="0"
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Dotted grid - bottom right */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 right-10 hidden h-20 w-36 text-[#e8527a]/40 lg:block"
      >
        <defs>
          <pattern id="dotgrid" width="13" height="13" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>

      {/* Hexagon pattern - top right */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-12 top-24 hidden h-48 w-56 text-[#0d3347]/10 lg:block"
      >
        <defs>
          <pattern id="hexagons" patternUnits="userSpaceOnUse" width="28" height="49">
            <path
              d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-12 lg:py-20">
        {/* ═══ LEFT: Text Content ═══ */}
        <div>
          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8527a]/20 bg-[#e8527a]/5 px-3.5 py-1.5 backdrop-blur-sm sm:mb-5"
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="text-[#e8527a]"
            >
              <HiSparkles className="h-3.5 w-3.5" />
            </motion.span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8527a] sm:text-[11px]">
              Stay Wise Miami
            </span>
          </motion.div>

          {/* Main heading */}
          <h1 className="font-black uppercase leading-[1.05] tracking-tight text-[#0d3347]">
            {['YOUR PERFECT', 'MIAMI GETAWAY'].map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.12, ease: EASE }}
                className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl"
              >
                {i === 1 ? (
                  <span>
                    MIAMI{' '}
                    <span className="bg-gradient-to-r from-[#e8527a] to-[#ff7a9c] bg-clip-text text-transparent">
                      GETAWAY
                    </span>
                  </span>
                ) : (
                  line
                )}
              </motion.span>
            ))}
          </h1>

          {/* Pink accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-5 h-1 w-20 origin-left rounded-full bg-gradient-to-r from-[#e8527a] to-transparent sm:mt-6"
          />

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-5 max-w-md text-base font-black leading-snug text-[#0d3347] sm:mt-6 sm:text-lg lg:text-xl"
          >
            Luxury Vacation Stays
            <br />
            <span className="text-[#e8527a]">Designed for Unforgettable Experiences</span>
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-4 max-w-md text-sm leading-relaxed text-gray-500 sm:text-[15px]"
          >
            Discover premium vacation rentals, beachfront condos, and luxury
            accommodations across Miami's most sought-after destinations.
            Whether you're planning a family vacation, romantic escape, or
            extended stay, StayWise helps you find the perfect place to relax.
          </motion.p>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-5 space-y-2 sm:mt-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.85 + i * 0.08 }}
                className="flex items-center gap-2.5"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8527a] to-[#d4405f] shadow-sm">
                  <HiCheck className="h-3 w-3 text-white" />
                </span>
                <span className="text-xs font-semibold text-[#0d3347] sm:text-sm">
                  {feature}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8"
          >
            <FillButton variant="primary" as={Link} to="/properties" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#e8527a] to-[#d4405f] px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#e8527a]/30 transition-all hover:-translate-y-0.5 hover:shadow-xl sm:text-base">
              <span className="relative z-10 flex items-center gap-2">
                Browse Stays
                <HiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </FillButton>

            <FillButton variant="secondary" as={Link} to="/contact" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border-2 border-[#e8527a] bg-transparent px-6 py-3.5 text-sm font-black uppercase tracking-wider text-[#0d3347] transition-all hover:-translate-y-0.5 hover:border-[#e8527a] hover:bg-[#e8527a] hover:text-white sm:text-base">
              <span className="relative z-10 flex items-center gap-2">
                Get in Touch
                <HiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </FillButton>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8 sm:gap-6"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['photo-1494790108377-be9c29b29330', 'photo-1507003211169-0a1dd7228f2d', 'photo-1438761681033-6461ffad8d80'].map(
                  (id) => (
                    <img
                      key={id}
                      src={`https://images.unsplash.com/${id}?w=80&q=80`}
                      alt="Guest"
                      className="h-8 w-8 rounded-full border-2 border-white object-cover"
                    />
                  )
                )}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-[#e8527a]">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="h-3 w-3" />
                  ))}
                </div>
                <p className="text-[10px] font-semibold text-gray-500">
                  happy guests
                </p>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-gray-200 sm:block" />

            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0d3347]">
              <FaMapMarkerAlt className="h-3.5 w-3.5 text-[#e8527a]" />
              Miami, Florida
            </div>
          </motion.div>
        </div>

        {/* ═══ RIGHT: Three staggered photos ═══ */}
        <div className="relative flex items-start justify-center gap-3 sm:gap-4">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: i === 0 ? -2 : i === 1 ? 1.5 : 3 }}
              transition={{ duration: 0.7, delay: 0.5 + i * 0.15, ease: EASE }}
              whileHover={{
                y: -12,
                rotate: 0,
                scale: 1.03,
                zIndex: 50,
                transition: { duration: 0.2 },
              }}
              style={{ zIndex: 10 - i }}
              className={`group relative h-60 w-1/3 max-w-[180px] cursor-pointer overflow-hidden rounded-2xl shadow-[0_18px_40px_rgba(13,51,71,0.18)] ring-1 ring-black/5 sm:h-80 lg:h-[440px] ${img.mt}`}
            >
              {/* Image */}
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                loading="lazy"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d3347]/60 via-transparent to-transparent" />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-[#e8527a]/0 transition-colors duration-300 group-hover:bg-[#e8527a]/10" />
            </motion.div>
          ))}

          {/* Floating price tag */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            whileHover={{ rotate: 0, scale: 1.05 }}
            transition={{ duration: 0.5, delay: 1.2, ease: 'backOut' }}
            className="absolute -left-2 bottom-8 z-30 rounded-2xl bg-white p-3 shadow-2xl sm:-left-4 sm:p-4"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8527a] to-[#d4405f] text-white shadow-md sm:h-10 sm:w-10">
                <FaHome className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 sm:text-[10px]">
                  Find Your
                </p>
                <p className="text-base font-black text-[#0d3347] sm:text-lg">
                  Stay
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RealEstateBanner;
