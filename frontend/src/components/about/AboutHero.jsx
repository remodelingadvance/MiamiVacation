import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';

const socialLinks = [
  { Icon: FaFacebookF, href: '#', label: 'Facebook' },
  { Icon: FaInstagram, href: '#', label: 'Instagram' },
  { Icon: FaTwitter, href: '#', label: 'Twitter' },
  { Icon: FaYoutube, href: '#', label: 'YouTube' },
];

const AboutHero = () => {
  return (
    <section className="relative h-[560px] overflow-hidden sm:h-[640px] lg:h-[720px]">
      {/* ─── Background image (slow Ken Burns zoom) ─── */}
      <motion.div
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 14, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <img
          src="https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=2400&q=80"
          alt="Miami coastline at sunset"
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Dark overlays for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/15" />

      {/* ─── Social icons (vertical right) ─── */}
      <div className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2.5 sm:right-5 lg:right-8">
        {socialLinks.map((social, i) => (
          <motion.a
            key={i}
            href={social.href}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 + i * 0.1 }}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md transition-all duration-300 hover:bg-[var(--color-primary)] hover:ring-[var(--color-primary)]/50 hover:shadow-[var(--color-primary)]/40 sm:h-11 sm:w-11"
            aria-label={social.label}
          >
            <social.Icon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 sm:h-4 sm:w-4" />
          </motion.a>
        ))}
      </div>

      {/* ─── Center content ─── */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6">
        <div className="max-w-3xl text-center">
          {/* WELCOME TO with decorative lines */}
          <div className="mb-3 flex items-center justify-center gap-4 sm:mb-4">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="h-px w-12 origin-right bg-white/85 sm:w-16 lg:w-20"
            />
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-[11px] font-bold tracking-[0.3em] text-white sm:text-sm"
            >
              WELCOME TO
            </motion.span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="h-px w-12 origin-left bg-white/85 sm:w-16 lg:w-20"
            />
          </div>

          {/* Main title (split for stagger animation) */}
          <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="inline-block font-light tracking-wide"
            >
              Staywise
            </motion.span>{' '}
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="inline-block text-[var(--color-primary)] drop-shadow-[0_2px_20px_rgba(255,79,123,0.45)]"
            >
              Miami
            </motion.span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/90 sm:mt-6 sm:text-base lg:text-lg"
            style={{ fontFamily: 'var(--font-display, serif)', fontStyle: 'italic' }}
          >
            Curated luxury vacation rentals across South Beach, Brickell, and
            Coconut Grove — every stay hand-picked by our local Miami concierge.
          </motion.p>

          {/* CTA Button with shine sweep */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="mt-7 sm:mt-8"
          >
            <Link
              to="/properties"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[var(--color-primary)] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-2xl shadow-[var(--color-primary)]/40 transition-all duration-300 hover:scale-105 hover:bg-[var(--color-primary-dark)] hover:shadow-[var(--color-primary)]/60 sm:px-10 sm:text-sm"
            >
              {/* Shine sweep */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
              <span className="relative">Read More</span>
              <HiArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ─── Scroll indicator at bottom ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.9 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/75">
            Scroll
          </span>
          <div className="h-8 w-px bg-gradient-to-b from-white/70 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AboutHero;