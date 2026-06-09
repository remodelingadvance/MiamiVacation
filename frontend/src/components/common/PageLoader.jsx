import { motion } from 'framer-motion';
import VideoSrc from '../../assets/screen-loader.mp4';

const PageLoader = ({
  src = VideoSrc,
  poster,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black"
      role="status"
      aria-label="Loading"
    >
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
      />
    </motion.div>
  );
};

export default PageLoader;