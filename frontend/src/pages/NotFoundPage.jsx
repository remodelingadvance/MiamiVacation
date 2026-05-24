import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHome, HiSearch } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';

const NotFoundPage = () => {
  return (
    <>
      <SEOHead title="404 - Page Not Found" />

      <section className="min-h-screen flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          {/* 404 Number */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="mb-8"
          >
            <h1 className="text-[150px] sm:text-[200px] font-display font-bold leading-none text-gradient">
              404
            </h1>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
              Oops! The page you're looking for doesn't exist or has been moved. 
              Let us help you find your way to the perfect Miami vacation rental.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <HiHome className="w-5 h-5" />
                Back to Home
              </Link>
              <Link
                to="/properties"
                className="btn-outline w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <HiSearch className="w-5 h-5" />
                Browse Properties
              </Link>
            </div>
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-accent)]/5 rounded-full blur-3xl" />
          </div>
        </motion.div>
      </section>

      {/* Suggested links */}
      <section className="py-16">
        <div className="container-custom">
          <h3 className="text-xl font-display font-bold text-white text-center mb-8">
            You might be looking for
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Luxury Properties', to: '/properties' },
              { label: 'South Beach Rentals', to: '/properties?search=south+beach' },
              { label: 'Brickell Condos', to: '/properties?search=brickell' },
              { label: 'Oceanfront Villas', to: '/properties?type=villa' },
              { label: 'About Us', to: '/about' },
              { label: 'Contact Support', to: '/contact' },
              { label: 'My Bookings', to: '/my-bookings' },
              { label: 'Sign In', to: '/login' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="glass-light rounded-xl p-4 text-center text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default NotFoundPage;