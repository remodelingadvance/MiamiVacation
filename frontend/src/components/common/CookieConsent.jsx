import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="glass-strong rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 shadow-2xl">
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">We use cookies 🍪</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  We use cookies to enhance your browsing experience, serve personalized content, 
                  and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                  Read our{' '}
                  <Link to="/privacy-policy" className="text-[var(--color-primary)] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={declineCookies}
                  className="px-6 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-sm"
                >
                  Decline
                </button>
                <button
                  onClick={acceptCookies}
                  className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-bg-dark)] font-semibold hover:bg-[var(--color-primary-light)] transition-all text-sm"
                >
                  Accept All
                </button>
              </div>
              <button
                onClick={declineCookies}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;