import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiPhone, HiGlobe, HiArrowRight } from 'react-icons/hi';
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaWhatsapp,
} from 'react-icons/fa';
import { APP_CONFIG } from '../../config/constants';

const EASE = [0.25, 0.46, 0.45, 0.94];

const NatureExploreHero = () => {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div className="relative">
        <div className="relative min-h-[420px] overflow-hidden sm:min-h-[480px] lg:min-h-[540px] xl:min-h-[580px]">

          {/* ══════ BACKGROUND IMAGE — right side ══════ */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=1800&q=90"
              alt="Miami Beach boardwalk"
              className="h-full w-full object-cover object-center"
            />
            {/* Dark overlay for text readability on mobile */}
            <div className="absolute inset-0 bg-black/20 lg:hidden" />
          </div>

          {/* ══════ WHITE LEFT SHAPE — brush/diagonal clip ══════ */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] hidden w-[58%] lg:block">
            {/* Main white area */}
            <div
              className="h-full w-full bg-white"
              style={{
                clipPath:
                  'polygon(0 0, 85% 0, 65% 100%, 0 100%)',
              }}
            />
          </div>

          {/* Brush stroke decorative shapes */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[3] hidden lg:block">
            {/* Top brush splash */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute right-[-80px] top-[10%]"
            >
              <svg width="200" height="120" viewBox="0 0 200 120" fill="none">
                <path
                  d="M10 80C30 20 80 5 130 15C180 25 195 60 180 90C165 120 100 115 60 100C20 85 -10 140 10 80Z"
                  fill="#e8527a"
                  opacity="0.08"
                />
              </svg>
            </motion.div>

            {/* Bottom brush splash */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute bottom-[5%] left-[5%]"
            >
              <svg width="180" height="100" viewBox="0 0 180 100" fill="none">
                <path
                  d="M5 50C20 10 70 -5 120 10C170 25 175 70 150 85C125 100 60 95 30 80C0 65 -10 90 5 50Z"
                  fill="#e8527a"
                  opacity="0.06"
                />
              </svg>
            </motion.div>

            {/* Dot pattern */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute bottom-[20%] right-[-40px]"
            >
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[#e8527a]/15"
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* ══════ CONTENT ══════ */}
          <div className="relative z-[5] flex min-h-[420px] items-center px-6 py-12 sm:min-h-[480px] sm:px-10 lg:min-h-[540px] lg:px-16 xl:min-h-[580px] xl:px-20">
            <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2">

              {/* ═══ LEFT CONTENT ═══ */}
              <div className="max-w-lg">

                {/* Logo area */}
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="mb-6 sm:mb-8"
                >
                  <Link to="/" className="inline-flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8527a] shadow-lg shadow-[#e8527a]/25">
                      <span className="text-lg font-black text-white">S</span>
                    </div>
                    <span className="text-lg font-black text-[#0d3347] lg:text-[#0d3347]">
                      Stay<span className="text-[#e8527a]">Wise</span>
                    </span>
                  </Link>
                </motion.div>

                {/* Headline — script style */}
                <div className="overflow-hidden">
                  <motion.p
                    initial={{ y: 60 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
                    className="text-2xl font-light italic text-[#0d3347] sm:text-3xl lg:text-4xl"
                    style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}
                  >
                    Journey To
                  </motion.p>
                </div>

                {/* Bold headline */}
                <div className="overflow-hidden">
                  <motion.h1
                    initial={{ y: 80 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.65, delay: 0.2, ease: EASE }}
                    className="text-5xl font-black uppercase leading-[0.95] tracking-tight text-[#0d3347] sm:text-6xl lg:text-7xl xl:text-8xl"
                  >
                    <span className="text-[#e8527a]">Explore</span>
                  </motion.h1>
                </div>
                <div className="overflow-hidden">
                  <motion.h1
                    initial={{ y: 80 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.65, delay: 0.3, ease: EASE }}
                    className="text-5xl font-black uppercase leading-[0.95] tracking-tight text-[#0d3347] sm:text-6xl lg:text-7xl xl:text-8xl"
                  >
                    Miami
                  </motion.h1>
                </div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="mt-5 max-w-sm text-sm leading-relaxed text-gray-500 sm:text-[15px] lg:text-gray-600"
                >
                  Discover luxury vacation rentals, beachfront condos, and
                  private homes across Miami's best neighborhoods. Your dream
                  getaway starts here.
                </motion.p>

                {/* Book Now Button */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.55 }}
                  className="mt-7"
                >
                  <Link
                    to="/properties"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-[#e8527a] px-8 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-[#e8527a]/30 transition-all duration-200 hover:bg-[#d4405f] hover:shadow-2xl hover:shadow-[#e8527a]/40"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-[#d4405f] transition-transform duration-300 group-hover:translate-x-0" />
                    <span className="relative z-10 flex items-center gap-2">
                      Book Now
                      <HiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>

                {/* Bottom contact bar */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.65 }}
                  className="mt-8 flex flex-wrap items-center gap-5 text-sm"
                >
                  <a
                    href={`tel:${APP_CONFIG.phone}`}
                    className="flex items-center gap-2 font-semibold text-[#0d3347] transition-colors duration-200 hover:text-[#e8527a] lg:text-[#0d3347]"
                  >
                    <FaWhatsapp className="h-4 w-4 text-[#e8527a]" />
                    {APP_CONFIG.phone}
                  </a>

                  <div className="hidden h-4 w-px bg-gray-300 sm:block" />

                  <a
                    href={`https://${APP_CONFIG.website || 'staywise.com'}`}
                    className="flex items-center gap-2 font-semibold text-[#0d3347] transition-colors duration-200 hover:text-[#e8527a] lg:text-[#0d3347]"
                  >
                    <HiGlobe className="h-4 w-4 text-[#e8527a]" />
                    www.staywise.com
                  </a>
                </motion.div>
              </div>

              {/* ═══ RIGHT — Discount badge (floats over image) ═══ */}
              <div className="hidden items-center justify-center lg:flex">
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.5, ease: 'backOut' }}
                  className="relative"
                >
                  {/* Outer ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-3 rounded-full border-2 border-dashed border-white/40"
                  />

                  {/* Badge */}
                  <div className="relative flex h-36 w-36 flex-col items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#e8527a] to-[#d4405f] shadow-2xl shadow-[#e8527a]/40 xl:h-44 xl:w-44">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                      Up To
                    </span>
                    <span className="text-4xl font-black text-white xl:text-5xl">
                      20%
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wider text-white/90">
                      OFF!
                    </span>
                  </div>

                  {/* Sparkle dots */}
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -right-2 -top-2 h-3 w-3 rounded-full bg-white shadow-lg"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                    className="absolute -bottom-1 -left-3 h-2.5 w-2.5 rounded-full bg-white shadow-lg"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    className="absolute -right-4 bottom-4 h-2 w-2 rounded-full bg-[#e8527a] shadow-lg"
                  />
                </motion.div>
              </div>
            </div>
          </div>

          {/* ══════ SOCIAL ICONS — top right ══════ */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute right-5 top-5 z-[6] flex items-center gap-2 sm:right-8 sm:top-8"
          >
            {[
              { icon: FaInstagram, href: '#' },
              { icon: FaFacebookF, href: '#' },
              { icon: FaTwitter, href: '#' },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#0d3347] shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-[#e8527a] hover:text-white hover:shadow-lg sm:h-9 sm:w-9"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </motion.div>

          {/* ══════ MOBILE DISCOUNT BADGE ══════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6, ease: 'backOut' }}
            className="absolute bottom-6 right-6 z-[6] sm:bottom-8 sm:right-10 lg:hidden"
          >
            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-3 border-white bg-gradient-to-br from-[#e8527a] to-[#d4405f] shadow-xl shadow-[#e8527a]/30 sm:h-24 sm:w-24">
              <span className="text-[8px] font-bold uppercase tracking-wider text-white/80 sm:text-[9px]">
                Up To
              </span>
              <span className="text-xl font-black text-white sm:text-2xl">20%</span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-white/90 sm:text-[9px]">
                OFF!
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NatureExploreHero;