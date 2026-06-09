import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiUser } from 'react-icons/hi';
import { FaFacebookF, FaInstagram, FaTwitter, FaPinterest } from 'react-icons/fa';
import FillButton from '../common/FillButton';

const slides = [
  {
    url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=80',
    alt: 'Miami beachfront villa with pool',
  },
  {
    url: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1400&q=80',
    alt: 'Pool with ocean view',
  },
  {
    url: 'https://images.unsplash.com/photo-1551776235-dde6d482980b?auto=format&fit=crop&w=1400&q=80',
    alt: 'Tropical deck lounge',
  },
  {
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1400&q=80',
    alt: 'Modern Miami interior',
  },
];

const About = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-80vh overflow-hidden bg-[var(--color-bg-cream)]">
      {/* ─── HEADER ─── */}
      <header className="relative z-20 h-20">
        {/* Primary color corner with title */}
        <motion.div
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="absolute left-0 top-0 flex h-20 w-[220px] items-center justify-center gap-5 pr-7 sm:w-[280px] sm:pr-8 lg:w-[320px] lg:pr-10"
          style={{ backgroundColor: 'var(--color-primary)', borderBottomRightRadius: '55px' }}
        >
          <h2 className="text-xs font-bold text-white sm:text-sm lg:text-base">
            About StayWise Miami
          </h2>
        </motion.div>

        {/* Logo */}
        <div className="flex h-full items-center justify-end px-4 sm:px-6 lg:px-14">
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-right"
          >
            <div
              className="text-xl font-black tracking-tight sm:text-2xl lg:text-3xl"
              style={{ color: 'var(--color-secondary)' }}
            >
              STAYWISE<span style={{ color: 'var(--color-primary)' }}>.</span>
            </div>
            <div
              className="-mt-1 text-[8px] font-bold tracking-[0.35em] sm:text-[9px]"
              style={{ color: 'var(--color-secondary)' }}
            >
              MIAMI
            </div>
          </motion.div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <div className="relative px-4 pt-8 sm:px-6 sm:pt-12 lg:px-14">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* ─── LEFT: Image Section ─── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative lg:col-span-7 xl:col-span-8"
          >
            <div
              className="relative -ml-2 sm:-ml-14 h-[300px] w-full overflow-hidden shadow-xl sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[600px]"
              style={{
                borderTopRightRadius: '80px',
              }}
            >
              {/* Crossfade slider */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={slides[currentSlide].url}
                  alt={slides[currentSlide].alt}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>

              {/* Subtle bottom gradient */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Slide indicators */}
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-6">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className="h-1.5 rounded-full bg-white transition-all duration-300 sm:h-2"
                    style={{
                      width: i === currentSlide ? '20px' : '6px',
                      opacity: i === currentSlide ? 1 : 0.55,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Primary color circular badge */}
            <motion.div
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
              whileHover={{ scale: 1.05, rotate: -3 }}
              className="absolute -left-3 top-8 z-10 sm:left-0 sm:top-16 lg:left-5 lg:top-24"
            >
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-full shadow-xl sm:h-28 sm:w-28 lg:h-32 lg:w-32"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <div className="px-2 text-center text-white">
                  <p className="text-[7px] font-extrabold leading-tight tracking-wider sm:text-[8px] lg:text-[9px]">
                    GET OUR
                  </p>
                  <p className="text-[7px] font-extrabold leading-tight tracking-wider sm:text-[8px] lg:text-[9px]">
                    FREE GUIDE
                  </p>
                  <p
                    className="mt-0.5 text-[8px] font-bold italic leading-tight text-white/90 sm:mt-1 sm:text-[9px] lg:text-[10px]"
                    style={{ fontFamily: 'var(--font-display, serif)' }}
                  >
                    "MIAMI INSIDER"
                  </p>
                </div>
                {/* Speech-bubble tail */}
                <div
                  className="absolute -bottom-1 right-5 h-3 w-3 rotate-45 sm:right-6 sm:h-4 sm:w-4 lg:right-7"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* ─── RIGHT: Text Section ─── */}
          <div className="relative lg:col-span-5 xl:col-span-4 pb-6">
            {/* Star ornament */}
            <motion.div
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'backOut' }}
              className="absolute -left-6 -top-8 z-0 sm:-left-8 sm:-top-10 lg:-left-10 lg:-top-12"
            >
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                width="60"
                height="60"
                viewBox="0 0 100 100"
                className="opacity-70 sm:h-20 sm:w-20 lg:h-28 lg:w-28"
                fill="var(--color-primary)"
              >
                <path d="M50 5 Q 55 38 95 50 Q 55 62 50 95 Q 45 62 5 50 Q 45 38 50 5 Z" />
              </motion.svg>
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="relative z-10 text-3xl font-black leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl"
              style={{ color: 'var(--color-secondary)' }}
            >
              DISCOVER
              <br />
              MIAMI'S
              <br />
              <p style={{ color: 'var(--color-primary)' }}>FINEST STAYS!</p>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="relative z-10 mt-4 text-sm leading-relaxed text-[var(--color-text-muted)] sm:mt-6 sm:text-base lg:text-lg"
            >
              Luxury vacation rentals, beachfront condos, and exclusive villas across Miami's most sought-after destinations. Handpicked for comfort, style, and unforgettable experiences.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="relative z-10 mt-6 sm:mt-8"
            >
              <FillButton
                to="/properties"
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black tracking-[0.15em] transition-all hover:-translate-y-1 sm:px-7 sm:py-3.5 sm:text-sm lg:px-8 lg:py-4"
              >
                EXPLORE STAYS
                <svg
                  className="h-3 w-3 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </FillButton>
            </motion.div>

            {/* URL + Socials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="mt-8 sm:mt-10 lg:mt-12"
            >
              <p
                className="text-[10px] font-bold tracking-[0.18em] sm:text-xs lg:text-sm"
                style={{ color: 'var(--color-secondary)' }}
              >
                WWW.<span className="opacity-60">STAYWISE</span>.COM
              </p>
              <div className="mt-3 flex gap-2 sm:mt-4 sm:gap-2.5">
                {[FaFacebookF, FaInstagram, FaTwitter, FaPinterest].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ y: -4, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors sm:h-9 sm:w-9"
                    style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-bg-light)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                      e.currentTarget.style.color = 'var(--color-bg-light)';
                    }}
                    aria-label="Social link"
                  >
                    <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;