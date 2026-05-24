import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DateRange } from 'react-date-range';
import { format, addDays, differenceInDays } from 'date-fns';
import {
  HiCalendar,
  HiUsers,
  HiStar,
  HiShieldCheck,
  HiTag,
} from 'react-icons/hi';
import { formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const BookingWidget = ({ property }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [dateRange, setDateRange] = useState([
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 4),
      key: 'selection',
    },
  ]);
  const [guests, setGuests] = useState(2);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const nights = dateRange[0].startDate && dateRange[0].endDate
    ? differenceInDays(dateRange[0].endDate, dateRange[0].startDate)
    : 0;

  const basePrice = property?.pricing?.basePrice || 0;
  const cleaningFee = property?.pricing?.cleaningFee || 0;
  const serviceFee = property?.pricing?.serviceFee || 0;
  const taxRate = (property?.pricing?.taxRate || 13.5) / 100;

  const baseTotal = basePrice * nights;
  const subtotal = baseTotal + cleaningFee + serviceFee;
  const taxes = subtotal * taxRate;
  const total = subtotal + taxes;

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }

    navigate(`/booking/${property._id}`, {
      state: {
        checkIn: dateRange[0].startDate,
        checkOut: dateRange[0].endDate,
        guests,
      },
    });
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Price header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">
            {formatCurrency(basePrice)}
          </span>
          <span className="text-[var(--color-text-muted)]">/night</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <HiStar className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-sm text-white">{property?.ratings?.average}</span>
          <span className="text-sm text-[var(--color-text-muted)]">
            · {property?.ratings?.count} reviews
          </span>
        </div>
      </div>

      {/* Booking form */}
      <div className="p-6 space-y-4">
        {/* Dates */}
        <div className="relative">
          <label className="input-label">Check-in - Check-out</label>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full input-field flex items-center gap-2 text-left cursor-pointer"
          >
            <HiCalendar className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
            <span className="text-white">
              {dateRange[0].startDate ? format(dateRange[0].startDate, 'MMM dd') : 'Select'} -{' '}
              {dateRange[0].endDate ? format(dateRange[0].endDate, 'MMM dd, yyyy') : 'Select'}
            </span>
          </button>

          {showDatePicker && (
            <div className="absolute top-full left-0 mt-2 z-50">
              <DateRange
                editableDateInputs={true}
                onChange={(item) => {
                  setDateRange([item.selection]);
                  if (item.selection.endDate && item.selection.startDate) {
                    setShowDatePicker(false);
                  }
                }}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                minDate={new Date()}
                rangeColors={['#C8A97E']}
                className="rounded-xl overflow-hidden shadow-2xl"
              />
            </div>
          )}
        </div>

        {/* Guests */}
        <div>
          <label className="input-label">Guests</label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="input-field cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
        </div>

        {/* Book button */}
        <button
          onClick={handleBookNow}
          className="btn-primary w-full py-4 text-lg"
        >
          Book Now
        </button>

        {/* Price breakdown */}
        {nights > 0 && (
          <div className="space-y-2 pt-4 border-t border-white/10">
            <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
              <span>${basePrice} x {nights} nights</span>
              <span>${baseTotal}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
              <span>Cleaning fee</span>
              <span>${cleaningFee}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
              <span>Service fee</span>
              <span>${serviceFee}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
              <span>Taxes</span>
              <span>${taxes.toFixed(0)}</span>
            </div>
            <div className="flex justify-between font-semibold text-white pt-2 border-t border-white/10">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10 text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-1">
            <HiShieldCheck className="w-4 h-4 text-[var(--color-success)]" />
            Secure
          </div>
          <div className="flex items-center gap-1">
            <HiTag className="w-4 h-4 text-[var(--color-primary)]" />
            Best Price
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingWidget;