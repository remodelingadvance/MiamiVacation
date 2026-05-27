import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  HiChevronLeft, HiChevronRight, HiLocationMarker,
  HiShieldCheck, HiPhone, HiArrowRight, HiHeart, HiCheck,
} from 'react-icons/hi';

import BgImage from '../../assets/aboutBg.png';

/* ── Data ────────────────────────────────────────────────── */
const EXPERIENCES = [
  {
    id: 1,
    title: 'Beach & Sun',
    desc: 'Relax on world-famous Miami beaches',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=85',
    icon: '🏖️',
    color: '#F41452',
  },
  {
    id: 2,
    title: 'Food & Nightlife',
    desc: "Savor Miami's vibrant food and nightlife",
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&q=85',
    icon: '🍽️',
    color: '#F5A623',
  },
  {
    id: 3,
    title: 'Boat & Yacht Tours',
    desc: 'Explore Miami from the water',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=500&q=85',
    icon: '⛵',
    color: '#245BFF',
  },
  {
    id: 4,
    title: 'Art & Culture',
    desc: 'Discover Wynwood, museums & more',
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500&q=85',
    icon: '🎨',
    color: '#7B5EA7',
  },
  {
    id: 5,
    title: 'Shopping',
    desc: "Shop in style in Miami's top spots",
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=500&q=85',
    icon: '🛍️',
    color: '#00A551',
  },
  {
    id: 6,
    title: 'Water Sports',
    desc: 'Jet ski, surf and dive in Miami',
    image: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=500&q=85',
    icon: '🏄',
    color: '#4DB5FF',
  },
];

const BENEFITS = [
  'Best Price Guarantee',
  'Flexible Cancellation',
  '24/7 Local Support',
  'Exclusive Perks & Offers',
];

const TRUST = [
  { icon: HiLocationMarker, label: 'Prime Locations' },
  { icon: HiShieldCheck,    label: 'Secure Booking'  },
  { icon: HiPhone,          label: '24/7 Support'    },
];

/* ── Animation variants ──────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09 } },
};

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function ExperiencesSection() {
  const sectionRef  = useRef(null);
  const scrollRef   = useRef(null);
  const isInView    = useInView(sectionRef, { once: true, margin: '-80px' });

  const [activeIdx,  setActiveIdx]  = useState(0);
  const [wishlist,   setWishlist]   = useState([]);
  const [maxVisible, setMaxVisible] = useState(4);

  /* Responsive visible count */
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setMaxVisible(w < 480 ? 1 : w < 640 ? 2 : w < 900 ? 3 : 4);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const maxIdx  = Math.max(0, EXPERIENCES.length - maxVisible);
  const canPrev = activeIdx > 0;
  const canNext = activeIdx < maxIdx;

  const scrollTo = (idx) => {
    setActiveIdx(idx);
    const el   = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('[data-card]');
    if (!card) return;
    el.scrollTo({ left: idx * (card.offsetWidth + 12), behavior: 'smooth' });
  };

  const toggleWish = (id) =>
    setWishlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]);

  return (
    <section
  ref={sectionRef}
  className="w-full bg-white"
  style={{
    padding: "4px",
    backgroundImage: `url(${BgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
      <div className="max-w-[1500px] mx-auto py-12 lg:py-16" px-4>

        {/* ══════════════════════════════════════════════════
            TOP ROW
        ══════════════════════════════════════════════════ */}
        <div className="flex flex-col xl:flex-row gap-3 mb-3">

          {/* ── Experiences carousel block ───────────────── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
            className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4 sm:p-5"
          >
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
              <h2 className="font-hero font-black tracking-tight uppercase leading-tight"
                  style={{ fontSize: 'clamp(0.85rem, 2.2vw, 1.1rem)' }}>
                <span className="text-[#07144C]">EXPERIENCES </span>
                <span className="text-[#F41452]">BEYOND THE STADIUM</span>
              </h2>

              <div className="flex items-center gap-2 shrink-0 ml-4">
                {[
                  { dir: 'prev', can: canPrev, onClick: () => scrollTo(Math.max(0, activeIdx - 1)) },
                  { dir: 'next', can: canNext, onClick: () => scrollTo(Math.min(maxIdx, activeIdx + 1)) },
                ].map(({ dir, can, onClick }) => (
                  <motion.button
                    key={dir}
                    whileHover={can ? { scale: 1.12 } : {}}
                    whileTap={can ? { scale: 0.9 } : {}}
                    onClick={onClick}
                    disabled={!can}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                    style={{
                      borderColor: can ? '#07144C' : '#E5E7EB',
                      color:       can ? '#07144C' : '#D1D5DB',
                      background:  can ? 'transparent' : '#F9FAFB',
                    }}
                  >
                    {dir === 'prev'
                      ? <HiChevronLeft  className="w-4 h-4" />
                      : <HiChevronRight className="w-4 h-4" />}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Cards */}
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto no-scrollbar"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {EXPERIENCES.map((exp, i) => (
                <ExperienceCard
                  key={exp.id}
                  exp={exp}
                  index={i}
                  isInView={isInView}
                  wishlisted={wishlist.includes(exp.id)}
                  onWish={() => toggleWish(exp.id)}
                />
              ))}
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width:      i === activeIdx ? 20 : 6,
                    height:     6,
                    background: i === activeIdx ? '#F41452' : '#E5E7EB',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* ── Book Direct & Save card ───────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.25 }}
            className="relative overflow-hidden rounded-2xl flex flex-col justify-between shrink-0"
            style={{
              width:      'clamp(240px, 28vw, 310px)',
              minHeight:  260,
              background: 'linear-gradient(140deg, #F41452 0%, #B8003A 100%)',
            }}
          >
            {/* Decorative rings */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border-[30px] border-white/10 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8  w-32 h-32 rounded-full border-[20px] border-white/10 pointer-events-none" />

            {/* Soccer ball */}
            <motion.div
              className="absolute -top-2 -right-2 w-28 h-28 sm:w-32 sm:h-32"
              animate={{ rotate: [0, 12, -8, 0], y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src="https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=300&q=85"
                alt="Ball"
                className="w-full h-full object-cover rounded-full shadow-2xl"
                style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.4))' }}
              />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 p-5 pt-6">
              <p className="text-[10px] font-bold tracking-[0.2em] text-white/65 uppercase mb-1">
                Exclusive Benefits
              </p>
              <h3
                className="font-hero font-black text-white leading-[1.0] mb-4"
                style={{ fontSize: 'clamp(1.25rem, 2.8vw, 1.6rem)' }}
              >
                BOOK DIRECT<br />&amp; SAVE
              </h3>

              <motion.ul
                variants={stagger}
                initial="hidden"
                animate={isInView ? 'show' : 'hidden'}
                className="space-y-2"
              >
                {BENEFITS.map((b) => (
                  <motion.li key={b} variants={fadeUp} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                      <HiCheck className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold text-white/90">{b}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            {/* CTA */}
            <div className="relative z-10 p-5 pt-3">
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 w-full bg-white font-black text-sm py-3 rounded-xl shadow-lg transition-all"
                style={{ color: '#F41452' }}
              >
                Book Your Stay
                <HiArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════
            BOTTOM BANNER
        ══════════════════════════════════════════════════ */}
        <BannerSection isInView={isInView} />
      </div>
    </section>
  );
}

/* ── Experience Card ─────────────────────────────────────── */
function ExperienceCard({ exp, index, isInView, wishlisted, onWish }) {
  return (
    <motion.div
      data-card
      initial={{ opacity: 0, y: 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.22 } }}
      className="group shrink-0 flex flex-col rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      style={{
        width: 'clamp(150px, 19vw, 200px)',
        scrollSnapAlign: 'start',
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 118 }}>
        <img
          src={exp.image}
          alt={exp.title}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Wishlist btn */}
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); onWish(); }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md"
        >
          <HiHeart
            className="w-3.5 h-3.5 transition-colors duration-200"
            style={{ color: wishlisted ? '#F41452' : '#9CA3AF' }}
          />
        </motion.button>

        {/* Category pill */}
        <div
          className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-white text-[9px] font-bold tracking-wide"
          style={{ background: `${exp.color}cc`, backdropFilter: 'blur(4px)' }}
        >
          {exp.title}
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5 flex items-start gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${exp.color}15` }}
        >
          {exp.icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black text-[#07144C] leading-tight truncate">
            {exp.title}
          </p>
          <p className="text-[10px] text-gray-400 leading-snug mt-0.5 line-clamp-2">
            {exp.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Bottom Banner ───────────────────────────────────────── */
function BannerSection({ isInView }) {
  const [wished, setWished] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: 0.35 }}
      className="relative overflow-hidden rounded-2xl"
      style={{ minHeight: 'clamp(150px, 22vw, 200px)' }}
    >
      {/* BG image with zoom-in */}
      <motion.img
        src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1400&q=85"
        alt="World Cup fans"
        className="absolute inset-0 w-full h-full object-cover object-center"
        initial={{ scale: 1.1 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Overlay — heavy left, fades right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(100deg, rgba(7,20,76,0.96) 0%, rgba(7,20,76,0.82) 35%, rgba(7,20,76,0.45) 62%, rgba(7,20,76,0.10) 100%)',
        }}
      />

      {/* Animated light shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
        }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
      />

      {/* Bottom rainbow ribbon */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background:
            'linear-gradient(90deg,#F41452 0%,#245BFF 25%,#3FBD55 50%,#FFD23D 75%,#F41452 100%)',
        }}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.6 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 px-5 sm:px-7 lg:px-10 py-6 lg:py-7 h-full">

        {/* Left */}
        <div className="flex-1 min-w-0">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.45 }}
            className="font-hero font-black text-white leading-[0.95] tracking-tight"
            style={{ fontSize: 'clamp(1.5rem, 3.8vw, 2.6rem)' }}
          >
            LIVE THE WORLD CUP
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.58 }}
            className="font-display italic font-bold text-[#FF4D7D] mt-0.5 mb-3"
            style={{ fontSize: 'clamp(0.95rem, 2.2vw, 1.35rem)' }}
          >
            From the heart of Miami
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.72 }}
            className="flex flex-wrap gap-3 sm:gap-5"
          >
            {TRUST.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-white/85">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — CTA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.55 }}
          className="flex items-center gap-2.5 shrink-0 self-start sm:self-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 font-black text-white rounded-full whitespace-nowrap shadow-2xl"
            style={{
              background:  '#F41452',
              boxShadow:   '0 8px 28px rgba(244,20,82,0.5)',
              padding:     'clamp(10px,1.8vw,14px) clamp(16px,3vw,28px)',
              fontSize:    'clamp(0.75rem, 1.6vw, 0.9rem)',
            }}
          >
            Find Your Perfect Stay
            <HiArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => setWished((w) => !w)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shrink-0 transition-colors duration-200"
            style={{ background: wished ? 'rgba(244,20,82,0.35)' : 'rgba(255,255,255,0.15)' }}
          >
            <HiHeart
              className="w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200"
              style={{ color: wished ? '#FF4D7D' : 'white' }}
            />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}