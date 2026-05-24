import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, addDays, differenceInDays } from 'date-fns';
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
} from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiService from '../config/api';
import { formatCurrency, calculateNights } from '../utils/helpers';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const BookingPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    bookingData,
    pricing,
    couponDiscount,
    loading: bookingLoading,
    step,
    setProperty,
    setDates,
    setGuests,
    validateCoupon,
    removeCoupon,
    createBooking,
    nextStep,
    prevStep,
  } = useBooking();

  const [property, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 4),
      key: 'selection',
    },
  ]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await apiService.getProperty(propertyId);
        setPropertyData(response.data.property);
        setProperty(response.data.property);
      } catch (error) {
        toast.error('Property not found');
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  useEffect(() => {
    if (dateRange[0].startDate && dateRange[0].endDate) {
      setDates(dateRange[0].startDate, dateRange[0].endDate);
    }
  }, [dateRange]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    await validateCoupon(couponCode);
    setCouponLoading(false);
  };

  const handleSubmitBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to complete your booking');
      navigate('/login');
      return;
    }

    const result = await createBooking();
    if (result) {
      navigate(`/booking/confirmation/${result.booking._id}`);
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
                <div className="skeleton h-64 rounded-2xl" />
                <div className="skeleton h-32 rounded-2xl" />
              </div>
              <div className="skeleton h-96 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Progress steps */}
          <div className="flex items-center gap-4 mb-12">
            {['Dates', 'Guests & Extras', 'Payment'].map((stepName, index) => (
              <div key={stepName} className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step > index + 1
                      ? 'bg-[var(--color-success)] text-white'
                      : step === index + 1
                      ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {step > index + 1 ? <HiCheck className="w-5 h-5" /> : index + 1}
                </div>
                <span className={`text-sm font-medium ${
                  step >= index + 1 ? 'text-white' : 'text-white/40'
                }`}>
                  {stepName}
                </span>
                {index < 2 && <div className="flex-1 h-px bg-white/10" />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Step 1: Dates */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass rounded-2xl p-6"
                >
                  <h2 className="text-2xl font-display font-bold text-white mb-6">
                    Select Your Dates
                  </h2>
                  <div className="flex justify-center">
                    <DateRange
                      editableDateInputs={true}
                      onChange={(item) => setDateRange([item.selection])}
                      moveRangeOnFirstSelection={false}
                      ranges={dateRange}
                      minDate={new Date()}
                      rangeColors={['#C8A97E']}
                      className="rounded-xl overflow-hidden"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Guests */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass rounded-2xl p-6 space-y-6"
                >
                  <h2 className="text-2xl font-display font-bold text-white">
                    Number of Guests
                  </h2>
                  
                  {[
                    { label: 'Adults', key: 'adults', min: 1, max: property?.details.maxGuests },
                    { label: 'Children', key: 'children', min: 0, max: property?.details.maxGuests, description: 'Ages 2-12' },
                    { label: 'Infants', key: 'infants', min: 0, max: 5, description: 'Under 2' },
                  ].map((guestType) => (
                    <div key={guestType.key} className="flex items-center justify-between py-4 border-b border-white/10">
                      <div>
                        <p className="text-white font-medium">{guestType.label}</p>
                        {guestType.description && (
                          <p className="text-sm text-[var(--color-text-muted)]">{guestType.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setGuests({
                            [guestType.key]: Math.max(guestType.min, (bookingData.guests[guestType.key] || 0) - 1),
                          })}
                          className="w-8 h-8 rounded-full glass-light flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-30"
                          disabled={bookingData.guests[guestType.key] <= guestType.min}
                        >
                          -
                        </button>
                        <span className="text-white font-semibold w-8 text-center">
                          {bookingData.guests[guestType.key] || guestType.min}
                        </span>
                        <button
                          onClick={() => setGuests({
                            [guestType.key]: Math.min(guestType.max, (bookingData.guests[guestType.key] || 0) + 1),
                          })}
                          className="w-8 h-8 rounded-full glass-light flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-30"
                          disabled={bookingData.guests[guestType.key] >= guestType.max}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Coupon code */}
                  <div className="pt-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <HiTag className="w-5 h-5 text-[var(--color-primary)]" />
                      Promo Code
                    </h3>
                    {couponDiscount ? (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/30">
                        <div>
                          <p className="text-[var(--color-success)] font-medium">{couponDiscount.coupon.code}</p>
                          <p className="text-sm text-[var(--color-text-muted)]">
                            {couponDiscount.coupon.type === 'percentage'
                              ? `${couponDiscount.coupon.value}% off`
                              : `$${couponDiscount.coupon.value} off`}
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
                          className="btn-primary whitespace-nowrap disabled:opacity-50"
                        >
                          {couponLoading ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Special requests */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Special Requests (Optional)
                    </h3>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => useBooking().setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                      placeholder="Any special requirements or preferences?"
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass rounded-2xl p-6 space-y-6"
                >
                  <h2 className="text-2xl font-display font-bold text-white">
                    Payment Details
                  </h2>

                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      bookingData={bookingData}
                      pricing={pricing}
                      onSuccess={handleSubmitBooking}
                      onBack={prevStep}
                    />
                  </Elements>
                </motion.div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between">
                {step > 1 && (
                  <button onClick={prevStep} className="btn-outline flex items-center gap-2">
                    <HiArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                )}
                <div className="ml-auto">
                  {step < 3 ? (
                    <button onClick={nextStep} className="btn-primary flex items-center gap-2">
                      Continue
                      <HiArrowRight className="w-5 h-5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Sidebar - Booking summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 glass rounded-2xl p-6 space-y-6">
                {/* Property info */}
                <div className="flex gap-4">
                  <img
                    src={property?.images?.[0]?.url || '/placeholder.jpg'}
                    alt={property?.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{property?.name}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{property?.type}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <HiStar className="w-4 h-4 text-[var(--color-primary)]" />
                      <span className="text-sm text-white">{property?.ratings?.average}</span>
                    </div>
                  </div>
                </div>

                <div className="divider" />

                {/* Price breakdown */}
                {pricing && (
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Price Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-[var(--color-text-secondary)]">
                        <span>
                          ${pricing.nightlyRate} x {pricing.nights} nights
                        </span>
                        <span>${pricing.baseTotal}</span>
                      </div>
                      <div className="flex justify-between text-[var(--color-text-secondary)]">
                        <span>Cleaning fee</span>
                        <span>${pricing.cleaningFee}</span>
                      </div>
                      <div className="flex justify-between text-[var(--color-text-secondary)]">
                        <span>Service fee</span>
                        <span>${pricing.serviceFee}</span>
                      </div>
                      {pricing.discount > 0 && (
                        <div className="flex justify-between text-[var(--color-success)]">
                          <span>Discount</span>
                          <span>-${pricing.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[var(--color-text-secondary)]">
                        <span>Taxes</span>
                        <span>${pricing.taxes}</span>
                      </div>
                      <div className="divider" />
                      <div className="flex justify-between text-white font-semibold text-lg">
                        <span>Total</span>
                        <span>${pricing.total}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <HiCalendar className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>
                      {dateRange[0].startDate
                        ? format(dateRange[0].startDate, 'MMM dd, yyyy')
                        : 'Select dates'}{' '}
                      -{' '}
                      {dateRange[0].endDate
                        ? format(dateRange[0].endDate, 'MMM dd, yyyy')
                        : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <HiUsers className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>
                      {bookingData.guests.adults + bookingData.guests.children} guests
                    </span>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <HiShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                    Secure payment
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <HiCheck className="w-4 h-4 text-[var(--color-primary)]" />
                    Free cancellation up to 48 hours
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

// Payment form component
const PaymentForm = ({ bookingData, pricing, onSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      await onSuccess(paymentMethod.id);
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      <div>
        <label className="input-label">Card Information</label>
        <div className="p-4 rounded-lg border border-white/10 bg-[var(--color-bg-dark)]">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#F5F5F7',
                  '::placeholder': {
                    color: '#6B7280',
                  },
                },
                invalid: {
                  color: '#EF4444',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm flex items-center gap-2">
          <HiInformationCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <HiShieldCheck className="w-4 h-4 text-[var(--color-success)]" />
        Your payment information is encrypted and secure
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {processing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <HiCreditCard className="w-5 h-5" />
            Pay ${pricing?.total || 0}
          </>
        )}
      </button>
    </form>
  );
};

export default BookingPage;