import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FillButton from '../common/FillButton';

const EASE = [0.21, 0.47, 0.32, 0.98];

const images = [
  {
    src: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80',
    alt: 'Dream home exterior',
    mt: 'lg:mt-10',
  },
  {
    src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    alt: 'Modern living room',
    mt: 'lg:mt-20',
  },
  {
    src: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
    alt: 'Bright interior with plant',
    mt: 'lg:mt-0',
  },
];

const RealEstateBanner = () => {
  return (
    <section className="relative overflow-hidden bg-[#f4f2ea] py-12 sm:py-16 lg:min-h-[620px] lg:py-0">
      {/* ──────── DECORATIONS ──────── */}
      {/* Hexagon honeycomb (left, behind text) */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-24 h-72 w-80 text-gray-400/20"
      >
        <defs>
          <pattern
            id="hexagons"
            patternUnits="userSpaceOnUse"
            width="28"
            height="49"
            patternTransform="scale(2)"
          >
            <path
              d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>

      {/* Gray rounded block behind "IT'S TIME" */}
      <div className="pointer-events-none absolute left-6 top-[88px] hidden h-14 w-60 rounded-2xl bg-gray-300/30 lg:block" />

      {/* Beige triangle (top-right) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[26%] top-0 hidden h-0 w-0 border-x-[36px] border-b-[64px] border-x-transparent border-b-[#e2dac8] lg:block"
      />

      {/* Soft sage circle (bottom-left, partial) */}
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-[#dde2d3]/60"
      />

      {/* Diamond cluster of squares (top-center) — pink */}
      <div className="pointer-events-none absolute left-[42%] top-12 hidden h-10 w-10 lg:block">
        <motion.div
          animate={{ rotate: [0, 90, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="relative h-full w-full"
        >
          <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[var(--color-primary)]" />
          <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-[var(--color-primary)]" />
          <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-[var(--color-primary)]" />
          <span className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[var(--color-primary)]" />
        </motion.div>
      </div>

      {/* Plus signs — pink */}
      {[
        { top: '18%', left: '20%', size: 'text-2xl' },
        { top: '8%', left: '36%', size: 'text-xl' },
        { bottom: '24%', left: '46%', size: 'text-lg' },
      ].map((p, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          className={`pointer-events-none absolute hidden font-light text-[var(--color-primary)] lg:block ${p.size}`}
          style={{ top: p.top, left: p.left, bottom: p.bottom }}
        >
          +
        </motion.span>
      ))}

      {/* Diagonal hatch lines (bottom-center) */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-[36%] hidden h-12 w-28 text-gray-400/45 lg:block"
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

      {/* Dotted grid (bottom-right) — pink */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 right-10 hidden h-20 w-36 text-[var(--color-primary)]/40 lg:block"
      >
        <defs>
          <pattern id="dotgrid" width="13" height="13" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>

      {/* ──────── CONTENT ──────── */}
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:gap-10 lg:py-16">
        {/* Left: text */}
        <div>
          <h1 className="font-light uppercase leading-[1.12] tracking-tight text-[var(--color-primary)]">
            {["YOUR PERFECT", 'MIAMI GETAWAY'].map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.15, ease: EASE }}
                className="block text-3xl sm:text-4xl lg:text-5xl"
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-6 max-w-md text-base font-bold leading-snug text-[var(--color-secondary)] sm:text-lg"
          >
            Luxury Vacation Stays <br />
            Designed for Unforgettable Experiences
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-4 max-w-md text-sm leading-relaxed text-[var(--color-text-muted)]"
          >
            Discover premium vacation rentals, beachfront condos, and luxury accommodations across Miami's most sought-after destinations. Whether you're planning a family vacation, romantic escape, or extended stay, StayWise helps you find the perfect place to relax, recharge, and create lasting memories.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.95 }}
            className="mt-8"
          >
            <FillButton
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Get in touch
            </FillButton>
          </motion.div>
        </div>

        {/* Right: three staggered photos */}
        <div className="flex items-start justify-center gap-3 sm:gap-4">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 + i * 0.15, ease: EASE }}
              whileHover={{ y: -10 }}
              className={`group relative h-60 w-1/3 max-w-[180px] overflow-hidden rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/5 sm:h-80 lg:h-[420px] ${img.mt}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RealEstateBanner;