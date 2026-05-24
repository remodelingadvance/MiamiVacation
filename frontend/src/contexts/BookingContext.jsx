import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiService from '../config/api';
import { useAuth } from './AuthContext';
import { calculateDisplayPrice, calculateNights } from '../utils/helpers';

const BookingContext = createContext(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [currentBooking, setCurrentBooking] = useState(null);
  const [bookingData, setBookingData] = useState({
    propertyId: null,
    property: null,
    checkIn: null,
    checkOut: null,
    guests: { adults: 1, children: 0, infants: 0 },
    couponCode: '',
    specialRequests: '',
  });
  const [pricing, setPricing] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Dates, 2: Guests, 3: Payment

  // Reset booking data
  const resetBooking = useCallback(() => {
    setBookingData({
      propertyId: null,
      property: null,
      checkIn: null,
      checkOut: null,
      guests: { adults: 1, children: 0, infants: 0 },
      couponCode: '',
      specialRequests: '',
    });
    setPricing(null);
    setCouponDiscount(null);
    setStep(1);
    setLoading(false);
    setCurrentBooking(null);
  }, []);

  // Set property for booking
  const setProperty = useCallback((property) => {
    setBookingData(prev => ({
      ...prev,
      propertyId: property._id,
      property,
    }));
  }, []);

  // Set dates
  const setDates = useCallback((checkIn, checkOut) => {
    setBookingData(prev => ({
      ...prev,
      checkIn,
      checkOut,
    }));
  }, []);

  // Set guests
  const setGuests = useCallback((guests) => {
    setBookingData(prev => ({
      ...prev,
      guests: { ...prev.guests, ...guests },
    }));
  }, []);

  // Update pricing (call this from the component)
  const updatePricing = useCallback((newPricing) => {
    setPricing(newPricing);
  }, []);

  // Calculate pricing internally
  const calculatePricing = useCallback(() => {
    const property = bookingData.property;
    const checkIn = bookingData.checkIn;
    const checkOut = bookingData.checkOut;
    
    if (!property || !checkIn || !checkOut) return null;

    const nights = calculateNights(checkIn, checkOut);
    const calculatedPricing = calculateDisplayPrice(property, nights);
    setPricing(calculatedPricing);
    return calculatedPricing;
  }, [bookingData.property, bookingData.checkIn, bookingData.checkOut]);

  // Validate coupon
  const validateCoupon = useCallback(async (code) => {
    if (!code || !bookingData.property) return;

    try {
      setLoading(true);
      
      // Calculate current total
      const nights = calculateNights(bookingData.checkIn, bookingData.checkOut);
      const currentPricing = calculateDisplayPrice(bookingData.property, nights);
      
      const response = await apiService.validateCoupon({
        code,
        bookingAmount: currentPricing.baseTotal,
        nights: nights,
        propertyId: bookingData.propertyId,
      });

      if (response.data.success) {
        const discountAmount = response.data.discount || response.data.coupon?.discount || 0;
        
        // Update pricing with discount
        const discountedPricing = {
          ...currentPricing,
          discount: discountAmount,
          total: Math.max(0, currentPricing.total - discountAmount),
        };
        
        setPricing(discountedPricing);
        setCouponDiscount({
          discount: discountAmount,
          coupon: response.data.coupon || response.data,
        });
        setBookingData(prev => ({ ...prev, couponCode: code }));
        toast.success(`Coupon applied! You saved $${discountAmount}`);
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid coupon code';
      toast.error(message);
      setCouponDiscount(null);
      setBookingData(prev => ({ ...prev, couponCode: '' }));
      // Recalculate pricing without discount
      calculatePricing();
      return false;
    } finally {
      setLoading(false);
    }
  }, [bookingData.property, bookingData.propertyId, bookingData.checkIn, bookingData.checkOut, calculatePricing]);

  // Remove coupon
  const removeCoupon = useCallback(() => {
    setCouponDiscount(null);
    setBookingData(prev => ({ ...prev, couponCode: '' }));
    // Recalculate pricing without discount
    calculatePricing();
    toast.success('Coupon removed');
  }, [calculatePricing]);

  // Create booking - FIXED VERSION
  const createBooking = useCallback(async (paymentMethodId) => {
    if (!isAuthenticated) {
      toast.error('Please login to book');
      return null;
    }

    // Validate required fields
    if (!bookingData.propertyId || !bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please select dates and property');
      return null;
    }

    // Calculate nights and pricing if not already calculated
    const nights = calculateNights(bookingData.checkIn, bookingData.checkOut);
    let currentPricing = pricing;
    
    if (!currentPricing) {
      currentPricing = calculateDisplayPrice(bookingData.property, nights);
    }
    
    if (!currentPricing || currentPricing.total <= 0) {
      toast.error('Invalid pricing calculation');
      return null;
    }

    try {
      setLoading(true);
      
      // Prepare booking data
      const bookingPayload = {
        propertyId: bookingData.propertyId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        specialRequests: bookingData.specialRequests || '',
      };
      
      // Add coupon code if applied
      if (bookingData.couponCode) {
        bookingPayload.couponCode = bookingData.couponCode;
      }
      
      // Add payment method if provided
      if (paymentMethodId) {
        bookingPayload.paymentMethodId = paymentMethodId;
      }
      
      console.log('Creating booking with payload:', bookingPayload);
      
      const response = await apiService.createBooking(bookingPayload);

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Booking failed');
      }

      const booking = response.data.booking;
      setCurrentBooking(booking);
      
      toast.success('Booking created successfully!');
      return { booking };
      
    } catch (error) {
      console.error('Booking creation error:', error);
      const message = error.response?.data?.message || error.message || 'Booking failed';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, bookingData, pricing]);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId, reason) => {
    try {
      setLoading(true);
      const response = await apiService.cancelBooking(bookingId, { reason });
      toast.success('Booking cancelled successfully');
      return response.data.booking;
    } catch (error) {
      const message = error.response?.data?.message || 'Cancellation failed';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Next step
  const nextStep = useCallback(() => {
    // Validate current step before proceeding
    if (step === 1 && (!bookingData.checkIn || !bookingData.checkOut)) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    if (step === 2 && (!bookingData.guests.adults || bookingData.guests.adults < 1)) {
      toast.error('Please select at least 1 adult guest');
      return;
    }
    setStep(prev => Math.min(prev + 1, 3));
  }, [step, bookingData]);

  // Previous step
  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Auto-calculate pricing when dates or property changes
  useEffect(() => {
    if (bookingData.property && bookingData.checkIn && bookingData.checkOut) {
      const nights = calculateNights(bookingData.checkIn, bookingData.checkOut);
      const calculatedPricing = calculateDisplayPrice(bookingData.property, nights);
      
      // Apply coupon discount if any
      if (couponDiscount && couponDiscount.discount) {
        calculatedPricing.discount = couponDiscount.discount;
        calculatedPricing.total = Math.max(0, calculatedPricing.total - couponDiscount.discount);
      }
      
      setPricing(calculatedPricing);
    }
  }, [bookingData.property, bookingData.checkIn, bookingData.checkOut, couponDiscount]);

  const value = {
    currentBooking,
    bookingData,
    pricing,
    couponDiscount,
    loading,
    step,
    setProperty,
    setDates,
    setGuests,
    calculatePricing,
    updatePricing,
    validateCoupon,
    removeCoupon,
    createBooking,
    cancelBooking,
    nextStep,
    prevStep,
    resetBooking,
    setBookingData,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingContext;