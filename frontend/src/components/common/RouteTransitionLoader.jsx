import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import PageLoader from './PageLoader';

const LOADER_DURATION_MS = 3000;

const routeTitles = {
  '/': 'Opening Miami',
  '/properties': 'Curating homes',
  '/about': 'Setting the scene',
  '/contact': 'Connecting concierge',
  '/login': 'Securing access',
  '/signup': 'Preparing account',
  '/profile': 'Loading profile',
  '/my-bookings': 'Gathering trips',
  '/wishlist': 'Opening wishlist',
};

const getTitleForPath = (pathname) => {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith('/properties/')) return 'Preparing property';
  if (pathname.startsWith('/booking/confirmation/')) return 'Finalizing booking';
  if (pathname.startsWith('/booking/')) return 'Preparing checkout';
  return 'Preparing your stay';
};

const RouteTransitionLoader = () => {
  const location = useLocation();
  const routeKey = location.pathname;
  const [visible, setVisible] = useState(true);
  const [loaderKey, setLoaderKey] = useState(0);
  const timeoutRef = useRef(null);

  const title = useMemo(() => getTitleForPath(location.pathname), [location.pathname]);

  useEffect(() => {
    window.clearTimeout(timeoutRef.current);
    setVisible(true);
    setLoaderKey((current) => current + 1);

    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, LOADER_DURATION_MS);

    return () => window.clearTimeout(timeoutRef.current);
  }, [routeKey]);

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
          key={loaderKey}
          duration={LOADER_DURATION_MS}
          title={title}
          subtitle="Your Stay Wise experience is almost ready."
        />
      )}
    </AnimatePresence>
  );
};

export default RouteTransitionLoader;
