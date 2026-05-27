import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function AboutHero() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Parallax & zoom on background
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-[#07144C]"
    >
      {/* ── Animated Background Image ─────────────────────── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ scale: bgScale, y: bgY }}
      >
        <motion.img
          src="https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=1920&q=80"
          alt="Miami Beach"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Right side — clear / vivid */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(7,20,76,0.97) 0%, rgba(7,20,76,0.93) 28%, rgba(7,20,76,0.7) 42%, rgba(7,20,76,0.1) 58%, rgba(7,20,76,0.0) 100%)',
          }}
        />

        {/* Bottom fade to white for ribbon transition */}
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(7,20,76,0.4) 60%, rgba(7,20,76,0.7) 100%)',
          }}
        />

        {/* Subtle animated light sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
          }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 6, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* ── Floating particles ────────────────────────────── */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${[8, 5, 10, 6, 4, 9][i]}px`,
              height: `${[8, 5, 10, 6, 4, 9][i]}px`,
              background: ['#F41452', '#245BFF', '#3FBD55', '#FFD23D', '#F41452', '#245BFF'][i],
              left: `${[10, 25, 72, 85, 60, 45][i]}%`,
              top: `${[20, 65, 15, 45, 70, 30][i]}%`,
              opacity: 0.6,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: [3.5, 4, 3, 5, 4.5, 3.8][i],
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-40 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">

          {/* ── Left — Text ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="space-y-7"
          >
            {/* Eye-brow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex items-center gap-3"
            >
              <span className="block w-8 h-0.5 rounded-full bg-[#F41452]" />
              <span className="text-xs sm:text-sm font-black tracking-[0.22em] text-[#F41452] uppercase">
                About Miami Stay
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.55 }}
              className="font-hero font-black leading-[0.9] tracking-tight"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}
            >
              <span className="text-white block">MORE THAN</span>
              <span className="text-white block">A STAY.</span>
              <span
                className="block mt-1"
                style={{
                  background: 'linear-gradient(90deg, #F41452 0%, #FF6B8A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                IT'S MIAMI.
              </span>
            </motion.h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.75 }}
              className="text-base lg:text-lg text-white/70 max-w-md leading-relaxed"
            >
              Miami Stay is the official home reservation platform for the FIFA
              World Cup 2026™ in Miami. We connect travelers with extraordinary
              homes and unforgettable experiences in one of the world's most
              iconic cities.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.9 }}
              className="flex flex-wrap gap-4 pt-1"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2.5 bg-[#F41452] text-white px-8 py-4 rounded-full font-bold text-base transition-all shadow-xl"
                style={{ boxShadow: '0 8px 28px rgba(244,20,82,0.45)' }}
              >
                Explore Stays
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold text-base border border-white/20 transition-all hover:bg-white/20"
              >
                Our Story
              </motion.button>
            </motion.div>

            {/* Location pill */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 1.1 }}
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F41452]/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#F41452]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Official Host City</div>
                <div className="text-sm font-bold text-white">Miami, Florida</div>
              </div>
              <div className="w-px h-8 bg-white/15 mx-1" />
              <div>
                <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Tournament</div>
                <div className="text-sm font-bold text-white">FIFA WC 2026™</div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right — FIFA 26 Artwork ──────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="relative hidden lg:flex items-center justify-center h-[600px]"
          >
            {/* Glow blob behind 26 */}
            <div
              className="absolute w-72 h-72 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(244,20,82,0.25) 0%, transparent 70%)',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                filter: 'blur(40px)',
              }}
            />

            {/* Large "26" — red layer */}
            <motion.div
              animate={{ scale: [1, 1.025, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            >
              <span
                className="font-hero font-black leading-none"
                style={{
                  fontSize: 'clamp(200px, 28vw, 380px)',
                  background: 'linear-gradient(112deg, #F41452 0% 35%, #245BFF 35% 65%, #F41452 65% 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  opacity: 0.95,
                  letterSpacing: '-0.04em',
                }}
              >
                26
              </span>
            </motion.div>

            {/* "26" blue offset shadow */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              style={{ transform: 'translate(12px, 14px)' }}
            >
              <span
                className="font-hero font-black leading-none"
                style={{
                  fontSize: 'clamp(200px, 28vw, 380px)',
                  color: '#245BFF',
                  opacity: 0.18,
                  letterSpacing: '-0.04em',
                }}
              >
                26
              </span>
            </div>

            {/* FIFA Trophy — centered */}
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute z-20"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -58%)' }}
            >
              <div
                className="relative flex flex-col items-center justify-end pb-3"
                style={{ width: 110, height: 160 }}
              >
                {/* Trophy body */}
                <div
                  className="w-full h-full rounded-t-[50%] rounded-b-lg flex flex-col items-center justify-center gap-1"
                  style={{
                    background: 'linear-gradient(160deg, #FFE680 0%, #F5A623 35%, #C67C0D 70%, #8B5500 100%)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
                  }}
                >
                  {/* Trophy star */}
                  <svg className="w-12 h-12 drop-shadow" fill="#fff" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="font-hero font-black text-white text-lg tracking-widest drop-shadow">
                    FIFA
                  </span>
                </div>
                {/* Trophy base */}
                <div
                  className="w-16 h-3 rounded-b-lg -mt-1"
                  style={{ background: 'linear-gradient(90deg, #8B5500, #C67C0D, #8B5500)' }}
                />
                {/* Glow under trophy */}
                <div
                  className="absolute -bottom-4 w-20 h-4 rounded-full"
                  style={{
                    background: 'rgba(245,166,35,0.4)',
                    filter: 'blur(8px)',
                  }}
                />
              </div>
            </motion.div>

            {/* Soccer Ball */}
            <motion.div
              animate={{ rotate: 360, y: [0, -8, 0] }}
              transition={{
                rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
                y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="absolute bottom-8 right-8 z-30"
            >
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #fff 0%, #e0e0e0 60%, #bbb 100%)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.45), inset 0 -4px 8px rgba(0,0,0,0.15)',
                }}
              >
                {/* Hexagon pattern */}
                <svg viewBox="0 0 80 80" className="w-24 h-24 absolute inset-0" fill="none">
                  <circle cx="40" cy="40" r="38" fill="none" stroke="#ccc" strokeWidth="1" />
                  <polygon points="40,10 52,18 52,34 40,42 28,34 28,18" fill="#111" opacity="0.75" />
                  <polygon points="60,26 72,26 72,42 60,50 52,42 52,26" fill="#111" opacity="0.6" />
                  <polygon points="20,26 28,26 28,42 20,50 8,42 8,26" fill="#111" opacity="0.6" />
                  <polygon points="40,58 52,50 60,58 52,70 28,70 20,58 28,50" fill="#111" opacity="0.6" />
                </svg>
              </div>
            </motion.div>

            {/* Floating badge — top right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="absolute top-12 right-4 z-30"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center shadow-xl"
              >
                <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Matches</div>
                <div className="text-sm font-black text-white">Jun 11 – Jul 19</div>
                <div className="text-[10px] font-semibold text-[#F41452]">2026</div>
              </motion.div>
            </motion.div>

            {/* Floating badge — bottom left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="absolute bottom-24 left-4 z-30"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xl"
              >
                <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Verified Homes</div>
                <div className="text-sm font-black text-white">500+ Listings</div>
                <div className="flex gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-2.5 h-2.5 text-[#FFD23D]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Colourful Ribbons ─────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-28 overflow-hidden z-20 pointer-events-none">
        {[
          { color: '#F41452', left: '0%',   width: '88%', delay: 1.4 },
          { color: '#ffffff', left: '8%',   width: '84%', delay: 1.5 },
          { color: '#245BFF', left: '16%',  width: '84%', delay: 1.6 },
          { color: '#4DB5FF', left: '28%',  width: '74%', delay: 1.7 },
          { color: '#3FBD55', left: '42%',  width: '62%', delay: 1.8 },
          { color: '#FFD23D', left: '58%',  width: '50%', delay: 1.9 },
        ].map((r, i) => (
          <motion.div
            key={i}
            initial={{ x: '-110%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.9, delay: r.delay, ease: [0.4, 0, 0.2, 1] }}
            className="absolute bottom-0 h-7"
            style={{
              background: r.color,
              left: r.left,
              width: r.width,
              transform: 'skewX(-14deg)',
              transformOrigin: 'bottom left',
              opacity: r.color === '#ffffff' ? 0.9 : 1,
            }}
          />
        ))}
      </div>
    </section>
  );
}