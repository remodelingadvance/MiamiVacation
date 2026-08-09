import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiCalendar,
  HiCheck,
  HiDownload,
  HiHome,
  HiLocationMarker,
  HiMail,
  HiPhone,
  HiShieldCheck,
  HiUsers,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import SEOHead from '../components/common/SEOHead';
import apiService from '../config/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { THEME } from '../config/theme.config';
import { getPropertyImageAlt } from '../utils/propertyImageAlt';
import { APP_CONFIG } from '../config/constants';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await apiService.getBooking(bookingId);
        setBooking(response.data.booking);
      } catch (error) {
        console.error('Booking lookup failed:', error);
        toast.error('Booking not found');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="bg-[var(--color-bg-medium)] pt-28">
        <div className="container-custom py-12">
          <div className="mx-auto max-w-4xl animate-pulse space-y-6">
            <div className="skeleton mx-auto h-20 w-20 rounded-full" />
            <div className="skeleton mx-auto h-10 w-80" />
            <div className="skeleton h-96 rounded-[26px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-[var(--color-bg-medium)] pt-28">
        <div className="container-custom py-24 text-center">
          <h1 className="text-4xl font-black text-[var(--color-text-primary)]">
            Booking Not Found
          </h1>
          <Link to="/properties" className="btn-primary mt-8">
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  const property = booking.property;
  const primaryImage = property?.images?.find((img) => img.isPrimary) || property?.images?.[0] || {};
  const image = primaryImage.url || THEME.hero.heroImage;
  const imageAlt = getPropertyImageAlt(property, primaryImage, 0);
  const guests = (booking.guests?.adults || 0) + (booking.guests?.children || 0);

  const handleDownloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      const response = await apiService.downloadBookingInvoice(booking._id);
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
      toast.error(error.response?.data?.message || 'Failed to download invoice');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <>
      <SEOHead title="Booking Confirmed" noIndex />

      <section className="relative isolate overflow-hidden bg-[var(--color-text-primary)] pt-28 text-white lg:pt-36">
        <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,20,76,0.94),rgba(7,20,76,0.72)_52%,rgba(7,20,76,0.34))]" />
        <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-[var(--color-primary)]/30 blur-3xl" />

        <div className="container-custom relative z-10 pb-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-[var(--color-accent)] shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
              <HiCheck className="h-12 w-12" />
            </div>
            <p className="text-sm font-black uppercase text-[var(--color-primary)]">
              Booking confirmed
            </p>
            <h1 className="mt-3 font-hero text-5xl font-black uppercase leading-[0.95] sm:text-6xl lg:text-7xl">
              Miami is waiting
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-white/80">
              Your Miami stay is confirmed. We sent the details to your email.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="bg-[var(--color-bg-medium)] py-10 lg:py-14">
        <div className="container-custom">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-[26px] bg-white shadow-[0_24px_70px_rgba(8,19,76,0.12)] ring-1 ring-black/5"
            >
              <div className="border-b border-[var(--color-border)] p-6 text-center">
                <p className="text-xs font-black uppercase text-[var(--color-text-muted)]">
                  Booking Number
                </p>
                <p className="mt-2 font-mono text-2xl font-black text-[var(--color-primary)]">
                  {booking.bookingNumber}
                </p>
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-5 sm:flex-row">
                  <img
                    src={image}
                    alt={imageAlt}
                    className="h-48 w-full rounded-2xl object-cover sm:h-36 sm:w-56"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-[var(--color-text-primary)]">
                      {property?.name}
                    </h2>
                    <div className="mt-3 space-y-2 text-sm font-semibold text-[var(--color-text-secondary)]">
                      <p className="flex items-center gap-2">
                        <HiLocationMarker className="h-4 w-4 text-[var(--color-primary)]" />
                        {property?.location?.neighborhood}, {property?.location?.city}
                      </p>
                      <p className="flex items-center gap-2 capitalize">
                        <HiHome className="h-4 w-4 text-[var(--color-secondary)]" />
                        {property?.type}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <InfoTile
                    icon={HiCalendar}
                    label="Check-in"
                    value={formatDate(booking.checkIn)}
                    helper={`After ${property?.houseRules?.checkIn || '15:00'}`}
                  />
                  <InfoTile
                    icon={HiCalendar}
                    label="Check-out"
                    value={formatDate(booking.checkOut)}
                    helper={`Before ${property?.houseRules?.checkOut || '11:00'}`}
                  />
                  <InfoTile
                    icon={HiUsers}
                    label="Guests"
                    value={`${guests} guests${booking.guests?.infants > 0 ? ` (+ ${booking.guests.infants} infants)` : ''}`}
                  />
                  <InfoTile
                    icon={HiShieldCheck}
                    label="Duration"
                    value={`${booking.pricing?.nights || 0} nights`}
                  />
                </div>

                <div className="mt-8 rounded-2xl bg-[var(--color-bg-medium)] p-5">
                  <h3 className="mb-4 text-xl font-black text-[var(--color-text-primary)]">
                    Payment Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <PriceRow
                      label={`${formatCurrency(booking.pricing?.nightlyRate || 0)} x ${booking.pricing?.nights || 0} nights`}
                      value={booking.pricing?.baseTotal}
                    />
                    <PriceRow label="Cleaning fee" value={booking.pricing?.cleaningFee} />
                    <PriceRow label="Service fee" value={booking.pricing?.serviceFee} />
                    <PriceRow label="Taxes" value={booking.pricing?.taxes} />
                    {booking.pricing?.discount > 0 && (
                      <div className="flex justify-between font-bold text-[var(--color-accent)]">
                        <span>Discount</span>
                        <span>-{formatCurrency(booking.pricing.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-lg font-black text-[var(--color-text-primary)]">
                      <span>Total Paid</span>
                      <span>{formatCurrency(booking.pricing?.total || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/my-bookings" className="btn-primary flex-1 text-center">
                    View My Bookings
                  </Link>
                  <button
                    type="button"
                    onClick={handleDownloadInvoice}
                    disabled={downloadingInvoice}
                    className="btn-outline flex flex-1 items-center justify-center gap-2"
                  >
                    <HiDownload className="h-5 w-5" />
                    {downloadingInvoice ? 'Downloading...' : 'Download Invoice'}
                  </button>
                </div>
              </div>
            </motion.section>

            <motion.aside
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-5"
            >
              <div className="rounded-[26px] bg-white p-6 shadow-[0_18px_48px_rgba(8,19,76,0.08)] ring-1 ring-black/5">
                <p className="text-xs font-black uppercase text-[var(--color-primary)]">
                  Next steps
                </p>
                <div className="mt-4 space-y-4">
                  {[
                    'Save your booking number for arrival.',
                    'Watch your inbox for check-in instructions.',
                    'Contact concierge for transport, dining, or beach plans.',
                  ].map((item) => (
                    <div key={item} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ECFDF3] text-[var(--color-accent)]">
                        <HiCheck className="h-4 w-4" />
                      </span>
                      <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[26px] bg-white p-6 shadow-[0_18px_48px_rgba(8,19,76,0.08)] ring-1 ring-black/5">
                <p className="text-xs font-black uppercase text-[var(--color-primary)]">
                  Need help?
                </p>
                <h3 className="mt-1 text-xl font-black text-[var(--color-text-primary)]">
                  Miami concierge support
                </h3>
                <div className="mt-4 space-y-3 text-sm font-bold text-[var(--color-text-secondary)]">
                  <a href={`tel:${APP_CONFIG.phoneHref}`} className="flex items-center gap-2 hover:text-[var(--color-primary)]">
                    <HiPhone className="h-4 w-4 text-[var(--color-primary)]" />
                    {APP_CONFIG.phone}
                  </a>
                  <a href={`mailto:${APP_CONFIG.email}`} className="flex items-center gap-2 hover:text-[var(--color-primary)]">
                    <HiMail className="h-4 w-4 text-[var(--color-primary)]" />
                    Email Support
                  </a>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </main>
    </>
  );
};

const InfoTile = ({ icon: Icon, label, value, helper }) => (
  <div className="rounded-2xl border border-[var(--color-border)] p-4">
    <Icon className="mb-3 h-6 w-6 text-[var(--color-primary)]" />
    <p className="text-xs font-black uppercase text-[var(--color-text-muted)]">{label}</p>
    <p className="mt-1 font-black text-[var(--color-text-primary)]">{value}</p>
    {helper && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{helper}</p>}
  </div>
);

const PriceRow = ({ label, value }) => (
  <div className="flex justify-between text-[var(--color-text-secondary)]">
    <span>{label}</span>
    <span>{formatCurrency(value || 0)}</span>
  </div>
);

export default BookingConfirmationPage;
