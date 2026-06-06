import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiSparkles } from 'react-icons/hi';
import SkeletonLoader from '../common/SkeletonLoader';
import PropertyCard from '../properties/PropertyCard';

const FeaturedProperties = ({ properties, loading }) => {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
      {/* ─── Animated Miami-sunset Background ─── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Base wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-light)] via-white to-[#fff8fa]" />

        {/* Floating gradient orbs */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-40 top-10 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-[var(--color-primary)]/35 via-[#ff8a5a]/25 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-40 top-1/3 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-[#ffa3c4]/35 via-[var(--color-primary)]/20 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#ffe066]/30 via-[var(--color-primary)]/15 to-transparent blur-3xl"
        />

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(17,24,39,1) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Art-Deco vertical-lines ornament (top right) */}
        <svg
          aria-hidden="true"
          className="absolute right-6 top-6 hidden h-28 w-28 text-[var(--color-primary)]/25 sm:block lg:right-10 lg:top-10 lg:h-36 lg:w-36"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M50 4 L50 96 M40 14 L40 86 M60 14 L60 86 M30 24 L30 76 M70 24 L70 76 M20 36 L20 64 M80 36 L80 64" />
          <circle cx="50" cy="50" r="46" strokeDasharray="2 4" />
        </svg>

        {/* Art-Deco arch ornament (bottom left) */}
        <svg
          aria-hidden="true"
          className="absolute -bottom-6 -left-6 hidden h-40 w-40 text-[var(--color-primary)]/15 lg:block"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
        >
          <path d="M10 90 L10 50 A40 40 0 0 1 90 50 L90 90" />
          <path d="M20 90 L20 55 A30 30 0 0 1 80 55 L80 90" />
          <path d="M30 90 L30 60 A20 20 0 0 1 70 60 L70 90" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-12 flex flex-col items-start justify-between gap-8 sm:mb-16 lg:flex-row lg:items-end"
        >
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-primary)]/15 backdrop-blur-sm">
              <HiSparkles className="h-3.5 w-3.5" />
              Miami Exclusive
            </div>

            {/* Title */}
            <h2
              className="text-4xl font-bold leading-[1.05] tracking-tight text-[var(--color-secondary)] sm:text-5xl lg:text-6xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Featured{' '}
              <span className="relative inline-block">
                <span className="relative z-10 italic text-[var(--color-primary)]">
                  Stays
                </span>
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-1.5 left-0 h-3 w-full text-[var(--color-primary)]/35"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  fill="currentColor"
                >
                  <path d="M0,8 Q50,0 100,4 T200,6 L200,12 L0,12 Z" />
                </svg>
              </span>
            </h2>

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg">
              Handpicked luxury escapes along Miami's most coveted shores — where
              Art Deco glamour meets oceanfront indulgence.
            </p>
          </div>

          {/* View All CTA */}
          <Link
            to="/properties"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-secondary)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-secondary)]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-primary)] hover:shadow-xl hover:shadow-[var(--color-primary)]/25"
          >
            Explore all properties
            <HiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* ─── Grid ─── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonLoader key={i} type="card" />
            ))}
          </div>
        ) : !properties || properties.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--color-primary)]/30 bg-white/70 p-14 text-center backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/20">
              <HiSparkles className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <p className="text-lg font-semibold text-[var(--color-text-dark)]">
              No featured properties available
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Check back soon for new luxury listings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {properties.slice(0, 6).map((property, index) => (
              <motion.div
                key={property._id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  delay: Math.min(index * 0.08, 0.4),
                  duration: 0.7,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>
        )}

        {/* ─── Bottom decorative gradient line ─── */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mx-auto mt-16 h-px max-w-md origin-center bg-gradient-to-r from-transparent via-[var(--color-primary)]/40 to-transparent sm:mt-20"
        />
      </div>
    </section>
  );
};

export default FeaturedProperties;