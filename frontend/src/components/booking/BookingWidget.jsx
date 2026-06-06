import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiArrowRight,
  HiCalendar,
  HiShieldCheck,
  HiStar,
  HiTag,
  HiUsers,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/helpers';

const BookingWidget = ({ property }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const basePrice = property?.pricing?.basePrice || 0;
  const maxGuests = property?.details?.maxGuests || 8;
  const image = property?.images?.find((img) => img.isPrimary)?.url || property?.images?.[0]?.url;

  const handleStartBooking = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }

    navigate(`/booking/${property._id}`);
  };

  return (
    <motion.aside
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="overflow-hidden rounded-lg bg-white shadow-[0_24px_70px_rgba(8,51,68,0.14)] ring-1 ring-black/5"
    >
      {image && (
        <div className="relative h-40 overflow-hidden">
          <img src={image} alt={property?.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,20,76,0.82)] to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs font-black uppercase text-white/72">Miami luxury stay</p>
            <h3 className="line-clamp-1 text-lg font-black text-white">{property?.name}</h3>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-[var(--color-primary)]">
              From
            </p>
            <p className="mt-1 text-4xl font-black text-[var(--color-text-primary)]">
              {formatCurrency(basePrice)}
              <span className="text-sm font-semibold text-[var(--color-text-muted)]"> / night</span>
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-[var(--color-primary-light)] px-3 py-1.5 text-sm font-black text-[var(--color-text-primary)]">
            <HiStar className="h-4 w-4 text-[var(--color-primary)]" />
            {property?.ratings?.average || 0}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-bold text-[var(--color-text-secondary)]">
          <div className="rounded-xl border border-[var(--color-border)] p-3">
            <HiUsers className="mb-2 h-5 w-5 text-[var(--color-primary)]" />
            Up to {maxGuests} guests
          </div>
          <div className="rounded-xl border border-[var(--color-border)] p-3">
            <HiCalendar className="mb-2 h-5 w-5 text-[var(--color-secondary)]" />
            Pick dates next
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartBooking}
          className="btn-primary mt-5 flex w-full items-center justify-center gap-2 py-4 text-base font-black"
        >
          Start Booking
          <HiArrowRight className="h-5 w-5" />
        </button>

        <div className="mt-5 grid gap-3 text-xs font-bold text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-bg-medium)] px-3 py-3">
            <HiShieldCheck className="h-4 w-4 text-[var(--color-accent)]" />
            Secure booking and verified Miami home
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-bg-medium)] px-3 py-3">
            <HiTag className="h-4 w-4 text-[var(--color-primary)]" />
            Transparent pricing with concierge support
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default BookingWidget;
