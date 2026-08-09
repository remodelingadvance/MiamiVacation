import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCheck, HiDownload, HiArrowRight } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import { useBooking } from '../contexts/BookingContext';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { currentBooking } = useBooking();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (currentBooking) {
      setBooking(currentBooking);
    }
  }, [searchParams, currentBooking]);

  return (
    <>
      <SEOHead title="Payment Successful" noIndex />

      <section className="flex min-h-screen items-center justify-center bg-[#062B3A] px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center max-w-lg"
        >
          {/* Success icon */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center">
            <HiCheck className="w-12 h-12 text-[var(--color-success)]" />
          </div>

          <h1 className="text-3xl font-display font-bold text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
            Thank you for your booking. Your payment has been processed successfully.
            A confirmation email will be sent to your email address shortly.
          </p>

          {booking && (
            <div className="glass rounded-xl p-6 mb-8 text-left">
              <p className="text-sm text-[var(--color-text-muted)]">Booking Number</p>
              <p className="text-xl font-bold text-[var(--color-primary)] font-mono">
                {booking.bookingNumber}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {booking && (
              <Link
                to={`/booking/confirmation/${booking._id}`}
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                View Booking
                <HiArrowRight className="w-5 h-5" />
              </Link>
            )}
            <Link to="/properties" className="btn-outline inline-flex items-center justify-center gap-2">
              Browse More Properties
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default PaymentSuccessPage;
