import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiCalendar,
  HiLocationMarker,
  HiClock,
  HiX,
  HiCheck,
  HiSearch,
  HiChevronRight,
} from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import EmptyState from '../components/common/EmptyState';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../config/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const MyBookingsPage = () => {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyBookings();
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason) return;

    try {
      setCancellingId(selectedBooking._id);
      await apiService.cancelBooking(selectedBooking._id, cancelReason);
      
      // Update local state
      setBookings(prev =>
        prev.map(b =>
          b._id === selectedBooking._id
            ? { ...b, status: 'cancelled', cancellation: { reason: cancelReason } }
            : b
        )
      );
      
      toast.success('Booking cancelled successfully');
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancellingId(null);
    }
  };

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', label: 'Pending' },
      confirmed: { class: 'badge-primary', label: 'Confirmed' },
      active: { class: 'badge-success', label: 'Active' },
      completed: { class: 'badge-success', label: 'Completed' },
      cancelled: { class: 'bg-red-500/20 text-red-400', label: 'Cancelled' },
      'no-show': { class: 'bg-red-500/20 text-red-400', label: 'No Show' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`badge ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['confirmed', 'active'].includes(booking.status);
    if (filter === 'past') return ['completed', 'cancelled', 'no-show'].includes(booking.status);
    return true;
  });

  const filters = [
    { key: 'all', label: 'All Bookings' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="pt-24">
        <div className="container-custom py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-[var(--color-text-secondary)] mb-6">Sign in to view your bookings</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="My Bookings" />

      <section className="pt-28 pb-16">
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="section-title text-white text-left">My Bookings</h1>
            <p className="text-[var(--color-text-secondary)]">
              Manage your reservations and booking history
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.key
                    ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
                    : 'glass-light text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Bookings list */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonLoader key={i} type="list" />
                  ))}
                </div>
              </motion.div>
            ) : filteredBookings.length > 0 ? (
              <motion.div
                key="bookings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-2xl overflow-hidden hover:border-[var(--color-primary)]/20 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Property image */}
                      <Link
                        to={`/properties/${booking.property?.slug}`}
                        className="sm:w-64 flex-shrink-0"
                      >
                        <img
                          src={booking.property?.images?.[0]?.url || '/placeholder.jpg'}
                          alt={booking.property?.name}
                          className="w-full h-48 sm:h-full object-cover"
                        />
                      </Link>

                      {/* Booking details */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Link
                              to={`/properties/${booking.property?.slug}`}
                              className="text-xl font-display font-bold text-white hover:text-[var(--color-primary)] transition-colors"
                            >
                              {booking.property?.name}
                            </Link>
                            <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] mt-1">
                              <HiLocationMarker className="w-4 h-4 text-[var(--color-primary)]" />
                              {booking.property?.location?.neighborhood}
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-[var(--color-text-muted)] mb-1">Check-in</p>
                            <p className="text-white font-medium text-sm">
                              {formatDate(booking.checkIn)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--color-text-muted)] mb-1">Check-out</p>
                            <p className="text-white font-medium text-sm">
                              {formatDate(booking.checkOut)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--color-text-muted)] mb-1">Guests</p>
                            <p className="text-white font-medium text-sm">
                              {booking.guests?.adults + booking.guests?.children} guests
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--color-text-muted)] mb-1">Total</p>
                            <p className="text-white font-medium text-sm">
                              {formatCurrency(booking.pricing?.total)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            to={`/booking/confirmation/${booking._id}`}
                            className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors flex items-center gap-1"
                          >
                            View Details
                            <HiChevronRight className="w-4 h-4" />
                          </Link>
                          
                          {['pending', 'confirmed'].includes(booking.status) && (
                            <button
                              onClick={() => openCancelModal(booking)}
                              disabled={cancellingId === booking._id}
                              className="text-sm text-red-400 hover:text-red-500 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {cancellingId === booking._id ? (
                                'Cancelling...'
                              ) : (
                                <>
                                  <HiX className="w-4 h-4" />
                                  Cancel Booking
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState
                  type="booking"
                  title="No bookings found"
                  message={filter === 'all' ? "You haven't made any bookings yet." : `No ${filter} bookings found.`}
                  actionLabel="Browse Properties"
                  actionLink="/properties"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Cancel booking modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowCancelModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass-strong rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-xl font-display font-bold text-white mb-4">
                Cancel Booking
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                Are you sure you want to cancel this booking? This action may be subject to our cancellation policy.
              </p>
              
              <div className="mb-4">
                <label className="input-label">Reason for cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Please tell us why you're cancelling..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 btn-outline"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={!cancelReason || cancellingId}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {cancellingId ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MyBookingsPage;