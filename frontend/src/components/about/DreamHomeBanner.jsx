import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const DreamHomeHero = () => {
  return (
    <section className="relative min-h-[520px] overflow-hidden bg-[var(--color-bg-light)]">
      <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-[var(--color-primary-light)] opacity-80" />
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-tr-full bg-[var(--color-primary-light)] opacity-60" />

      <div className="mx-auto grid min-h-[520px] max-w-[1400px] grid-cols-1 items-center px-5 py-12 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-0">
        <motion.div
          initial={{ opacity: 0, x: -45 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-20 max-w-xl text-center lg:text-left"
        >
          <h1 className="font-hero text-[52px] font-black uppercase leading-[0.92] tracking-tight text-[var(--color-text-dark)] sm:text-[72px] md:text-[86px] lg:text-[78px] xl:text-[92px]">
            Find Your
            <br />
            <span className="text-[var(--color-primary)]">Dream Home</span>
            <br />
            Today
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm font-medium leading-6 tracking-[0.12em] text-[var(--color-text-muted)] sm:text-base lg:mx-0">
            Discover premium stays designed with comfort, style, and location in mind.
            Find the perfect home for your next trip.
          </p>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/properties"
              className="mt-7 inline-flex rounded-full bg-[var(--color-primary)] px-9 py-3 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_14px_30px_rgba(255,79,123,0.35)] transition hover:bg-[var(--color-primary-dark)]"
            >
              More Info
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 55, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mt-12 h-[330px] sm:h-[420px] lg:mt-0 lg:h-[520px]"
        >
          <div className="absolute -right-40 top-3/4 h-[430px] w-[430px] -translate-y-1/2 overflow-hidden rounded-full sm:-right-42 sm:h-[560px] sm:w-[560px] lg:-right-40 lg:h-[680px] lg:w-[680px] xl:-right-28">
            <img
              src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=80"
              alt="Dream home"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-[var(--color-primary)]/18" />

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-16 left-16 h-44 w-80 rounded-[100%] bg-[var(--color-primary)]/45 blur-sm"
            />
          </div>

          <motion.div
            animate={{ rotate: [0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-10 top-20 hidden h-20 w-20 rounded-full border-[18px] border-[var(--color-primary)]/25 lg:block"
          />

          <div className="absolute bottom-6 right-4 rounded-full bg-white/90 px-5 py-3 text-sm font-black text-[var(--color-text-dark)] shadow-xl backdrop-blur sm:right-16">
            Premium Stays
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DreamHomeHero;