import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiX, HiArrowRight, HiRefresh } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();

  return (
    <>
      <SEOHead title="Payment Failed" noIndex />

      <section className="flex min-h-screen items-center justify-center bg-[#062B3A] px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center max-w-lg"
        >
          {/* Error icon */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <HiX className="w-12 h-12 text-red-500" />
          </div>

          <h1 className="text-3xl font-display font-bold text-white mb-4">
            Payment Failed
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
            Unfortunately, your payment could not be processed. This could be due to insufficient 
            funds, incorrect card details, or a temporary issue with your bank.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <HiRefresh className="w-5 h-5" />
              Try Again
            </button>
            <Link to="/contact" className="btn-outline inline-flex items-center justify-center gap-2">
              Contact Support
              <HiArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="text-[var(--color-text-muted)] text-sm mt-6">
            If the problem persists, please contact our support team or try a different payment method.
          </p>
        </motion.div>
      </section>
    </>
  );
};

export default PaymentFailedPage;
