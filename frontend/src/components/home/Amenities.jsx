import { motion } from 'framer-motion';
import {
  HiWifi,
  HiHome,
  HiShieldCheck,
} from 'react-icons/hi';
import { FaSwimmingPool, FaUmbrellaBeach, FaDumbbell, FaCar, FaUtensils, FaTv, FaSnowflake, FaTshirt } from 'react-icons/fa';

const EASE = [0.21, 0.47, 0.32, 0.98];

const amenities = [
  // Row 1
  {
    icon: HiWifi,
    title: 'High-Speed Wi-Fi',
    description: 'Stay connected with fast and reliable internet.',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: FaSwimmingPool,
    title: 'Swimming Pool',
    description: 'Enjoy a refreshing swim in our beautiful pool.',
    image: 'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: FaUmbrellaBeach,
    title: 'Beach Access',
    description: 'Just steps away from pristine beaches.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: FaDumbbell,
    title: 'Fitness Center',
    description: 'Fully equipped gym to keep up with your routine.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: FaCar,
    title: 'Free Parking',
    description: 'Complimentary parking for a hassle-free stay.',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
  },
  // Row 2
  {
    icon: FaUtensils,
    title: 'Fully Equipped Kitchen',
    description: 'Cook, dine, and feel right at home.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: FaTv,
    title: 'Smart TV',
    description: 'Stream your favorite shows and movies.',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: FaSnowflake,
    title: 'Air Conditioning',
    description: 'Stay cool and comfortable all day long.',
    image: 'https://images.unsplash.com/photo-1631545806609-cda7c4cd25e4?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: FaTshirt,
    title: 'Washer & Dryer',
    description: 'In-unit laundry for your convenience.',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: HiShieldCheck,
    title: '24/7 Security',
    description: 'Your safety and peace of mind are our priority.',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
  },
];

const Amenities = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf6ef] via-white to-[#fdf6ef] py-16 sm:py-20 lg:py-28">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#e8527a]/5 blur-3xl" />
        <div className="absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ═══ HEADER ═══ */}
        <div className="mb-12 text-center sm:mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#e8527a] sm:text-xs"
          >
            Comfort. Convenience. Experience.
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-display, serif)' }}
          >
            <span className="text-[#0d3347]">Premium Amenities for</span>{' '}
            <span
              className="bg-gradient-to-r from-[#e8527a] to-[#ff7a9c] bg-clip-text italic text-transparent"
              style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive" }}
            >
              a Perfect Stay
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-[15px]"
          >
            Thoughtfully curated amenities to make your stay relaxing, enjoyable,
            and unforgettable.
          </motion.p>
        </div>

        {/* ═══ AMENITIES GRID ═══ */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 lg:gap-5">
          {amenities.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.06,
                ease: EASE,
              }}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md shadow-gray-200/40 transition-all duration-300 hover:border-[#e8527a]/30 hover:shadow-2xl hover:shadow-[#e8527a]/15"
            >
              {/* Top content - icon, title, description */}
              <div className="flex flex-1 flex-col items-center px-4 pt-7 text-center sm:px-5 sm:pt-8">
                {/* Icon circle */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fce4ec] text-[#e8527a] sm:mb-5 sm:h-16 sm:w-16"
                >
                  <item.icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.5} />
                </motion.div>

                {/* Title */}
                <h3
                  className="text-sm font-bold text-[#0d3347] transition-colors duration-300 group-hover:text-[#e8527a] sm:text-base lg:text-lg"
                  style={{ fontFamily: 'var(--font-display, serif)' }}
                >
                  {item.title}
                </h3>

                {/* Pink divider line */}
                <div className="my-2.5 h-[1.5px] w-10 rounded-full bg-[#e8527a]/50 transition-all duration-300 group-hover:w-16 group-hover:bg-[#e8527a]" />

                {/* Description */}
                <p className="mb-5 text-xs leading-relaxed text-gray-500 sm:mb-6 sm:text-[13px]">
                  {item.description}
                </p>
              </div>

              {/* Bottom image */}
              <div className="relative h-28 w-full overflow-hidden sm:h-32 lg:h-36">
                <motion.img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  loading="lazy"
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>

              {/* Decorative corner accent on hover */}
              <div className="absolute right-0 top-0 h-12 w-12 -translate-y-6 translate-x-6 rotate-45 rounded-full bg-[#e8527a]/10 transition-transform duration-500 group-hover:scale-150" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Amenities;