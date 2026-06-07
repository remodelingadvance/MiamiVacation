import { motion } from 'framer-motion';
import {
  HiLocationMarker,
  HiExternalLink,
  HiStar,
} from 'react-icons/hi';
import { FaDirections, FaMapMarkerAlt } from 'react-icons/fa';
import { APP_CONFIG } from '../../config/constants';

const EASE = [0.25, 0.46, 0.45, 0.94];

const ContactMap = () => {
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    APP_CONFIG.address
  )}&output=embed&z=15`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    APP_CONFIG.address
  )}`;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf6ef] via-white to-[#fdf6ef]">
      {/* Decorative bg blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#e8527a]/8 blur-3xl" />
        <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-cyan-400/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        
        {/* ═══ FULL WIDTH MAP ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-300/40 transition-all duration-300 hover:shadow-3xl sm:rounded-3xl"
        >
          {/* Map container */}
          <div className="relative h-[400px] sm:h-[480px] lg:h-[560px]">
            <iframe
              src={mapEmbedUrl}
              title="Office Location"
              className="h-full w-full"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* SVG colorful animated lines overlay */}
            <svg
              className="pointer-events-none absolute inset-0 z-10 h-full w-full"
              viewBox="0 0 1200 600"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e8527a" stopOpacity="0" />
                  <stop offset="50%" stopColor="#e8527a" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ff7a9c" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>

              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: 'easeInOut' }}
                d="M 0 200 Q 300 100, 600 200 T 1200 250"
                fill="none"
                stroke="url(#lineGrad1)"
                strokeWidth="2"
                strokeDasharray="8 4"
              />
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2.2, delay: 0.3, ease: 'easeInOut' }}
                d="M 0 350 Q 400 250, 700 350 T 1200 400"
                fill="none"
                stroke="url(#lineGrad2)"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2.4, delay: 0.5, ease: 'easeInOut' }}
                d="M 0 450 Q 350 380, 700 450 T 1200 500"
                fill="none"
                stroke="url(#lineGrad3)"
                strokeWidth="2"
                strokeDasharray="4 8"
              />
            </svg>

            {/* Centered location pin */}
            <motion.div
              initial={{ opacity: 0, scale: 0, y: -20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6, ease: 'backOut' }}
              className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-full"
            >
              <div className="relative">
                <span className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-[#e8527a] opacity-30" />
                <span className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[#e8527a] opacity-20" />
                <span className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[#e8527a] opacity-10" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#e8527a] to-[#d4405f] text-white shadow-2xl shadow-[#e8527a]/50 ring-4 ring-white">
                  <HiLocationMarker className="h-7 w-7" />
                </div>
              </div>
            </motion.div>

            {/* Top-left "We are here" */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="absolute left-3 top-3 z-20 sm:left-5 sm:top-5"
            >
              <div className="flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d3347] sm:text-xs">
                  We are here
                </span>
              </div>
            </motion.div>

            {/* Top-right distance badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute right-3 top-3 z-20 hidden sm:right-5 sm:top-5 sm:block"
            >
              <div className="overflow-hidden rounded-xl bg-white/95 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
                <div className="px-3.5 py-2 sm:px-4">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Distance to beach
                  </p>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#e8527a] sm:text-2xl">0.2</span>
                    <span className="text-xs font-bold text-gray-500">mi</span>
                  </div>
                </div>
                <div className="bg-[#e8527a] px-3.5 py-1.5 text-center sm:px-4">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white">
                    Walk 4 min
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Bottom floating address card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="absolute bottom-3 left-3 right-3 z-20 sm:bottom-5 sm:left-5 sm:right-5 lg:max-w-md"
            >
              <div className="group/card overflow-hidden rounded-xl border border-gray-200 bg-white/95 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl sm:rounded-2xl">
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8527a] to-[#d4405f] text-white shadow-lg shadow-[#e8527a]/30 sm:h-12 sm:w-12"
                    >
                      <HiLocationMarker className="h-5 w-5 sm:h-6 sm:w-6" />
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-black text-[#0d3347] sm:text-base">
                          StayWise Miami HQ
                        </h3>
                        <div className="flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5">
                          <HiStar className="h-3 w-3 text-amber-500" />
                          <span className="text-[10px] font-bold text-amber-700">4.9</span>
                        </div>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                        {APP_CONFIG.address}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 flex flex-wrap gap-2 sm:mt-4">
                    <motion.a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#e8527a] to-[#d4405f] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#e8527a]/30 transition-shadow hover:shadow-xl sm:flex-none"
                    >
                      <FaDirections className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Get Directions
                    </motion.a>
                    <motion.a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(APP_CONFIG.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-[#0d3347] transition-all duration-200 hover:border-[#e8527a]/40 hover:bg-[#e8527a]/5 sm:flex-none"
                    >
                      <HiExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Open in Maps
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ═══ Quick info row below map ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mt-4 flex items-center justify-center gap-2 sm:mt-6 sm:gap-3"
        >
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 shadow-sm sm:text-sm">
            <FaMapMarkerAlt className="h-3 w-3 text-[#e8527a] sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">Find us on the map</span>
            <span className="sm:hidden">Find us</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactMap;