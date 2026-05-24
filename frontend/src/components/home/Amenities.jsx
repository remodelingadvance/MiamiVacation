import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiWifi,
  HiDesktopComputer,
  HiViewGrid,
  HiSparkles,
  HiKey,
  HiShieldCheck,
  HiSupport,
  HiCreditCard,
  HiPhotograph,
} from 'react-icons/hi';
import { FaSwimmingPool, FaUmbrellaBeach, FaConciergeBell, FaParking } from 'react-icons/fa';
import { MdBalcony, MdFitnessCenter, MdLocalLaundryService } from 'react-icons/md';

const amenities = [
  {
    icon: FaSwimmingPool,
    title: 'Infinity Pools',
    description: 'Stunning rooftop and private pools with ocean views',
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: FaUmbrellaBeach,
    title: 'Beach Access',
    description: 'Direct access to Miami\'s pristine beaches',
    color: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    icon: HiWifi,
    title: 'High-Speed WiFi',
    description: 'Complimentary high-speed internet throughout',
    color: 'from-green-500/20 to-emerald-500/20',
  },
  {
    icon: MdFitnessCenter,
    title: 'Fitness Centers',
    description: 'State-of-the-art gym facilities available 24/7',
    color: 'from-red-500/20 to-pink-500/20',
  },
  {
    icon: FaConciergeBell,
    title: 'Concierge Service',
    description: 'Personal concierge to assist with all your needs',
    color: 'from-purple-500/20 to-violet-500/20',
  },
  {
    icon: FaParking,
    title: 'Free Parking',
    description: 'Complimentary secure parking with every booking',
    color: 'from-indigo-500/20 to-blue-500/20',
  },
  {
    icon: MdBalcony,
    title: 'Private Balconies',
    description: 'Enjoy breathtaking views from your private terrace',
    color: 'from-teal-500/20 to-green-500/20',
  },
  {
    icon: HiShieldCheck,
    title: '24/7 Security',
    description: 'Round-the-clock security for your peace of mind',
    color: 'from-gray-500/20 to-slate-500/20',
  },
];

const Amenities = () => {
  return (
    <section className="py-20">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-white">
            Premium Amenities
          </h2>
          <p className="section-subtitle mx-auto">
            Experience the finest amenities Miami has to offer in our luxury properties
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {amenities.map((amenity, index) => (
            <motion.div
              key={amenity.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${amenity.color} p-6 glass border border-white/5 hover:border-[var(--color-primary)]/30 transition-all`}
            >
              <div className="relative z-10">
                <amenity.icon className="w-10 h-10 text-[var(--color-primary)] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-display font-bold text-lg mb-2">{amenity.title}</h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{amenity.description}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/properties" className="btn-outline inline-flex items-center gap-2">
            <HiViewGrid className="w-5 h-5" />
            View All Amenities
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Amenities;