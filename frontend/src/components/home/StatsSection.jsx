import { motion } from 'framer-motion';
import { HiHome, HiUsers, HiStar, HiGlobe, HiShieldCheck } from 'react-icons/hi';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const stats = [
  { icon: HiHome, value: 500, suffix: '+', label: 'Luxury Properties' },
  { icon: HiUsers, value: 10000, suffix: '+', label: 'Happy Guests' },
  { icon: HiStar, value: 4.9, suffix: '', label: 'Average Rating', decimals: 1 },
  { icon: HiGlobe, value: 15, suffix: '+', label: 'Miami Neighborhoods' },
  { icon: HiShieldCheck, value: 100, suffix: '%', label: 'Secure Booking' },
];

const StatsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section className="py-16 bg-gradient-to-b from-[var(--color-bg-dark)] to-[var(--color-bg-medium)]">
      <div className="container-custom" ref={ref}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl glass-light flex items-center justify-center">
                <stat.icon className="w-7 h-7 text-[var(--color-primary)]" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {inView && (
                  <CountUp
                    end={stat.value}
                    duration={2.5}
                    decimals={stat.decimals || 0}
                    suffix={stat.suffix}
                  />
                )}
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;