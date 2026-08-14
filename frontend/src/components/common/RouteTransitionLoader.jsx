import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PageLoader from './PageLoader';

const LOADER_DURATION_MS = 500;

const RouteTransitionLoader = () => {
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, LOADER_DURATION_MS);

    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <PageLoader
          title="Stay Wise Miami"
          subtitle="Loading your Miami escape."
        />
      )}
    </AnimatePresence>
  );
};

export default RouteTransitionLoader;
