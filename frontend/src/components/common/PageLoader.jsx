import { motion } from 'framer-motion';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[var(--color-bg-dark)] flex items-center justify-center">
      <div className="text-center">
        {/* Logo animation */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center"
        >
          <span className="text-4xl font-bold text-[var(--color-bg-dark)]">M</span>
        </motion.div>

        {/* Loading text */}
        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xl font-display font-bold text-white mb-2"
        >
          Miami Luxury Rentals
        </motion.h2>

        {/* Progress bar */}
        <div className="w-48 h-1 mx-auto bg-white/10 rounded-full overflow-hidden">
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
          />
        </div>

        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Loading luxury experience...
        </p>
      </div>
    </div>
  );
};

export default PageLoader;