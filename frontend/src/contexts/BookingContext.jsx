import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiService from '../config/api';
import { useAuth } from './AuthContext';

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
    
    if (checkIn && checkOut) {
      calculatePricing(checkIn, checkOut);
    }
  }, []);

  // Set guests
  const setGuests = useCallback((guests) => {
    setBookingData(prev => ({
      ...prev,
      guests: { ...prev.guests, ...guests },
    }));
  }, []);

  // Calculate pricing
  const calculatePricing = useCallback((checkIn, checkOut) => {
    const property = bookingData.property;
    if (!property || !checkIn || !checkOut) return;

    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const basePrice = property.pricing.basePrice;
    const baseTotal = basePrice * nights;
    const cleaningFee = property.pricing.cleaningFee || 0;
    const serviceFee = property.pricing.serviceFee || 0;
    const taxRate = property.pricing.taxRate / 100 || 0.135;
    const subtotal = baseTotal + cleaningFee + serviceFee;
    const taxes = subtotal * taxRate;
    const total = subtotal + taxes - (couponDiscount?.discount || 0);

    setPricing({
      nightlyRate: basePrice,
      nights,
      baseTotal,
      cleaningFee,
      serviceFee,
      subtotal,
      taxes,
      discount: couponDiscount?.discount || 0,
      total,
    });
  }, [bookingData.property, couponDiscount]);

  // Validate coupon
  const validateCoupon = useCallback(async (code) => {
    if (!code || !bookingData.property) return;

    try {
      setLoading(true);
      const response = await apiService.validateCoupon({
        code,
        bookingAmount: pricing?.baseTotal || 0,
        nights: pricing?.nights || 1,
        propertyId: bookingData.propertyId,
      });

      if (response.data.success) {
        setCouponDiscount(response.data);
        setBookingData(prev => ({ ...prev, couponCode: code }));
        toast.success(`Coupon applied! You saved $${response.data.discount}`);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid coupon code';
      toast.error(message);
      setCouponDiscount(null);
      setBookingData(prev => ({ ...prev, couponCode: '' }));
    } finally {
      setLoading(false);
    }
  }, [bookingData.property, bookingData.propertyId, pricing]);

  // Remove coupon
  const removeCoupon = useCallback(() => {
    setCouponDiscount(null);
    setBookingData(prev => ({ ...prev, couponCode: '' }));
    toast.success('Coupon removed');
  }, []);

  // Create booking
  const createBooking = useCallback(async (paymentMethodId) => {
    if (!isAuthenticated) {
      toast.error('Please login to book');
      return null;
    }

    try {
      setLoading(true);
      
      const response = await apiService.createBooking({
        propertyId: bookingData.propertyId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        couponCode: bookingData.couponCode || undefined,
        specialRequests: bookingData.specialRequests,
      });

      const booking = response.data.booking;
      setCurrentBooking(booking);
      
      // Process payment
      if (paymentMethodId) {
        const paymentResponse = await apiService.createPaymentIntent({
          bookingId: booking._id,
          paymentMethodId,
        });

        toast.success('Booking created! Redirecting to payment...');
        return { booking, clientSecret: paymentResponse.data.clientSecret };
      }

      toast.success('Booking created successfully!');
      return { booking };
    } catch (error) {
      const message = error.response?.data?.message || 'Booking failed';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, bookingData]);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId, reason) => {
    try {
      setLoading(true);
      const response = await apiService.cancelBooking(bookingId, reason);
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
    setStep(prev => Math.min(prev + 1, 3));
  }, []);

  // Previous step
  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

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