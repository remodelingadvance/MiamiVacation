import { motion } from 'framer-motion';

const PageLoader = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center"
        >
          <span className="text-xl font-bold text-[var(--color-bg-dark)]">M</span>
        </motion.div>
        <p className="text-[var(--color-text-muted)] text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default PageLoader;