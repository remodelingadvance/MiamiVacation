import { motion } from 'framer-motion';
import { 
  HiStar, 
  HiUserGroup, 
  HiHome, 
  HiLocationMarker 
} from 'react-icons/hi';
import { 
  FaAward, 
  FaConciergeBell, 
  FaMapMarkerAlt, 
  FaShieldAlt, 
  FaGem, 
  FaUserCog 
} from 'react-icons/fa';
import WCUImg from '../../assets/whu-img.png';

const EASE = [0.22, 1, 0.36, 1];

const reasons = [
  {
    icon: FaAward,
    title: 'Handpicked\nLuxury Stays',
    description: 'Every property is carefully selected for quality, comfort, and style.',
  },
  {
    icon: FaConciergeBell,
    title: 'Local Concierge\nSupport',
    description: 'Our Miami-based team is available 24/7 to assist with anything you need.',
  },
  {
    icon: FaMapMarkerAlt,
    title: 'Prime Miami\nLocations',
    description: 'Stay in the heart of South Beach, Brickell, Coconut Grove, and beyond.',
  },
  {
    icon: FaShieldAlt,
    title: 'Safe & Secure\nBooking',
    description: 'Book with confidence through our secure platform and clear policies.',
  },
  {
    icon: FaGem,
    title: 'Premium\nAmenities',
    description: 'Enjoy top-tier amenities designed to make your stay truly unforgettable.',
  },
  {
    icon: FaUserCog,
    title: 'Personalized\nExperiences',
    description: 'We tailor every stay to match your needs and exceed your expectations.',
  },
];

const stats = [
  { icon: HiUserGroup, value: '2,000+', label: 'Happy Guests' },
  { icon: HiHome, value: '150+', label: 'Premium Properties' },
  { icon: HiLocationMarker, value: '15+', label: 'Top Miami Locations' },
  { icon: HiStar, value: '4.9/5', label: 'Guest Satisfaction' },
];

const WhyChooseUs = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf6ef] via-white to-[#fdf6ef] py-14 sm:py-20 lg:py-28">
      {/* ═══ Decorative palm leaf - top right ═══ */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 0.5, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="pointer-events-none absolute right-0 top-0 hidden lg:block"
      >
        <svg width="220" height="380" viewBox="0 0 220 380" fill="none">
          <g stroke="#e8527a" strokeWidth="1.5" fill="none" opacity="0.7">
            <path d="M 220 0 Q 200 80 180 180 Q 170 250 160 380" />
            <path d="M 195 20 Q 170 60 145 100" />
            <path d="M 185 50 Q 160 90 130 130" />
            <path d="M 175 90 Q 145 130 110 165" />
            <path d="M 170 130 Q 135 165 95 195" />
            <path d="M 165 175 Q 125 205 80 230" />
            <path d="M 162 220 Q 115 245 65 265" />
            <path d="M 200 35 Q 175 75 150 115" />
            <path d="M 190 70 Q 165 110 135 150" />
            <path d="M 180 110 Q 150 150 115 185" />
            <path d="M 175 150 Q 140 185 100 215" />
            <path d="M 170 195 Q 130 225 85 250" />
            <path d="M 165 240 Q 120 265 70 285" />
          </g>
        </svg>
      </motion.div>

      {/* Decorative small leaves - bottom left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.4, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="pointer-events-none absolute -left-8 bottom-20 hidden lg:block"
      >
        <svg width="120" height="200" viewBox="0 0 120 200" fill="none">
          <g stroke="#e8527a" strokeWidth="1.5" fill="none">
            <path d="M 0 200 Q 20 140 40 60 Q 50 20 60 0" />
            <path d="M 15 175 Q 35 145 55 115" />
            <path d="M 25 140 Q 45 110 65 80" />
            <path d="M 35 100 Q 55 70 75 40" />
            <path d="M 10 185 Q 30 155 50 125" />
            <path d="M 20 150 Q 40 120 60 90" />
            <path d="M 30 110 Q 50 80 70 50" />
          </g>
        </svg>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ═══ HEADER ═══ */}
        <div className="mb-10 text-center sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <span
              className="text-3xl font-normal text-[#e8527a] sm:text-4xl lg:text-5xl"
              style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive" }}
            >
              Why Choose Us
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mt-2 text-3xl font-black leading-tight text-[#0d3347] sm:text-4xl lg:text-5xl xl:text-6xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Your Perfect Stay, Our Promise
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-[15px]"
          >
            At StayWise, we go beyond booking – we craft unforgettable experiences
            with comfort, care, and a touch of Miami luxury.
          </motion.p>
        </div>

        {/* ═══ MAIN CONTENT - Image + Cards Grid ═══ */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">

          {/* ═══ LEFT - Image with review badge ═══ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="group relative h-[500px] w-full overflow-hidden rounded-3xl shadow-2xl sm:h-[560px] lg:h-[640px]"
          >
            <motion.img
              src={WCUImg}
              alt="Luxury Miami pool with sunset view"
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.8, ease: EASE }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Quote icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -45 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5, ease: 'backOut' }}
              className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8527a] text-white shadow-xl"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M9 7H5a2 2 0 00-2 2v4a2 2 0 002 2h2v3l3-3a2 2 0 002-2V9a2 2 0 00-2-2zm10 0h-4a2 2 0 00-2 2v4a2 2 0 002 2h2v3l3-3a2 2 0 002-2V9a2 2 0 00-2-2z" />
              </svg>
            </motion.div>
          </motion.div>

          {/* ═══ RIGHT - 6 Feature Cards Grid ═══ */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {reasons.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + i * 0.08,
                  ease: EASE,
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group/reason relative flex flex-col items-center overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-md shadow-gray-200/40 transition-all duration-300 hover:border-[#e8527a]/30 hover:shadow-xl hover:shadow-[#e8527a]/10 sm:p-6"
              >
                {/* Icon circle */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#fce4ec] text-[#e8527a] sm:mb-4 sm:h-14 sm:w-14"
                >
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </motion.div>

                {/* Title */}
                <h3
                  className="text-sm font-bold leading-tight text-[#0d3347] transition-colors duration-300 group-hover/reason:text-[#e8527a] sm:text-base"
                  style={{ fontFamily: 'var(--font-display, serif)' }}
                >
                  {item.title.split('\n').map((line, idx) => (
                    <span key={idx} className="block">
                      {line}
                    </span>
                  ))}
                </h3>

                {/* Pink divider */}
                <div className="my-2.5 h-[1.5px] w-8 rounded-full bg-[#e8527a] transition-all duration-300 group-hover/reason:w-12" />

                {/* Description */}
                <p className="text-xs leading-relaxed text-gray-500 sm:text-[13px]">
                  {item.description}
                </p>

                {/* Hover gradient overlay */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/reason:opacity-100"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(252, 228, 236, 0.4), transparent 70%)',
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ═══ BOTTOM STATS BAR ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-md shadow-gray-200/40 sm:mt-8 sm:grid-cols-4 sm:gap-0 sm:p-5"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
              className={`group/stat flex items-center justify-center gap-3 px-2 py-2 transition-all duration-300 hover:bg-[#fce4ec]/30 sm:gap-4 ${
                i !== 0 ? 'sm:border-l sm:border-gray-100' : ''
              } ${i !== stats.length - 1 ? 'sm:border-r-0' : ''}`}
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fce4ec] text-[#e8527a] sm:h-12 sm:w-12"
              >
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.div>
              <div className="text-left">
                <p
                  className="text-lg font-black leading-none text-[#0d3347] sm:text-xl lg:text-2xl"
                  style={{ fontFamily: 'var(--font-display, serif)' }}
                >
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 sm:text-[11px]">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;