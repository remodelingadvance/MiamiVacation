import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCalendar,
  HiClipboardList,
  HiDownload,
  HiHome,
  HiLocationMarker,
  HiMail,
  HiUser,
} from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import StatusBadge from '../components/common/StatusBadge';
import adminApi from '../config/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const valueOrDash = (value) => value || 'Not provided';

const formatBookingAddress = (address = {}) => {
  const parts = [
    address.street,
    [address.city, address.state, address.postalCode || address.zipCode].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean);
  return parts.length ? parts.join(' • ') : 'Not provided';
};

const formatPropertyAddress = (location = {}) => {
  const parts = [
    location.address,
    location.neighborhood,
    [location.city, location.state, location.zipCode].filter(Boolean).join(', '),
  ].filter(Boolean);
  return parts.length ? parts.join(' • ') : 'Not provided';
};

const AdminBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await adminApi.getBooking(id);
        setBooking(response.data.booking);
      } catch (error) {
        const message = error.response?.data?.message || 'Booking not found';
        toast.error(message);
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
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      const response = await adminApi.downloadBookingInvoice(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stay-wise-invoice-${booking.bookingNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to download invoice');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!booking) return null;

  const primaryGuest = booking.guestsInfo?.primaryGuest || {};
  const guestName = `${primaryGuest.firstName || booking.user?.firstName || ''} ${primaryGuest.lastName || booking.user?.lastName || ''}`.trim();
  const guestEmail = primaryGuest.email || booking.user?.email;
  const guestPhone = primaryGuest.phone || booking.user?.phone;
  const totalGuests = (booking.guests?.adults || 0) + (booking.guests?.children || 0);

  return (
    <>
      <SEOHead title={`Booking ${booking.bookingNumber}`} />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/bookings')}
              className="glass-light flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-white"
            >
              <HiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Booking Details
              </p>
              <h1 className="text-2xl font-bold text-white">Booking {booking.bookingNumber}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={booking.status} />
                <StatusBadge status={booking.payment?.status} />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={downloadingInvoice}
            className="btn-primary flex items-center justify-center gap-2 px-5 py-3 disabled:opacity-60"
          >
            <HiDownload className="h-5 w-5" />
            {downloadingInvoice ? 'Downloading...' : 'Download PDF Invoice'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <section className="glass rounded-xl p-6">
              <SectionHeader icon={HiUser} title="Primary Guest & Booking Contact" />
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCell label="Guest Name" value={valueOrDash(guestName)} />
                <InfoCell
                  label="Email"
                  value={guestEmail ? (
                    <a href={`mailto:${guestEmail}`} className="text-[var(--color-primary)] hover:underline">
                      {guestEmail}
                    </a>
                  ) : 'Not provided'}
                />
                <InfoCell
                  label="Phone"
                  value={guestPhone ? (
                    <a href={`tel:${guestPhone}`} className="text-white hover:text-[var(--color-primary)]">
                      {guestPhone}
                    </a>
                  ) : 'Not provided'}
                />
                <InfoCell label="Customer Address" value={formatBookingAddress(primaryGuest.address)} />
              </div>
            </section>

            <section className="glass rounded-xl p-6">
              <SectionHeader icon={HiClipboardList} title="Registered Customer Account" />
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCell
                  label="Account Name"
                  value={booking.user?._id ? (
                    <Link to={`/admin/users/${booking.user._id}`} className="text-[var(--color-primary)] hover:underline">
                      {booking.user.firstName} {booking.user.lastName}
                    </Link>
                  ) : 'Not provided'}
                />
                <InfoCell label="Account Email" value={booking.user?.email || 'Not provided'} />
                <InfoCell label="Account Phone" value={booking.user?.phone || 'Not provided'} />
                <InfoCell label="Profile Address" value={formatBookingAddress(booking.user?.address)} />
              </div>
            </section>

            <section className="glass rounded-xl p-6">
              <SectionHeader icon={HiCalendar} title="Stay Details" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoCell label="Check-in" value={formatDate(booking.checkIn)} />
                <InfoCell label="Check-out" value={formatDate(booking.checkOut)} />
                <InfoCell label="Nights" value={`${booking.pricing?.nights || 0} nights`} />
                <InfoCell label="Adults" value={booking.guests?.adults || 0} />
                <InfoCell label="Children" value={booking.guests?.children || 0} />
                <InfoCell label="Infants" value={booking.guests?.infants || 0} />
                <InfoCell label="Total Guests" value={`${totalGuests} guests`} />
                <InfoCell label="Booking Date" value={formatDate(booking.createdAt)} />
                <InfoCell label="Source" value={booking.metadata?.source || 'direct'} />
              </div>
            </section>

            <section className="glass rounded-xl p-6">
              <SectionHeader icon={HiHome} title="Property Information" />
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCell
                  label="Property"
                  value={booking.property?._id ? (
                    <Link to={`/admin/properties/${booking.property._id}/edit`} className="text-[var(--color-primary)] hover:underline">
                      {booking.property.name}
                    </Link>
                  ) : 'Not provided'}
                />
                <InfoCell label="Property Type" value={booking.property?.type || 'Not provided'} />
                <InfoCell label="Property Address" value={formatPropertyAddress(booking.property?.location)} />
                <InfoCell
                  label="Check-in / Check-out Rules"
                  value={`${booking.property?.houseRules?.checkIn || '15:00'} / ${booking.property?.houseRules?.checkOut || '11:00'}`}
                />
              </div>
            </section>

            {booking.pricing?.dailyRates?.length > 0 && (
              <section className="glass rounded-xl p-6">
                <SectionHeader icon={HiLocationMarker} title="Nightly Rate Breakdown" />
                <div className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
                  {booking.pricing.dailyRates.map((day) => (
                    <div key={`${day.date}-${day.price}`} className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 text-sm">
                      <span className="text-white">{formatDate(day.date)}</span>
                      <span className="capitalize text-[var(--color-text-muted)]">{day.source || 'base'}</span>
                      <span className="font-semibold text-white">{formatCurrency(day.price)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {booking.specialRequests && (
              <section className="glass rounded-xl p-6">
                <SectionHeader icon={HiMail} title="Special Requests" />
                <p className="whitespace-pre-wrap text-[var(--color-text-secondary)]">
                  {booking.specialRequests}
                </p>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <section className="glass rounded-xl p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <PriceLine label={`Nightly rates (${booking.pricing?.nights || 0} nights)`} value={booking.pricing?.baseTotal} />
                <PriceLine label="Cleaning Fee" value={booking.pricing?.cleaningFee} />
                <PriceLine label="Service Fee" value={booking.pricing?.serviceFee} />
                <PriceLine label="Taxes" value={booking.pricing?.taxes} />
                {booking.pricing?.discount > 0 && (
                  <div className="flex justify-between text-[var(--color-success)]">
                    <span>Discount</span>
                    <span>-{formatCurrency(booking.pricing.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold text-white">
                  <span>Total</span>
                  <span>{formatCurrency(booking.pricing?.total)}</span>
                </div>
              </div>
            </section>

            <section className="glass rounded-xl p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Payment Details</h3>
              <div className="space-y-3">
                <InfoCell label="Method" value={booking.payment?.method || 'stripe'} compact />
                <InfoCell label="Amount Paid" value={formatCurrency(booking.payment?.amountPaid || 0)} compact />
                <InfoCell label="Paid At" value={booking.payment?.paidAt ? formatDate(booking.payment.paidAt) : 'Not provided'} compact />
                <InfoCell label="Stripe Payment ID" value={booking.payment?.stripePaymentIntentId || 'Not provided'} compact />
              </div>
            </section>

            <section className="glass rounded-xl p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Admin Actions</h3>
              <div className="space-y-3">
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
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  disabled={downloadingInvoice}
                  className="btn-outline flex w-full items-center justify-center gap-2 text-sm disabled:opacity-60"
                >
                  <HiDownload className="h-4 w-4" />
                  {downloadingInvoice ? 'Downloading...' : 'Download Invoice PDF'}
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
};

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="mb-5 flex items-center gap-3">
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
      <Icon className="h-5 w-5" />
    </span>
    <h3 className="text-lg font-bold text-white">{title}</h3>
  </div>
);

const InfoCell = ({ label, value, compact = false }) => (
  <div className={compact ? '' : 'rounded-xl border border-white/10 bg-white/[0.02] p-4'}>
    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
      {label}
    </p>
    <div className="break-words text-sm font-medium text-white">{value}</div>
  </div>
);

const PriceLine = ({ label, value }) => (
  <div className="flex justify-between text-[var(--color-text-secondary)]">
    <span>{label}</span>
    <span>{formatCurrency(value || 0)}</span>
  </div>
);

export default AdminBookingDetail;
