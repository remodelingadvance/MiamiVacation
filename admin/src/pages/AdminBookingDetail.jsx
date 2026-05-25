import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiPrinter, HiMail, HiPhone } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import StatusBadge from '../components/common/StatusBadge';
import adminApi from '../config/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await adminApi.getBooking(id);
        setBooking(response.data.booking);
      } catch (error) {
        toast.error('Booking not found');
        navigate('/admin/bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    try {
      await adminApi.updateBookingStatus(id, newStatus);
      setBooking(prev => ({ ...prev, status: newStatus }));
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <>
      <SEOHead title={`Booking ${booking.bookingNumber}`} />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/bookings')}
            className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Booking {booking.bookingNumber}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={booking.status} />
              <StatusBadge status={booking.payment?.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Guest info */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Guest Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Name</p>
                  <p className="text-white">{booking.user?.firstName} {booking.user?.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Email</p>
                  <a href={`mailto:${booking.user?.email}`} className="text-[var(--color-primary)] hover:underline">
                    {booking.user?.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Phone</p>
                  <p className="text-white">{booking.user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Total Guests</p>
                  <p className="text-white">{booking.guests?.adults + (booking.guests?.children || 0)}</p>
                </div>
              </div>
            </div>

            {/* Stay details */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Stay Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Check-in</p>
                  <p className="text-white">{formatDate(booking.checkIn)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Check-out</p>
                  <p className="text-white">{formatDate(booking.checkOut)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Nights</p>
                  <p className="text-white">{booking.pricing?.nights}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Property</p>
                  <Link to={`/admin/properties/${booking.property?._id}/edit`} className="text-[var(--color-primary)] hover:underline">
                    {booking.property?.name}
                  </Link>
                </div>
              </div>
            </div>

            {/* Special requests */}
            {booking.specialRequests && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Special Requests</h3>
                <p className="text-[var(--color-text-secondary)]">{booking.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price breakdown */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Nightly Rate x {booking.pricing?.nights}</span>
                  <span>{formatCurrency(booking.pricing?.baseTotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Cleaning Fee</span>
                  <span>{formatCurrency(booking.pricing?.cleaningFee)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Service Fee</span>
                  <span>{formatCurrency(booking.pricing?.serviceFee)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Taxes</span>
                  <span>{formatCurrency(booking.pricing?.taxes)}</span>
                </div>
                {booking.pricing?.discount > 0 && (
                  <div className="flex justify-between text-[var(--color-success)]">
                    <span>Discount</span>
                    <span>-{formatCurrency(booking.pricing?.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>{formatCurrency(booking.pricing?.total)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                <select
                  value={booking.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
                <button className="btn-outline w-full text-sm flex items-center justify-center gap-2">
                  <HiPrinter className="w-4 h-4" />
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminBookingDetail;