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
  HiStar,
  HiPencil,
  HiChat,
  HiPhotograph,
  HiInformationCircle,
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
  
  // Review modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    content: '',
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 5,
    checkIn: 5,
    value: 5,
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

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

  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setReviewData({
      rating: 5,
      title: '',
      content: '',
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      checkIn: 5,
      value: 5,
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewData.title.trim()) {
      toast.error('Please enter a review title');
      return;
    }
    if (!reviewData.content.trim()) {
      toast.error('Please enter your review content');
      return;
    }
    if (reviewData.content.length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await apiService.createReview({
        propertyId: reviewBooking.property._id,
        bookingId: reviewBooking._id,
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        ratings: {
          cleanliness: reviewData.cleanliness,
          accuracy: reviewData.accuracy,
          communication: reviewData.communication,
          location: reviewData.location,
          checkIn: reviewData.checkIn,
          value: reviewData.value,
        }
      });

      if (response.data.success) {
        toast.success('Review submitted successfully!');
        setShowReviewModal(false);
        setReviewBooking(null);
        // Refresh bookings to update review status
        fetchBookings();
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
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

  const hasUserReviewed = (booking) => {
    return booking.review !== null && booking.review !== undefined;
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['confirmed', 'active'].includes(booking.status);
    if (filter === 'past') return ['completed', 'cancelled', 'no-show'].includes(booking.status);
    if (filter === 'pending_review') return booking.status === 'completed' && !hasUserReviewed(booking);
    return true;
  });

  const filters = [
    { key: 'all', label: 'All Bookings' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'pending_review', label: 'Pending Review' },
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
                {f.key === 'pending_review' && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                    {bookings.filter(b => b.status === 'completed' && !hasUserReviewed(b)).length}
                  </span>
                )}
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
                        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
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
                              {booking.guests?.infants > 0 && ` (+ ${booking.guests.infants} infants)`}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--color-text-muted)] mb-1">Total</p>
                            <p className="text-white font-medium text-sm">
                              {formatCurrency(booking.pricing?.total)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
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

                          {/* Review Button - Show for completed bookings that haven't been reviewed */}
                          {booking.status === 'completed' && !hasUserReviewed(booking) && (
                            <button
                              onClick={() => openReviewModal(booking)}
                              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors flex items-center gap-1"
                            >
                              <HiStar className="w-4 h-4" />
                              Write a Review
                            </button>
                          )}

                          {/* Review Badge - Show for reviewed bookings */}
                          {hasUserReviewed(booking) && (
                            <span className="text-sm text-[var(--color-success)] flex items-center gap-1">
                              <HiCheck className="w-4 h-4" />
                              Reviewed
                            </span>
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

      {/* Write Review Modal */}
      <AnimatePresence>
        {showReviewModal && reviewBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/80" onClick={() => setShowReviewModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative glass-strong rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 glass-strong border-b border-white/10 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Write a Review</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {reviewBooking.property?.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="w-8 h-8 rounded-full glass-light flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Overall Rating */}
                <div>
                  <label className="input-label text-white font-semibold mb-2 block">
                    Overall Rating *
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <HiStar
                          className={`w-8 h-8 transition-colors ${
                            star <= (hoverRating || reviewData.rating)
                              ? 'text-[var(--color-primary)] fill-current'
                              : 'text-white/20'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="input-label text-white font-semibold mb-2 block">
                    Review Title *
                  </label>
                  <input
                    type="text"
                    value={reviewData.title}
                    onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                    className="input-field"
                    placeholder="Summarize your experience"
                    maxLength={200}
                  />
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {reviewData.title.length}/200 characters
                  </p>
                </div>

                {/* Review Content */}
                <div>
                  <label className="input-label text-white font-semibold mb-2 block">
                    Your Review *
                  </label>
                  <textarea
                    value={reviewData.content}
                    onChange={(e) => setReviewData({ ...reviewData, content: e.target.value })}
                    className="input-field resize-none"
                    rows={5}
                    placeholder="Share details about your stay..."
                    maxLength={2000}
                  />
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {reviewData.content.length}/2000 characters
                  </p>
                </div>

                {/* Detailed Ratings */}
                <div>
                  <label className="input-label text-white font-semibold mb-3 block">
                    Rate Specific Aspects
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: 'cleanliness', label: 'Cleanliness' },
                      { key: 'accuracy', label: 'Accuracy' },
                      { key: 'communication', label: 'Communication' },
                      { key: 'location', label: 'Location' },
                      { key: 'checkIn', label: 'Check-in' },
                      { key: 'value', label: 'Value for Money' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-[var(--color-text-secondary)] text-sm">{label}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewData({ ...reviewData, [key]: star })}
                              className="focus:outline-none"
                            >
                              <HiStar
                                className={`w-5 h-5 ${
                                  star <= reviewData[key]
                                    ? 'text-[var(--color-primary)] fill-current'
                                    : 'text-white/20'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Note */}
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
                  <HiInformationCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Your review helps other travelers make informed decisions. Please be honest and respectful in your feedback.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {submittingReview ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <HiStar className="w-4 h-4" />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MyBookingsPage;