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
    <section className="bg-gradient-to-b from-[var(--color-bg-dark)] to-[var(--color-bg-medium)] py-16">
      <div className="container-custom" ref={ref}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg bg-white p-5 text-center shadow-[0_12px_34px_rgba(8,51,68,0.07)] ring-1 ring-black/5"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--color-primary-light)]">
                <stat.icon className="w-7 h-7 text-[var(--color-primary)]" />
              </div>
              <div className="mb-1 text-3xl font-bold text-[var(--color-text-primary)]">
                {inView && (
                  <CountUp
                    end={stat.value}
                    duration={2.5}
                    decimals={stat.decimals || 0}
                    suffix={stat.suffix}
                  />
                )}
              </div>
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
