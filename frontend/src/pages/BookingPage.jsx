import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, addDays, differenceInDays, isSameDay, startOfDay } from 'date-fns';
import { DateRange } from 'react-date-range';
import {
  HiCalendar,
  HiUsers,
  HiCreditCard,
  HiShieldCheck,
  HiCheck,
  HiArrowLeft,
  HiArrowRight,
  HiTag,
  HiX,
  HiStar,
  HiInformationCircle,
  HiUser,
  HiMail,
  HiPhone,
  HiHome,
  HiGlobeAlt,
  HiPlus,
  HiMinus,
  HiLocationMarker,
} from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiService from '../config/api';
import { formatCurrency, calculateNights, calculateDisplayPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const BookingPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [property, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  
  // Date range state
  const [dateRange, setDateRange] = useState([
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 4),
      key: 'selection',
    },
  ]);
  
  // Guests state
  const [guests, setGuestsState] = useState({
    adults: 2,
    children: 0,
    infants: 0,
  });
  
  // Contact info state
  const [contactInfo, setContactInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'US',
    specialRequests: '',
  });
  
  // Pricing state
  const [pricing, setPricing] = useState(null);
  
  // Step state
  const [step, setStep] = useState(1);

  // Fetch property and booked dates
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const propertyResponse = await apiService.getProperty(propertyId);
        const propertyData = propertyResponse.data.property;
        setPropertyData(propertyData);
        
        // Fetch booked dates
        const bookingsResponse = await apiService.getPropertyBookings(propertyId);
        const bookings = bookingsResponse.data.bookings || [];
        
        const dates = [];
        bookings.forEach(booking => {
          if (booking.status === 'confirmed' || booking.status === 'active') {
            let currentDate = new Date(booking.checkIn);
            const endDate = new Date(booking.checkOut);
            while (currentDate < endDate) {
              dates.push(startOfDay(new Date(currentDate)));
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        });
        setBookedDates(dates);
        
        // Calculate initial pricing
        updatePricing(propertyData, dateRange[0].startDate, dateRange[0].endDate);
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property');
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [propertyId]);

  // Update pricing when dates or guests change
  const updatePricing = (propertyData, startDate, endDate) => {
    if (!propertyData || !startDate || !endDate) return;
    
    const nights = differenceInDays(endDate, startDate);
    const basePrice = propertyData.pricing?.basePrice || 0;
    const cleaningFee = propertyData.pricing?.cleaningFee || 0;
    const serviceFee = propertyData.pricing?.serviceFee || 0;
    const taxRate = (propertyData.pricing?.taxRate || 13.5) / 100;
    
    const baseTotal = basePrice * nights;
    const subtotal = baseTotal + cleaningFee + serviceFee;
    const taxes = subtotal * taxRate;
    const total = subtotal + taxes;
    
    setPricing({
      nightlyRate: basePrice,
      nights,
      baseTotal: Math.round(baseTotal * 100) / 100,
      cleaningFee: Math.round(cleaningFee * 100) / 100,
      serviceFee: Math.round(serviceFee * 100) / 100,
      taxes: Math.round(taxes * 100) / 100,
      total: Math.round(total * 100) / 100,
    });
  };

  // Update pricing when dates change
  useEffect(() => {
    if (property && dateRange[0].startDate && dateRange[0].endDate) {
      updatePricing(property, dateRange[0].startDate, dateRange[0].endDate);
    }
  }, [dateRange, property]);

  // Check if a date is booked
  const isDateBooked = (date) => {
    return bookedDates.some(bookedDate => isSameDay(bookedDate, date));
  };

  // Handle date range change
  const handleDateRangeChange = (item) => {
    const { startDate, endDate } = item.selection;
    
    if (startDate && endDate) {
      // Check if any date in range is booked
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        if (isDateBooked(currentDate)) {
          toast.error(`Selected dates include a booked date (${format(currentDate, 'MMM dd, yyyy')}). Please choose different dates.`);
          return;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    setDateRange([item.selection]);
  };

  // Handle guest count changes
  const updateGuests = (type, delta) => {
    setGuestsState(prev => {
      const newValue = prev[type] + delta;
      if (type === 'adults' && newValue < 1) return prev;
      if (newValue < 0) return prev;
      if (property && newValue > property.details?.maxGuests) {
        toast.error(`Maximum ${property.details?.maxGuests} guests allowed`);
        return prev;
      }
      return { ...prev, [type]: newValue };
    });
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    try {
      const response = await apiService.validateCoupon({
        code: couponCode,
        bookingAmount: pricing?.baseTotal || 0,
      });
      if (response.data.success) {
        setCouponDiscount(response.data);
        toast.success(`Coupon applied! You saved $${response.data.discount}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
      setCouponDiscount(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setCouponDiscount(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  // Proceed to next step
  const handleNextStep = () => {
    if (step === 1) {
      if (!dateRange[0].startDate || !dateRange[0].endDate) {
        toast.error('Please select your dates');
        return;
      }
      const nights = differenceInDays(dateRange[0].endDate, dateRange[0].startDate);
      if (property?.pricing?.minimumStay && nights < property.pricing.minimumStay) {
        toast.error(`Minimum stay is ${property.pricing.minimumStay} nights`);
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
    }
    
    setStep(prev => prev + 1);
  };

  // Go back to previous step
  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  // Create booking and process payment
  const handleCreateBooking = async (paymentMethodId) => {
    if (!isAuthenticated) {
      toast.error('Please login to complete your booking');
      navigate('/login');
      return;
    }
    
    try {
      const bookingData = {
        propertyId: property._id,
        checkIn: dateRange[0].startDate,
        checkOut: dateRange[0].endDate,
        guests: guests,
        couponCode: couponCode || undefined,
        specialRequests: contactInfo.specialRequests,
        guestDetails: {
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          address: contactInfo.address,
          city: contactInfo.city,
          postalCode: contactInfo.postalCode,
          country: contactInfo.country,
        }
      };
      
      const response = await apiService.createBooking(bookingData);
      
      if (response.data.success) {
        toast.success('Booking confirmed!');
        navigate(`/booking/confirmation/${response.data.booking._id}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="pt-24">
        <div className="container-custom py-12">
          <div className="animate-pulse space-y-8">
            <div className="skeleton h-8 w-64" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="skeleton h-96 rounded-2xl" />
                <div className="skeleton h-64 rounded-2xl" />
              </div>
              <div className="skeleton h-96 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalGuests = guests.adults + guests.children;
  const maxGuests = property?.details?.maxGuests || 10;

  return (
    <>
      <SEOHead title="Complete Your Booking" />

      <section className="pt-28 pb-16">
        <div className="container-custom">
          {/* Back button */}
          <Link
            to={`/properties/${property?.slug || propertyId}`}
            className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-8"
          >
            <HiArrowLeft className="w-5 h-5" />
            Back to property
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
            {[
              { number: 1, title: 'Select Dates', icon: HiCalendar },
              { number: 2, title: 'Guest Info', icon: HiUsers },
              { number: 3, title: 'Payment', icon: HiCreditCard },
            ].map((s) => (
              <div key={s.number} className="flex-1 text-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-all ${
                    step >= s.number
                      ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {step > s.number ? <HiCheck className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`text-sm ${step >= s.number ? 'text-white' : 'text-white/40'}`}>
                  {s.title}
                </span>
                {s.number < 3 && (
                  <div className={`h-px w-full mt-6 ${step > s.number ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Select Dates - Beautiful Calendar UI */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-display font-bold text-white mb-2">
                      Select Your Dates
                    </h2>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      Choose your check-in and check-out dates
                    </p>
                  </div>
                  
                  <style jsx global>{`
                    /* Calendar Container */
                    .booking-calendar .rdrCalendarWrapper {
                      background: transparent !important;
                      width: 100% !important;
                    }
                    
                    /* Month Container */
                    .booking-calendar .rdrMonth {
                      background: transparent !important;
                      width: 100% !important;
                      padding: 0 !important;
                    }
                    
                    /* Month Name */
                    .booking-calendar .rdrMonthName {
                      color: white !important;
                      font-size: 1.1rem !important;
                      font-weight: 600 !important;
                      padding: 0 0 1rem 0 !important;
                      text-align: center !important;
                    }
                    
                    /* Week Days */
                    .booking-calendar .rdrWeekDay {
                      color: rgba(255, 255, 255, 0.6) !important;
                      font-weight: 500 !important;
                      font-size: 0.8rem !important;
                      padding: 0.75rem 0 !important;
                    }
                    
                    /* Day Numbers */
                    .booking-calendar .rdrDayNumber {
                      font-weight: 500 !important;
                    }
                    
                    .booking-calendar .rdrDayNumber span {
                      color: white !important;
                      font-size: 0.9rem !important;
                    }
                    
                    /* Disabled Days */
                    .booking-calendar .rdrDayDisabled {
                      background: transparent !important;
                    }
                    
                    .booking-calendar .rdrDayDisabled .rdrDayNumber span {
                      color: rgba(255, 255, 255, 0.3) !important;
                      text-decoration: line-through !important;
                    }
                    
                    /* Today's Date */
                    .booking-calendar .rdrDayToday .rdrDayNumber span:after {
                      background: var(--color-primary) !important;
                      height: 2px !important;
                      bottom: -4px !important;
                    }
                    
                    /* Selected Range Start & End */
                    .booking-calendar .rdrStartEdge {
                      background: var(--color-primary) !important;
                      border-radius: 0.75rem 0 0 0.75rem !important;
                    }
                    
                    .booking-calendar .rdrEndEdge {
                      background: var(--color-primary) !important;
                      border-radius: 0 0.75rem 0.75rem 0 !important;
                    }
                    
                    .booking-calendar .rdrStartEdge .rdrDayNumber span,
                    .booking-calendar .rdrEndEdge .rdrDayNumber span {
                      color: var(--color-bg-dark) !important;
                      font-weight: 600 !important;
                    }
                    
                    /* In Range Dates */
                    .booking-calendar .rdrInRange {
                      background: rgba(200, 169, 126, 0.2) !important;
                    }
                    
                    /* Hover Effect */
                    .booking-calendar .rdrDay:hover:not(.rdrDayDisabled) {
                      background: rgba(200, 169, 126, 0.15) !important;
                      border-radius: 0.75rem !important;
                    }
                    
                    /* Booked Dates - Red Styling */
                    .booking-calendar .booked-date {
                      position: relative;
                    }
                    
                    .booking-calendar .rdrDay:has(.booked-date) {
                      background: rgba(239, 68, 68, 0.2) !important;
                      border-radius: 0.75rem !important;
                      cursor: not-allowed !important;
                    }
                    
                    .booking-calendar .rdrDay:has(.booked-date):hover {
                      background: rgba(239, 68, 68, 0.3) !important;
                    }
                    
                    .booking-calendar .rdrDay:has(.booked-date) .rdrDayNumber span {
                      color: #ef4444 !important;
                      text-decoration: line-through !important;
                    }
                    
                    /* Day Cells */
                    .booking-calendar .rdrDay {
                      padding: 0.5rem !important;
                      transition: all 0.2s ease !important;
                    }
                    
                    .booking-calendar .rdrDayPassive .rdrDayNumber span {
                      color: rgba(255, 255, 255, 0.4) !important;
                    }
                    
                    /* Navigation Buttons */
                    .booking-calendar .rdrPprevButton,
                    .booking-calendar .rdrNextButton {
                      background: rgba(255, 255, 255, 0.1) !important;
                      border-radius: 0.5rem !important;
                      padding: 0.5rem !important;
                    }
                    
                    .booking-calendar .rdrPprevButton:hover,
                    .booking-calendar .rdrNextButton:hover {
                      background: rgba(255, 255, 255, 0.2) !important;
                    }
                  `}</style>
                  
                  <div className="booking-calendar">
                    <DateRange
                      editableDateInputs={true}
                      onChange={handleDateRangeChange}
                      moveRangeOnFirstSelection={false}
                      ranges={dateRange}
                      minDate={addDays(new Date(), 1)}
                      rangeColors={['#C8A97E']}
                      months={1}
                      direction="horizontal"
                      showDateDisplay={false}
                      showMonthAndYearPickers={true}
                      dayContentRenderer={(date) => {
                        const isBooked = isDateBooked(date);
                        return (
                          <div className={isBooked ? 'booked-date' : ''}>
                            {format(date, 'd')}
                          </div>
                        );
                      }}
                    />
                  </div>
                  
                  {/* Calendar Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500/50 border border-red-500"></div>
                      <span className="text-xs text-[var(--color-text-muted)]">Booked (Unavailable)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[var(--color-primary)]"></div>
                      <span className="text-xs text-[var(--color-text-muted)]">Selected Dates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-white/20"></div>
                      <span className="text-xs text-[var(--color-text-muted)]">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-white/10 ring-1 ring-[var(--color-primary)]"></div>
                      <span className="text-xs text-[var(--color-text-muted)]">Today</span>
                    </div>
                  </div>
                  
                  {/* Selected Dates Summary */}
                  {dateRange[0].startDate && dateRange[0].endDate && (
                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent border border-[var(--color-primary)]/20">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                            <HiCalendar className="w-5 h-5 text-[var(--color-primary)]" />
                          </div>
                          <div>
                            <p className="text-xs text-[var(--color-text-muted)]">Your Stay</p>
                            <p className="text-white font-semibold">
                              {format(dateRange[0].startDate, 'EEE, MMM dd')} - {format(dateRange[0].endDate, 'EEE, MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[var(--color-text-muted)]">Duration</p>
                          <p className="text-white font-semibold">
                            {differenceInDays(dateRange[0].endDate, dateRange[0].startDate)} nights
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Guest Info & Contact Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Guests Section */}
                  <div className="glass rounded-2xl p-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-display font-bold text-white mb-2">
                        Guest Information
                      </h2>
                      <p className="text-[var(--color-text-secondary)] text-sm">
                        Tell us about your stay
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Adults */}
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <div>
                          <p className="text-white font-medium">Adults</p>
                          <p className="text-xs text-[var(--color-text-muted)]">Age 13+</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateGuests('adults', -1)}
                            className="w-9 h-9 rounded-xl glass-light flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-30"
                            disabled={guests.adults <= 1}
                          >
                            <HiMinus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-semibold w-8 text-center text-lg">{guests.adults}</span>
                          <button
                            onClick={() => updateGuests('adults', 1)}
                            className="w-9 h-9 rounded-xl glass-light flex items-center justify-center text-white hover:bg-white/10 transition-all"
                            disabled={totalGuests + 1 > maxGuests}
                          >
                            <HiPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Children */}
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <div>
                          <p className="text-white font-medium">Children</p>
                          <p className="text-xs text-[var(--color-text-muted)]">Ages 2-12</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateGuests('children', -1)}
                            className="w-9 h-9 rounded-xl glass-light flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-30"
                            disabled={guests.children <= 0}
                          >
                            <HiMinus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-semibold w-8 text-center text-lg">{guests.children}</span>
                          <button
                            onClick={() => updateGuests('children', 1)}
                            className="w-9 h-9 rounded-xl glass-light flex items-center justify-center text-white hover:bg-white/10 transition-all"
                            disabled={totalGuests + 1 > maxGuests}
                          >
                            <HiPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Infants */}
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <div>
                          <p className="text-white font-medium">Infants</p>
                          <p className="text-xs text-[var(--color-text-muted)]">Under 2</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateGuests('infants', -1)}
                            className="w-9 h-9 rounded-xl glass-light flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-30"
                            disabled={guests.infants <= 0}
                          >
                            <HiMinus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-semibold w-8 text-center text-lg">{guests.infants}</span>
                          <button
                            onClick={() => updateGuests('infants', 1)}
                            className="w-9 h-9 rounded-xl glass-light flex items-center justify-center text-white hover:bg-white/10 transition-all"
                            disabled={guests.infants >= 5}
                          >
                            <HiPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 rounded-xl bg-white/5">
                      <p className="text-sm text-[var(--color-text-muted)] text-center">
                        Maximum {maxGuests} guests allowed
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl font-display font-bold text-white mb-5">
                      Contact Details
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="input-label text-sm">First Name *</label>
                          <div className="relative mt-1">
                            <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                            <input
                              type="text"
                              value={contactInfo.firstName}
                              onChange={(e) => setContactInfo({ ...contactInfo, firstName: e.target.value })}
                              className="input-field pl-10"
                              placeholder="John"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="input-label text-sm">Last Name *</label>
                          <input
                            type="text"
                            value={contactInfo.lastName}
                            onChange={(e) => setContactInfo({ ...contactInfo, lastName: e.target.value })}
                            className="input-field mt-1"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="input-label text-sm">Email Address *</label>
                        <div className="relative mt-1">
                          <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                          <input
                            type="email"
                            value={contactInfo.email}
                            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                            className="input-field pl-10"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="input-label text-sm">Phone Number</label>
                        <div className="relative mt-1">
                          <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                          <input
                            type="tel"
                            value={contactInfo.phone}
                            onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                            className="input-field pl-10"
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="input-label text-sm">Street Address</label>
                        <div className="relative mt-1">
                          <HiHome className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                          <input
                            type="text"
                            value={contactInfo.address}
                            onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                            className="input-field pl-10"
                            placeholder="123 Main St"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="input-label text-sm">City</label>
                          <input
                            type="text"
                            value={contactInfo.city}
                            onChange={(e) => setContactInfo({ ...contactInfo, city: e.target.value })}
                            className="input-field mt-1"
                            placeholder="Miami"
                          />
                        </div>
                        <div>
                          <label className="input-label text-sm">Postal Code</label>
                          <input
                            type="text"
                            value={contactInfo.postalCode}
                            onChange={(e) => setContactInfo({ ...contactInfo, postalCode: e.target.value })}
                            className="input-field mt-1"
                            placeholder="33101"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="input-label text-sm">Country</label>
                        <div className="relative mt-1">
                          <HiGlobeAlt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                          <select
                            value={contactInfo.country}
                            onChange={(e) => setContactInfo({ ...contactInfo, country: e.target.value })}
                            className="input-field pl-10 appearance-none"
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="IN">India</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="input-label text-sm">Special Requests</label>
                        <textarea
                          value={contactInfo.specialRequests}
                          onChange={(e) => setContactInfo({ ...contactInfo, specialRequests: e.target.value })}
                          rows={3}
                          className="input-field resize-none mt-1"
                          placeholder="Any special requirements or preferences for your stay?"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <HiTag className="w-5 h-5 text-[var(--color-primary)]" />
                      Promo Code
                    </h3>
                    {couponDiscount ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30">
                        <div>
                          <p className="text-[var(--color-success)] font-medium">{couponCode}</p>
                          <p className="text-sm text-[var(--color-text-muted)]">
                            Saved ${couponDiscount.discount}
                          </p>
                        </div>
                        <button onClick={removeCoupon} className="text-white/50 hover:text-red-500 transition-colors">
                          <HiX className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter promo code"
                          className="flex-1 input-field uppercase"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={!couponCode || couponLoading}
                          className="btn-primary whitespace-nowrap disabled:opacity-50 px-6"
                        >
                          {couponLoading ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-display font-bold text-white mb-2">
                      Payment Details
                    </h2>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      Enter your payment information to confirm booking
                    </p>
                  </div>
                  
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      pricing={pricing}
                      couponDiscount={couponDiscount}
                      onSuccess={handleCreateBooking}
                    />
                  </Elements>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                {step > 1 && (
                  <button onClick={handlePrevStep} className="btn-outline flex items-center gap-2 px-6 py-3">
                    <HiArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                )}
                {step < 3 && (
                  <button onClick={handleNextStep} className="btn-primary flex items-center gap-2 px-6 py-3 ml-auto">
                    Continue
                    <HiArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 glass rounded-2xl p-6 space-y-5">
                {/* Property Info */}
                <div className="flex gap-3">
                  <img
                    src={property?.images?.find(img => img.isPrimary)?.url || property?.images?.[0]?.url || '/placeholder.jpg'}
                    alt={property?.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold line-clamp-2 text-sm">{property?.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <HiStar className="w-3 h-3 text-[var(--color-primary)]" />
                      <span className="text-sm text-white">{property?.ratings?.average || 0}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">({property?.ratings?.count || 0})</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <HiLocationMarker className="w-3 h-3 text-[var(--color-text-muted)]" />
                      <span className="text-xs text-[var(--color-text-muted)]">{property?.location?.neighborhood}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Selected Dates */}
                {dateRange[0].startDate && dateRange[0].endDate && (
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold text-sm">Your Stay</h4>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <HiCalendar className="w-4 h-4 text-[var(--color-primary)]" />
                      <span className="text-xs">
                        {format(dateRange[0].startDate, 'MMM dd')} - {format(dateRange[0].endDate, 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {differenceInDays(dateRange[0].endDate, dateRange[0].startDate)} nights
                    </p>
                  </div>
                )}

                {/* Guests */}
                <div className="space-y-2">
                  <h4 className="text-white font-semibold text-sm">Guests</h4>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <HiUsers className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="text-xs">
                      {guests.adults} Adults
                      {guests.children > 0 && `, ${guests.children} Children`}
                      {guests.infants > 0 && `, ${guests.infants} Infants`}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Price Breakdown */}
                {pricing && (
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">Price Details</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-[var(--color-text-secondary)]">
                        <span>{formatCurrency(pricing.nightlyRate)} x {pricing.nights} nights</span>
                        <span>{formatCurrency(pricing.baseTotal)}</span>
                      </div>
                      <div className="flex justify-between text-[var(--color-text-secondary)]">
                        <span>Cleaning fee</span>
                        <span>{formatCurrency(pricing.cleaningFee)}</span>
                      </div>
                      <div className="flex justify-between text-[var(--color-text-secondary)]">
                        <span>Service fee</span>
                        <span>{formatCurrency(pricing.serviceFee)}</span>
                      </div>
                      {couponDiscount && (
                        <div className="flex justify-between text-[var(--color-success)]">
                          <span>Discount</span>
                          <span>-{formatCurrency(couponDiscount.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[var(--color-text-secondary)]">
                        <span>Taxes</span>
                        <span>{formatCurrency(pricing.taxes)}</span>
                      </div>
                      <div className="h-px bg-white/10 my-2" />
                      <div className="flex justify-between text-white font-semibold">
                        <span>Total</span>
                        <span className="text-lg">{formatCurrency(couponDiscount ? pricing.total - couponDiscount.discount : pricing.total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <HiShieldCheck className="w-4 h-4 text-[var(--color-success)]" />
                    Secure payment processing
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <HiCheck className="w-4 h-4 text-[var(--color-primary)]" />
                    Free cancellation up to 30 days before check-in
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// Payment Form Component
const PaymentForm = ({ pricing, couponDiscount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const finalTotal = couponDiscount ? pricing?.total - couponDiscount.discount : pricing?.total;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError('Stripe is not initialized');
      return;
    }

    if (!pricing || !finalTotal) {
      setError('Invalid payment amount');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);
      
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      await onSuccess(paymentMethod.id);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="input-label text-sm">Card Information</label>
        <div className="p-4 rounded-xl border border-white/10 bg-[var(--color-bg-dark)] mt-2">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#F5F5F7',
                  fontFamily: 'inherit',
                  '::placeholder': {
                    color: '#6B7280',
                  },
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
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm flex items-center gap-2">
          <HiInformationCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {processing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <HiCreditCard className="w-5 h-5" />
            Confirm & Pay {formatCurrency(finalTotal || 0)}
          </>
        )}
      </button>
      
      <p className="text-xs text-center text-[var(--color-text-muted)]">
        By confirming your booking, you agree to our Terms of Service and Cancellation Policy
      </p>
    </form>
  );
};

export default BookingPage;