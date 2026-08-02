import { motion } from 'framer-motion';
import { HiPhone, HiMail, HiSparkles, HiStar } from 'react-icons/hi';
import {
  FaFacebookF,
  FaYoutube,
  FaTwitter,
  FaTiktok,
  FaInstagram,
} from 'react-icons/fa';
import { APP_CONFIG } from '../../config/constants';
import ContactHeroImg from '../../assets/contactHero.jpg';

const EASE = [0.22, 1, 0.36, 1]; // snappy cubic-bezier

const destinations = [
  {
    id: 1,
    name: 'South Beach',
    desc: 'Iconic Art Deco district with world-class nightlife.',
    img: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=600&q=85',
    price: '$289',
    rotate: -4,
    zIndex: 30,
  },
  {
    id: 2,
    name: 'Wynwood Walls',
    desc: 'Colorful murals, craft cocktails, creative energy.',
    img: 'https://images.unsplash.com/photo-1571406252241-db0280bd38db?w=600&q=85',
    price: '$215',
    rotate: 2,
    zIndex: 20,
  },
  {
    id: 3,
    name: 'Brickell Bay',
    desc: 'Luxury high-rises with panoramic bayfront views.',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=85',
    price: '$345',
    rotate: 6,
    zIndex: 10,
  },
];

const socials = [
  { icon: FaFacebookF, href: '#' },
  { icon: FaYoutube, href: '#' },
  { icon: FaTwitter, href: '#' },
  { icon: FaTiktok, href: '#' },
  { icon: FaInstagram, href: '#' },
];

const stats = [
  { value: '500+', label: 'Properties' },
  { value: '12K+', label: 'Happy Guests' },
  { value: '4.9★', label: 'Rating' },
];

const ContactHero = () => {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '100svh' }}>
      {/* ══════ BACKGROUND ══════ */}
      <div className="absolute inset-0">
        <img
          src={ContactHeroImg}
          alt="Miami Beach"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Ambient orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#e8527a]/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -35, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-32 right-1/3 h-[480px] w-[480px] rounded-full bg-[#0e7490]/15 blur-3xl"
      />

      {/* ══════ CONTENT ══════ */}
      <div className="relative z-10 flex min-h-[100svh] flex-col">
        {/* Top badge */}
        <div className="px-6 pt-10 sm:px-10 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e8527a]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/85 sm:text-[11px]">
              Miami's #1 Vacation Platform
            </span>
          </motion.div>
        </div>

        {/* Hero body */}
        <div className="flex flex-1 items-center px-6 py-8 sm:px-10 lg:px-20">
          <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            {/* ═══ LEFT — Copy ═══ */}
            <div className="flex flex-col">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-1 text-sm font-light italic text-white/60 sm:text-base"
              >
                we are
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
                className="text-[clamp(2.8rem,7.5vw,5.5rem)] font-black leading-[0.95] tracking-tight text-white"
              >
                StayWise
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.26, ease: EASE }}
                className="text-[clamp(2.8rem,7.5vw,5.5rem)] font-black italic leading-[0.95] tracking-tight text-[#e8527a]"
              >
                Miami
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.36 }}
                className="mt-5 max-w-md text-sm leading-relaxed text-white/65 sm:text-[15px]"
              >
                Discover handpicked vacation rentals and beachfront homes across
                Miami. Our concierge team is here every day to make your stay
                truly unforgettable.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.46 }}
                className="mt-7 flex items-center gap-7"
              >
                {stats.map((s, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-xl font-black text-white sm:text-2xl">
                      {s.value}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-white/50 sm:text-[11px]">
                      {s.label}
                    </span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="my-6 h-px w-full max-w-[360px] origin-left bg-gradient-to-r from-white/20 to-transparent"
              />

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-wrap gap-3"
              >
                <motion.a
                  href={`tel:${APP_CONFIG.phoneHref}`}
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 px-6 py-3 text-xs font-black uppercase tracking-widest text-white sm:text-sm"
                >
                  <HiPhone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Book Now!
                </motion.a>
                <motion.a
                  href={`mailto:${APP_CONFIG.email}`}
                  whileHover={{ scale: 1.03, backgroundColor: '#d4405f' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#e8527a] px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#e8527a]/30 sm:text-sm"
                >
                  <HiMail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Email Us
                </motion.a>
              </motion.div>

              {/* Social */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.72 }}
                className="mt-8"
              >
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                  Follow Us On :
                </p>
                <div className="flex items-center gap-2">
                  {socials.map(({ icon: Icon, href }, i) => (
                    <motion.a
                      key={i}
                      href={href}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.78 + i * 0.05 }}
                      whileHover={{
                        scale: 1.15,
                        backgroundColor: '#e8527a',
                        borderColor: '#e8527a',
                      }}
                      whileTap={{ scale: 0.9 }}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/8 text-white"
                    >
                      <Icon className="h-3 w-3" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ═══ RIGHT — Stacked cards ═══ */}
            <div className="flex items-center justify-center lg:justify-end">
              {/* Desktop stacked cards */}
              <div className="relative hidden h-[440px] w-[300px] lg:block xl:w-[320px]">
                {destinations.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 60, rotate: 0 }}
                    animate={{
                      opacity: 1,
                      y: i * 40,
                      rotate: card.rotate,
                    }}
                    transition={{
                      duration: 0.7,
                      delay: 0.4 + i * 0.12,
                      ease: EASE,
                    }}
                    whileHover={{
                      y: i * 40 - 10,
                      rotate: 0,
                      scale: 1.02,
                      zIndex: 50,
                      transition: { duration: 0.18, ease: EASE },
                    }}
                    style={{ zIndex: card.zIndex, top: 0 }}
                    className="absolute left-0 right-0 cursor-pointer overflow-hidden rounded-2xl bg-white shadow-2xl"
                  >
                    <div className="relative h-32 w-full overflow-hidden xl:h-36">
                      <img
                        src={card.img}
                        alt={card.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-black text-[#e8527a] shadow-md">
                        {card.price}
                        <span className="text-[9px] font-medium text-gray-500">/nt</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-[#0d3347] xl:text-base">
                          {card.name}
                        </h3>
                        <div className="flex items-center gap-0.5">
                          <HiStar className="h-3 w-3 text-[#e8527a]" />
                          <span className="text-[11px] font-bold text-[#0d3347]">4.9</span>
                        </div>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500 line-clamp-2">
                        {card.desc}
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e8527a]">
                          View Stays
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400">
                          Miami, FL
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mobile — horizontal scroll */}
              <div className="flex w-full gap-3.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
                {destinations.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                    whileHover={{ y: -4, transition: { duration: 0.15 } }}
                    className="min-w-[210px] shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-white shadow-xl"
                  >
                    <div className="relative h-24 w-full overflow-hidden">
                      <img
                        src={card.img}
                        alt={card.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute right-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-black text-[#e8527a]">
                        {card.price}
                        <span className="text-[8px] font-medium text-gray-500">/nt</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-black text-[#0d3347]">
                        {card.name}
                      </h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-gray-500 line-clamp-2">
                        {card.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
