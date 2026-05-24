import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiCheck,
  HiCalendar,
  HiLocationMarker,
  HiHome,
  HiUsers,
  HiDownload,
  HiMail,
  HiPhone,
} from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import { useBooking } from '../contexts/BookingContext';
import apiService from '../config/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await apiService.getBooking(bookingId);
        setBooking(response.data.booking);
      } catch (error) {
        toast.error('Booking not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="pt-24">
        <div className="container-custom py-12">
          <div className="animate-pulse space-y-4">
            <div className="skeleton h-8 w-64 mx-auto" />
            <div className="skeleton h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="pt-24">
        <div className="container-custom py-20 text-center">
          <h1 className="text-3xl font-display font-bold text-white mb-4">Booking Not Found</h1>
          <Link to="/properties" className="btn-primary">Browse Properties</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Booking Confirmed" />

      <section className="pt-28 pb-16">
        <div className="container-custom max-w-3xl">
          {/* Success header */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center">
              <HiCheck className="w-10 h-10 text-[var(--color-success)]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Your booking has been confirmed. A confirmation email has been sent to your email address.
            </p>
          </motion.div>

          {/* Booking details card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-8 space-y-6"
          >
            {/* Booking number */}
            <div className="text-center pb-6 border-b border-white/10">
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Booking Number</p>
              <p className="text-2xl font-bold text-[var(--color-primary)] font-mono">
                {booking.bookingNumber}
              </p>
            </div>

            {/* Property info */}
            <div className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-white/10">
              {booking.property?.images?.[0] && (
                <img
                  src={booking.property.images[0].url}
                  alt={booking.property.name}
                  className="w-full sm:w-48 h-32 object-cover rounded-xl"
                />
              )}
              <div>
                <h3 className="text-xl font-display font-bold text-white">
                  {booking.property?.name}
                </h3>
                <div className="flex items-center gap-1 text-[var(--color-text-secondary)] mt-1">
                  <HiLocationMarker className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="text-sm">{booking.property?.location?.neighborhood}</span>
                </div>
                <div className="flex items-center gap-1 text-[var(--color-text-secondary)] mt-1">
                  <HiHome className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="text-sm capitalize">{booking.property?.type}</span>
                </div>
              </div>
            </div>

            {/* Stay details */}
            <div className="grid sm:grid-cols-2 gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <HiCalendar className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Check-in</p>
                  <p className="text-white font-medium">{formatDate(booking.checkIn)}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">After {booking.property?.houseRules?.checkIn || '15:00'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HiCalendar className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Check-out</p>
                  <p className="text-white font-medium">{formatDate(booking.checkOut)}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Before {booking.property?.houseRules?.checkOut || '11:00'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HiUsers className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Guests</p>
                  <p className="text-white font-medium">
                    {booking.guests?.adults + booking.guests?.children} guests
                    {booking.guests?.infants > 0 && ` (+ ${booking.guests.infants} infants)`}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Duration</p>
                <p className="text-white font-medium">{booking.pricing?.nights} nights</p>
              </div>
            </div>

            {/* Price summary */}
            <div className="space-y-2 pb-6 border-b border-white/10">
              <h4 className="text-white font-semibold">Payment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>${booking.pricing?.nightlyRate} x {booking.pricing?.nights} nights</span>
                  <span>${booking.pricing?.baseTotal}</span>
                </div>
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Cleaning fee</span>
                  <span>${booking.pricing?.cleaningFee}</span>
                </div>
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Service fee</span>
                  <span>${booking.pricing?.serviceFee}</span>
                </div>
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Taxes</span>
                  <span>${booking.pricing?.taxes}</span>
                </div>
                {booking.pricing?.discount > 0 && (
                  <div className="flex justify-between text-[var(--color-success)]">
                    <span>Discount</span>
                    <span>-${booking.pricing?.discount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between text-white font-semibold">
                  <span>Total Paid</span>
                  <span>${booking.pricing?.total}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/my-bookings" className="btn-primary flex-1 text-center">
                View My Bookings
              </Link>
              <button className="btn-outline flex-1 flex items-center justify-center gap-2">
                <HiDownload className="w-5 h-5" />
                Download Invoice
              </button>
            </div>
          </motion.div>

          {/* Need help */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8 p-6 rounded-2xl glass-light"
          >
            <p className="text-[var(--color-text-secondary)] mb-3">Need help with your booking?</p>
            <div className="flex items-center justify-center gap-6">
              <a href="tel:+13051234567" className="flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors">
                <HiPhone className="w-5 h-5" />
                +1 (305) 123-4567
              </a>
              <a href="mailto:support@miamiluxuryrentals.com" className="flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors">
                <HiMail className="w-5 h-5" />
                Email Support
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default BookingConfirmationPage;