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
  HiUser,
  HiMail,
  HiPhone,
  HiChat,
} from 'react-icons/hi';
import { formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const BookingWidget = ({ property }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [dateRange, setDateRange] = useState([
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 4),
      key: 'selection',
    },
  ]);
  const [guests, setGuests] = useState(2);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestDetails, setGuestDetails] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
  });

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

  const handleContinueBooking = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }
    
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email) {
      toast.error('Please fill in your contact details');
      return;
    }
    
    if (!guestDetails.email.includes('@') || !guestDetails.email.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    navigate(`/booking/${property._id}`, {
      state: {
        checkIn: dateRange[0].startDate,
        checkOut: dateRange[0].endDate,
        guests: { adults: guests, children: 0, infants: 0 },
        guestDetails,
      },
    });
  };

  return (
    <div className="glass rounded-2xl overflow-hidden sticky top-24">
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
          <span className="text-sm text-white">{property?.ratings?.average || 0}</span>
          <span className="text-sm text-[var(--color-text-muted)]">
            · {property?.ratings?.count || 0} reviews
          </span>
        </div>
      </div>

      {/* Booking form */}
      <div className="p-6 space-y-5">
        {/* Dates */}
        <div className="relative">
          <label className="input-label flex items-center gap-2">
            <HiCalendar className="w-4 h-4" />
            Check-in / Check-out
          </label>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full input-field flex items-center justify-between text-left cursor-pointer mt-1"
          >
            <span className="text-white">
              {dateRange[0].startDate ? format(dateRange[0].startDate, 'MMM dd, yyyy') : 'Select'} 
              {' - '}
              {dateRange[0].endDate ? format(dateRange[0].endDate, 'MMM dd, yyyy') : 'Select'}
            </span>
            <HiCalendar className="w-5 h-5 text-[var(--color-primary)]" />
          </button>

          {showDatePicker && (
            <div className="absolute top-full left-0 mt-2 z-50 shadow-2xl">
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
                className="rounded-xl overflow-hidden"
              />
            </div>
          )}
        </div>

        {/* Guests */}
        <div>
          <label className="input-label flex items-center gap-2">
            <HiUsers className="w-4 h-4" />
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="input-field mt-1 cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Max {property?.details?.maxGuests || 8} guests allowed
          </p>
        </div>

        {/* Guest Details Form */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowGuestForm(!showGuestForm)}
            className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] flex items-center gap-2 w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <HiUser className="w-4 h-4" />
              Guest Contact Details
            </span>
            <span>{showGuestForm ? '−' : '+'}</span>
          </button>
          
          {showGuestForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 pt-2"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={guestDetails.firstName}
                    onChange={(e) => setGuestDetails({ ...guestDetails, firstName: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name *"
                    value={guestDetails.lastName}
                    onChange={(e) => setGuestDetails({ ...guestDetails, lastName: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={guestDetails.email}
                    onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                    className="input-field pl-10 text-sm"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={guestDetails.phone}
                    onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                    className="input-field pl-10 text-sm"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <HiChat className="absolute left-3 top-3 w-4 h-4 text-[var(--color-text-muted)]" />
                  <textarea
                    placeholder="Special Requests or Message"
                    value={guestDetails.message}
                    onChange={(e) => setGuestDetails({ ...guestDetails, message: e.target.value })}
                    rows={3}
                    className="input-field pl-10 text-sm resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Book button */}
        <button
          onClick={handleContinueBooking}
          className="btn-primary w-full py-4 text-lg font-semibold"
        >
          Continue to Booking
        </button>

        {/* Price breakdown */}
        {nights > 0 && (
          <div className="space-y-2 pt-4 border-t border-white/10">
            <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
              <span>{formatCurrency(basePrice)} x {nights} nights</span>
              <span>{formatCurrency(baseTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
              <span>Cleaning fee</span>
              <span>{formatCurrency(cleaningFee)}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
              <span>Service fee</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
              <span>Taxes & fees</span>
              <span>{formatCurrency(taxes)}</span>
            </div>
            <div className="flex justify-between font-semibold text-white pt-2 border-t border-white/10">
              <span>Total</span>
              <span className="text-xl">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/10 text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <HiShieldCheck className="w-4 h-4 text-[var(--color-success)]" />
            Secure Booking
          </div>
          <div className="flex items-center gap-2">
            <HiTag className="w-4 h-4 text-[var(--color-primary)]" />
            Best Price Guarantee
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingWidget;