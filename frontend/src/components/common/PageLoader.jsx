import { motion } from 'framer-motion';
import StayWiseLogo from '../../assets/stay-wise-logo-light.png';

const PageLoader = ({
  title = 'Stay Wise Miami',
  subtitle = 'Preparing your Miami stay.',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#061f2d]"
      role="status"
      aria-label="Loading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(232,82,122,0.24),transparent_34%),radial-gradient(circle_at_82%_24%,rgba(45,212,191,0.18),transparent_30%),linear-gradient(135deg,#061f2d_0%,#082f49_48%,#101827_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />

      <div className="relative flex flex-col items-center px-6 text-center">
        <motion.img
          src={StayWiseLogo}
          alt="Stay Wise Miami"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          decoding="async"
          className="mb-5 h-16 w-auto max-w-[220px] object-contain drop-shadow-2xl sm:h-20"
        />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          className="mb-6 h-14 w-14 rounded-full border-2 border-white/15 border-t-[#e8527a] sm:h-16 sm:w-16"
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-sm font-black uppercase tracking-[0.34em] text-white"
        >
          {title}
        </motion.p>
        <p className="mt-3 max-w-xs text-sm font-medium text-white/70">
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
};

export default PageLoader;
