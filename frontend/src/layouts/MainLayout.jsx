import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BackToTop from '../components/common/BackToTop';
import CookieConsent from '../components/common/CookieConsent';

const SupportChatWidget = lazy(() => import('../components/support/SupportChatWidget'));

const OutletFallback = () => (
  <div className="min-h-[45vh] bg-white" aria-hidden="true" />
);

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

const MainLayout = () => {
  const [showSupportChat, setShowSupportChat] = useState(false);

  useEffect(() => {
    let timeoutId;
    let idleId;

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => setShowSupportChat(true), { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(() => setShowSupportChat(true), 1200);
    }

    return () => {
      if (idleId) window.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--color-bg-dark)' }}>
      <Navbar />
      
      <main className="flex-grow">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Suspense fallback={<OutletFallback />}>
              <Outlet />
            </Suspense>
          </motion.div>
      </main>

      <Footer />
      <BackToTop />
      <CookieConsent />
      {showSupportChat && (
        <Suspense fallback={null}>
          <SupportChatWidget />
        </Suspense>
      )}
    </div>
  );
};

export default MainLayout;
