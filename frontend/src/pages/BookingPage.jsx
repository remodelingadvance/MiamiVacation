import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DateRange } from 'react-date-range';
import { addDays, addMonths, differenceInDays, format, isSameDay, startOfDay } from 'date-fns';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import {
  HiArrowLeft,
  HiArrowRight,
  HiCalendar,
  HiCheck,
  HiCreditCard,
  HiGlobeAlt,
  HiHome,
  HiInformationCircle,
  HiLocationMarker,
  HiMail,
  HiMinus,
  HiPhone,
  HiPlus,
  HiShieldCheck,
  HiStar,
  HiTag,
  HiUser,
  HiUsers,
  HiX,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../config/api';
import { formatCurrency } from '../utils/helpers';
import { THEME } from '../config/theme.config';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const steps = [
  { number: 1, title: 'Dates', icon: HiCalendar },
  { number: 2, title: 'Guests', icon: HiUsers },
  { number: 3, title: 'Payment', icon: HiCreditCard },
];

const currencyOrZero = (value) => formatCurrency(Math.max(0, value || 0));
const phoneRegex = /^\+?[0-9\s().-]{7,20}$/;

const buildDateList = (start, end, includeEnd = false) => {
  const dates = [];
  const currentDate = new Date(start);
  const finalDate = new Date(end);

  while (includeEnd ? currentDate <= finalDate : currentDate < finalDate) {
    dates.push(startOfDay(new Date(currentDate)));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const BookingPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState([]);
  const [maintenanceDates, setMaintenanceDates] = useState([]);
  const [rateCalendar, setRateCalendar] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState([
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 4),
      key: 'selection',
    },
  ]);
  const [guests, setGuests] = useState({
    adults: 2,
    children: 0,
    infants: 0,
  });
  const [contactInfo, setContactInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.zipCode || user?.address?.postalCode || '',
    country: user?.address?.country || 'US',
    specialRequests: '',
  });

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        const propertyResponse = await apiService.getProperty(propertyId);
        const propertyData = propertyResponse.data.property;
        setProperty(propertyData);

        const today = new Date();
        try {
          const rateCalendarResponse = await apiService.getPropertyRateCalendar(propertyId, {
            startDate: format(today, 'yyyy-MM-dd'),
            endDate: format(addMonths(today, 18), 'yyyy-MM-dd'),
          });
          setRateCalendar(rateCalendarResponse.data.days || []);
        } catch {
          setRateCalendar([]);
        }

        const bookingsResponse = await apiService.getPropertyBookings(propertyId);
        const bookings = bookingsResponse.data.bookings || [];
        const booked = bookings.flatMap((booking) => {
          if (!['confirmed', 'active', 'pending'].includes(booking.status)) return [];
          return buildDateList(booking.checkIn, booking.checkOut);
        });
        setBookedDates(booked);

        try {
          const maintenanceResponse = await apiService.getMaintenanceDates(propertyId);
          const maintenance = maintenanceResponse.data.maintenanceDates || [];
          const maintenanceBooked = maintenance.flatMap((item) =>
            buildDateList(item.startDate, item.endDate, true)
          );
          setMaintenanceDates(maintenanceBooked);
        } catch {
          setMaintenanceDates([]);
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
        toast.error('Failed to load booking details');
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [navigate, propertyId]);

  const rateMap = useMemo(
    () => new Map(rateCalendar.map((day) => [day.date, day])),
    [rateCalendar]
  );

  const blockedRateDates = useMemo(
    () =>
      rateCalendar
        .filter((day) => day.status === 'blocked')
        .map((day) => startOfDay(new Date(`${day.date}T00:00:00`))),
    [rateCalendar]
  );

  const unavailableDates = useMemo(
    () => [...bookedDates, ...maintenanceDates, ...blockedRateDates],
    [blockedRateDates, bookedDates, maintenanceDates]
  );

  const nights = Math.max(
    0,
    differenceInDays(dateRange[0].endDate, dateRange[0].startDate)
  );
  const totalGuests = guests.adults + guests.children;
  const maxGuests = property?.details?.maxGuests || 10;
  const basePrice = property?.pricing?.basePrice || 0;
  const cleaningFee = property?.pricing?.cleaningFee || 0;
  const serviceFee = property?.pricing?.serviceFee || 0;
  const taxRate = (property?.pricing?.taxRate || 13.5) / 100;
  const selectedNightDates = useMemo(
    () => buildDateList(dateRange[0].startDate, dateRange[0].endDate),
    [dateRange]
  );
  const dailyRates = useMemo(
    () =>
      selectedNightDates.map((date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const rate = rateMap.get(dateKey);
        return {
          date: dateKey,
          price: rate?.price ?? basePrice,
          status: rate?.status || 'available',
          minimumStay: rate?.minimumStay || property?.pricing?.minimumStay || 1,
        };
      }),
    [basePrice, property?.pricing?.minimumStay, rateMap, selectedNightDates]
  );
  const minimumStay = dailyRates.reduce(
    (max, day) => Math.max(max, day.minimumStay || 1),
    property?.pricing?.minimumStay || 1
  );
  const baseTotal = dailyRates.reduce((sum, day) => sum + day.price, 0);
  const averageNightlyRate = nights ? baseTotal / nights : basePrice;
  const subtotal = baseTotal + cleaningFee + serviceFee;
  const taxes = subtotal * taxRate;
  const total = subtotal + taxes;
  const discount = couponDiscount?.discount || 0;
  const finalTotal = Math.max(0, total - discount);
  const heroImage =
    property?.images?.find((image) => image.isPrimary)?.url ||
    property?.images?.[0]?.url ||
    THEME.hero.heroImage;

  const dateIsUnavailable = (date) =>
    unavailableDates.some((unavailable) => isSameDay(unavailable, date));

  const rangeHasUnavailableDate = (startDate, endDate) => {
    const dates = buildDateList(startDate, endDate, false);
    return dates.find((date) => dateIsUnavailable(date));
  };

  const handleDateRangeChange = (item) => {
    const nextRange = item.selection;
    const blockedDate = rangeHasUnavailableDate(nextRange.startDate, nextRange.endDate);

    if (blockedDate) {
      const reason = maintenanceDates.some((date) => isSameDay(date, blockedDate))
        ? 'under maintenance'
        : blockedRateDates.some((date) => isSameDay(date, blockedDate))
          ? 'closed for booking'
          : 'already booked';
      toast.error(`${format(blockedDate, 'MMM dd, yyyy')} is ${reason}. Choose another range.`);
      return;
    }

    setDateRange([nextRange]);
    if (couponDiscount) {
      setCouponDiscount(null);
      setCouponCode('');
    }
  };

  const updateGuests = (type, delta) => {
    setGuests((prev) => {
      const nextValue = prev[type] + delta;
      if (type === 'adults' && nextValue < 1) return prev;
      if (nextValue < 0) return prev;

      const next = { ...prev, [type]: nextValue };
      if (next.adults + next.children > maxGuests) {
        toast.error(`Maximum ${maxGuests} guests allowed`);
        return prev;
      }
      if (next.infants > 5) return prev;
      return next;
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    try {
      const response = await apiService.validateCoupon({
        code: couponCode,
        bookingAmount: baseTotal,
        nights,
        propertyId,
      });
      if (response.data.success) {
        setCouponDiscount(response.data);
        toast.success(`Coupon applied. You saved ${formatCurrency(response.data.discount)}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
      setCouponDiscount(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponDiscount(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!dateRange[0].startDate || !dateRange[0].endDate || nights <= 0) {
        toast.error('Please select valid check-in and check-out dates');
        return;
      }
      if (minimumStay && nights < minimumStay) {
        toast.error(`Minimum stay is ${minimumStay} nights`);
        return;
      }
    }

    if (step === 2) {
      if (!contactInfo.firstName.trim()) {
        toast.error('Please enter your first name');
        return;
      }
      if (!contactInfo.lastName.trim()) {
        toast.error('Please enter your last name');
        return;
      }
      if (!contactInfo.email.trim() || !contactInfo.email.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
      if (!contactInfo.phone.trim()) {
        toast.error('Please enter the customer phone number');
        return;
      }
      if (!phoneRegex.test(contactInfo.phone.trim())) {
        toast.error('Please enter a valid customer phone number');
        return;
      }
      if (!contactInfo.address.trim()) {
        toast.error('Please enter the customer street address');
        return;
      }
      if (!contactInfo.city.trim()) {
        toast.error('Please enter the customer city');
        return;
      }
      if (!contactInfo.postalCode.trim()) {
        toast.error('Please enter the customer postal code');
        return;
      }
      if (!contactInfo.country.trim()) {
        toast.error('Please select the customer country');
        return;
      }
    }

    setStep((prev) => Math.min(3, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateBooking = async () => {
    try {
      const bookingData = {
        propertyId: property._id,
        checkIn: format(dateRange[0].startDate, 'yyyy-MM-dd'),
        checkOut: format(dateRange[0].endDate, 'yyyy-MM-dd'),
        guests,
        couponCode: couponCode || undefined,
        specialRequests: contactInfo.specialRequests,
        guestDetails: {
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          address: contactInfo.address,
          city: contactInfo.city,
          state: contactInfo.state,
          postalCode: contactInfo.postalCode,
          country: contactInfo.country,
        },
      };

      const response = await apiService.createBooking(bookingData);
      if (response.data.success) {
        const bookingId = response.data.booking?._id || response.data.booking?.id;
        if (!bookingId) {
          throw new Error('Booking was created but no booking ID was returned');
        }
        toast.success('Booking confirmed!');
        navigate(`/booking/confirmation/${bookingId}`, { replace: true });
        return bookingId;
      }
      throw new Error(response.data.message || 'Booking failed. Please try again.');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || error.message || 'Booking failed. Please try again.');
      throw error;
    }
  };

  const renderDayContent = (date) => {
    const rate = rateMap.get(format(date, 'yyyy-MM-dd'));
    const booked = bookedDates.some((bookedDate) => isSameDay(bookedDate, date));
    const maintenance = maintenanceDates.some((maintenanceDate) =>
      isSameDay(maintenanceDate, date)
    );
    const blocked = rate?.status === 'blocked';

    return (
      <span className="booking-day-content">
        <span className="booking-day-number">{format(date, 'd')}</span>
        <span className="booking-day-price">
          {formatCurrency(rate?.price ?? basePrice).replace('.00', '')}
        </span>
        {(booked || maintenance || blocked) && (
          <span
            className={
              maintenance
                ? 'booking-day-dot maintenance'
                : blocked
                  ? 'booking-day-dot blocked'
                  : 'booking-day-dot booked'
            }
          />
        )}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-bg-medium)] pt-28">
        <div className="container-custom py-12">
          <div className="animate-pulse space-y-8">
            <div className="skeleton h-10 w-72" />
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
              <div className="skeleton h-[560px] rounded-[26px]" />
              <div className="skeleton h-[460px] rounded-[26px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={`Book ${property?.name || 'Miami Stay'}`} />

      <section className="relative isolate overflow-hidden bg-[var(--color-text-primary)] pt-28 text-white lg:pt-36">
        <img src={heroImage} alt={property?.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,20,76,0.94),rgba(7,20,76,0.74)_52%,rgba(7,20,76,0.36))]" />
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-[var(--color-primary)]/30 blur-3xl" />

        <div className="container-custom relative z-10 pb-12">
          <Link
            to={`/properties/${property?.slug || propertyId}`}
            className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-white/78 transition-colors hover:text-white"
          >
            <HiArrowLeft className="h-5 w-5" />
            Back to property
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <p className="text-sm font-black uppercase text-[var(--color-primary)]">
              Secure Miami booking
            </p>
            <h1 className="mt-3 font-hero text-5xl font-black uppercase leading-[0.94] sm:text-6xl lg:text-7xl">
              Reserve your Miami stay
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-white/78">
              Pick dates, confirm guests, and finish securely. Everything is tuned for
              beach days, city nights, and local Miami support.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="bg-[var(--color-bg-medium)] py-10 lg:py-14">
        <div className="container-custom">
          <div className="mb-8 rounded-[24px] bg-white p-4 shadow-[0_18px_48px_rgba(8,19,76,0.08)] ring-1 ring-black/5">
            <div className="grid gap-3 sm:grid-cols-3">
              {steps.map((item, index) => {
                const Icon = item.icon;
                const active = step === item.number;
                const complete = step > item.number;
                return (
                  <button
                    key={item.number}
                    type="button"
                    onClick={() => item.number < step && setStep(item.number)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all ${
                      active
                        ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[rgba(244,20,82,0.20)]'
                        : complete
                          ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                          : 'bg-[var(--color-bg-medium)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20">
                      {complete ? <HiCheck className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                    </span>
                    <span>
                      <span className="block text-xs font-black uppercase opacity-75">
                        Step {index + 1}
                      </span>
                      <span className="font-black">{item.title}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.section
                    key="dates"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="booking-calendar-card rounded-[26px] bg-white p-5 shadow-[0_18px_48px_rgba(8,19,76,0.08)] ring-1 ring-black/5 sm:p-7"
                  >
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase text-[var(--color-primary)]">
                          One booking calendar
                        </p>
                        <h2 className="text-3xl font-black text-[var(--color-text-primary)]">
                          Select your dates
                        </h2>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          Booked and maintenance dates are visible and disabled.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[var(--color-secondary-light)] px-4 py-3 text-sm font-bold text-[var(--color-text-primary)]">
                        {format(dateRange[0].startDate, 'MMM dd')} -{' '}
                        {format(dateRange[0].endDate, 'MMM dd, yyyy')}
                      </div>
                    </div>

                    <DateRange
                      className="booking-date-range"
                      dayContentRenderer={renderDayContent}
                      disabledDates={unavailableDates}
                      editableDateInputs
                      minDate={addDays(new Date(), 1)}
                      months={1}
                      moveRangeOnFirstSelection={false}
                      onChange={handleDateRangeChange}
                      rangeColors={['#F41452']}
                      ranges={dateRange}
                      showDateDisplay={false}
                      showMonthAndYearPickers
                    />

                    <div className="mt-6 grid gap-3 border-t border-[var(--color-border)] pt-5 sm:grid-cols-4">
                      {[
                        ['Selected', 'bg-[var(--color-primary)]'],
                        ['Booked', 'bg-red-500'],
                        ['Maintenance', 'bg-amber-400'],
                        ['Available', 'bg-white border border-[var(--color-border)]'],
                      ].map(([label, cls]) => (
                        <div key={label} className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-secondary)]">
                          <span className={`h-4 w-4 rounded-full ${cls}`} />
                          {label}
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {step === 2 && (
                  <motion.section
                    key="guests"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-6"
                  >
                    <div className="rounded-[26px] bg-white p-5 shadow-[0_18px_48px_rgba(8,19,76,0.08)] ring-1 ring-black/5 sm:p-7">
                      <p className="text-xs font-black uppercase text-[var(--color-primary)]">
                        Guest count
                      </p>
                      <h2 className="mb-6 text-3xl font-black text-[var(--color-text-primary)]">
                        Who is coming?
                      </h2>

                      {[
                        ['adults', 'Adults', 'Age 13+'],
                        ['children', 'Children', 'Ages 2-12'],
                        ['infants', 'Infants', 'Under 2'],
                      ].map(([key, title, subtitle]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] py-4 last:border-b-0"
                        >
                          <div>
                            <p className="font-black text-[var(--color-text-primary)]">{title}</p>
                            <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateGuests(key, -1)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-primary)] disabled:opacity-35"
                              disabled={(key === 'adults' && guests.adults <= 1) || (key !== 'adults' && guests[key] <= 0)}
                            >
                              <HiMinus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-xl font-black text-[var(--color-text-primary)]">
                              {guests[key]}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateGuests(key, 1)}
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white disabled:opacity-35"
                              disabled={
                                key === 'infants'
                                  ? guests.infants >= 5
                                  : totalGuests + 1 > maxGuests
                              }
                            >
                              <HiPlus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="mt-5 rounded-2xl bg-[var(--color-bg-medium)] px-4 py-3 text-sm font-bold text-[var(--color-text-secondary)]">
                        Maximum {maxGuests} guests, not including infants.
                      </div>
                    </div>

                    <div className="rounded-[26px] bg-white p-5 shadow-[0_18px_48px_rgba(8,19,76,0.08)] ring-1 ring-black/5 sm:p-7">
                      <p className="text-xs font-black uppercase text-[var(--color-primary)]">
                        Contact details
                      </p>
                      <h2 className="mb-6 text-3xl font-black text-[var(--color-text-primary)]">
                        Primary guest
                      </h2>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field icon={HiUser} label="First Name *">
                          <input
                            type="text"
                            value={contactInfo.firstName}
                            onChange={(e) => setContactInfo({ ...contactInfo, firstName: e.target.value })}
                            className="input-field pl-10"
                            placeholder="John"
                          />
                        </Field>
                        <Field label="Last Name *">
                          <input
                            type="text"
                            value={contactInfo.lastName}
                            onChange={(e) => setContactInfo({ ...contactInfo, lastName: e.target.value })}
                            className="input-field"
                            placeholder="Doe"
                          />
                        </Field>
                        <Field icon={HiMail} label="Email Address *">
                          <input
                            type="email"
                            value={contactInfo.email}
                            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                            className="input-field pl-10"
                            placeholder="john@example.com"
                          />
                        </Field>
                        <Field icon={HiPhone} label="Phone Number *">
                          <input
                            type="tel"
                            value={contactInfo.phone}
                            onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                            className="input-field pl-10"
                            placeholder="+1 305 123 4567"
                            required
                          />
                        </Field>
                        <Field icon={HiHome} label="Street Address *">
                          <input
                            type="text"
                            value={contactInfo.address}
                            onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                            className="input-field pl-10"
                            placeholder="123 Main St"
                            required
                          />
                        </Field>
                        <Field icon={HiGlobeAlt} label="Country *">
                          <select
                            value={contactInfo.country}
                            onChange={(e) => setContactInfo({ ...contactInfo, country: e.target.value })}
                            className="input-field pl-10"
                            required
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="IN">India</option>
                          </select>
                        </Field>
                        <Field label="City *">
                          <input
                            type="text"
                            value={contactInfo.city}
                            onChange={(e) => setContactInfo({ ...contactInfo, city: e.target.value })}
                            className="input-field"
                            placeholder="Miami"
                            required
                          />
                        </Field>
                        <Field label="State / Region">
                          <input
                            type="text"
                            value={contactInfo.state}
                            onChange={(e) => setContactInfo({ ...contactInfo, state: e.target.value })}
                            className="input-field"
                            placeholder="Florida"
                          />
                        </Field>
                        <Field label="Postal Code *">
                          <input
                            type="text"
                            value={contactInfo.postalCode}
                            onChange={(e) => setContactInfo({ ...contactInfo, postalCode: e.target.value })}
                            className="input-field"
                            placeholder="33101"
                            required
                          />
                        </Field>
                      </div>

                      <label className="mt-4 block">
                        <span className="input-label">Special Requests</span>
                        <textarea
                          value={contactInfo.specialRequests}
                          onChange={(e) => setContactInfo({ ...contactInfo, specialRequests: e.target.value })}
                          rows={4}
                          className="input-field resize-none"
                          placeholder="Arrival time, accessibility needs, concierge requests..."
                        />
                      </label>
                    </div>

                    <div className="rounded-[26px] bg-white p-5 shadow-[0_18px_48px_rgba(8,19,76,0.08)] ring-1 ring-black/5 sm:p-7">
                      <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-[var(--color-text-primary)]">
                        <HiTag className="h-5 w-5 text-[var(--color-primary)]" />
                        Promo Code
                      </h3>
                      {couponDiscount ? (
                        <div className="flex items-center justify-between rounded-2xl bg-[#ECFDF3] p-4">
                          <div>
                            <p className="font-black text-[var(--color-accent)]">{couponCode}</p>
                            <p className="text-sm text-[var(--color-text-muted)]">
                              Saved {formatCurrency(couponDiscount.discount)}
                            </p>
                          </div>
                          <button type="button" onClick={removeCoupon} className="text-[var(--color-text-muted)] hover:text-red-500">
                            <HiX className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter promo code"
                            className="input-field uppercase"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={!couponCode || couponLoading}
                            className="btn-primary px-7 disabled:opacity-50"
                          >
                            {couponLoading ? 'Applying...' : 'Apply'}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.section>
                )}

                {step === 3 && (
                  <motion.section
                    key="payment"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="rounded-[26px] bg-white p-5 shadow-[0_18px_48px_rgba(8,19,76,0.08)] ring-1 ring-black/5 sm:p-7"
                  >
                    <p className="text-xs font-black uppercase text-[var(--color-primary)]">
                      Secure checkout
                    </p>
                    <h2 className="mb-6 text-3xl font-black text-[var(--color-text-primary)]">
                      Payment details
                    </h2>
                    <Elements stripe={stripePromise}>
                      <PaymentForm
                        finalTotal={finalTotal}
                        onSuccess={handleCreateBooking}
                      />
                    </Elements>
                  </motion.section>
                )}
              </AnimatePresence>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                    className="btn-outline flex items-center justify-center gap-2 px-6 py-3"
                  >
                    <HiArrowLeft className="h-5 w-5" />
                    Back
                  </button>
                ) : (
                  <span />
                )}
                {step < 3 && (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
                  >
                    Continue
                    <HiArrowRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <BookingSummary
                property={property}
                heroImage={heroImage}
                dateRange={dateRange}
                guests={guests}
                pricing={{
                  basePrice,
                  averageNightlyRate,
                  cleaningFee,
                  serviceFee,
                  taxes,
                  total,
                  discount,
                  finalTotal,
                  baseTotal,
                  nights,
                  dailyRates,
                }}
              />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};

const Field = ({ label, icon: Icon, children }) => (
  <label className="block">
    <span className="input-label">{label}</span>
    <span className="relative mt-1 block">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
      )}
      {children}
    </span>
  </label>
);

const BookingSummary = ({ property, heroImage, dateRange, guests, pricing }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    className="overflow-hidden rounded-[26px] bg-white shadow-[0_24px_70px_rgba(8,19,76,0.12)] ring-1 ring-black/5"
  >
    <div className="relative h-44">
      <img src={heroImage} alt={property?.name} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,20,76,0.82)] to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <p className="text-xs font-black uppercase text-white/70">Booking summary</p>
        <h3 className="line-clamp-2 text-lg font-black text-white">{property?.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-white/78">
          <HiLocationMarker className="h-4 w-4 text-[var(--color-primary)]" />
          {property?.location?.neighborhood}, {property?.location?.city}
        </p>
      </div>
    </div>

    <div className="space-y-5 p-6">
      <div className="grid grid-cols-2 gap-3">
        <SummaryTile
          icon={HiCalendar}
          label="Dates"
          value={`${format(dateRange[0].startDate, 'MMM dd')} - ${format(dateRange[0].endDate, 'MMM dd')}`}
        />
        <SummaryTile
          icon={HiUsers}
          label="Guests"
          value={`${guests.adults + guests.children} guests`}
        />
      </div>

      <div className="rounded-2xl bg-[var(--color-bg-medium)] p-4">
        <h4 className="mb-3 font-black text-[var(--color-text-primary)]">Price details</h4>
        <div className="space-y-2 text-sm">
          <PriceRow label={`Nightly rates (${pricing.nights} nights)`} value={pricing.baseTotal} />
          {pricing.nights > 1 && (
            <div className="flex justify-between text-xs font-bold text-[var(--color-text-muted)]">
              <span>Average per night</span>
              <span>{currencyOrZero(pricing.averageNightlyRate)}</span>
            </div>
          )}
          <PriceRow label="Cleaning fee" value={pricing.cleaningFee} />
          <PriceRow label="Service fee" value={pricing.serviceFee} />
          <PriceRow label="Taxes" value={pricing.taxes} />
          {pricing.discount > 0 && (
            <div className="flex justify-between font-bold text-[var(--color-accent)]">
              <span>Discount</span>
              <span>-{currencyOrZero(pricing.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-lg font-black text-[var(--color-text-primary)]">
            <span>Total</span>
            <span>{currencyOrZero(pricing.finalTotal)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-xs font-bold text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-3">
          <HiShieldCheck className="h-4 w-4 text-[var(--color-accent)]" />
          Secure payment processing
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-3">
          <HiCheck className="h-4 w-4 text-[var(--color-primary)]" />
          Free cancellation up to 30 days before check-in
        </div>
      </div>
    </div>
  </motion.div>
);

const SummaryTile = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-[var(--color-border)] p-4">
    <Icon className="mb-2 h-5 w-5 text-[var(--color-primary)]" />
    <p className="text-xs font-black uppercase text-[var(--color-text-muted)]">{label}</p>
    <p className="mt-1 text-sm font-black text-[var(--color-text-primary)]">{value}</p>
  </div>
);

const PriceRow = ({ label, value }) => (
  <div className="flex justify-between text-[var(--color-text-secondary)]">
    <span>{label}</span>
    <span>{currencyOrZero(value)}</span>
  </div>
);

const PaymentForm = ({ finalTotal, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      setError('Stripe is not initialized');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      await onSuccess();
    } catch {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="input-label">Card Information</label>
        <div className="mt-2 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#07144C',
                  fontFamily: 'Inter, sans-serif',
                  '::placeholder': { color: '#6A7392' },
                },
                invalid: {
                  color: '#EF4444',
                  iconColor: '#EF4444',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-50 p-4 text-sm font-semibold text-red-600">
          <HiInformationCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-base font-black disabled:opacity-50"
      >
        {processing ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Processing...
          </>
        ) : (
          <>
            <HiCreditCard className="h-5 w-5" />
            Confirm & Pay {currencyOrZero(finalTotal)}
          </>
        )}
      </button>

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        By confirming your booking, you agree to our Terms of Service and Cancellation Policy.
      </p>
    </form>
  );
};

export default BookingPage;
