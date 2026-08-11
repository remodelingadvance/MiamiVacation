import { format, formatDistance, parseISO, differenceInDays } from 'date-fns';

// Format currency
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (!amount && amount !== 0) return '$0';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

// Format relative time
export const formatTimeAgo = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

// Calculate nights
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  return differenceInDays(new Date(checkOut), new Date(checkIn));
};

// Generate star rating
export const generateStars = (rating, maxStars = 5) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push('full');
  }
  if (hasHalfStar) {
    stars.push('half');
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push('empty');
  }

  return stars;
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Get image URL with fallback
export const getImageUrl = (url, fallback = '/placeholder-property.jpg') => {
  if (!url) return fallback;
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_IMAGE_URL || ''}${url}`;
};

// Get initials from name
export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

// Calculate total price for display
// Calculate total price for display
export const calculateDisplayPrice = (property, nights) => {
  if (!property || !property.pricing) {
    return {
      nightlyRate: 0,
      nights: nights || 0,
      baseTotal: 0,
      cleaningFee: 0,
      serviceFee: 0,
      taxes: 0,
      discount: 0,
      total: 0,
    };
  }
  
  const basePrice = property.pricing.basePrice || 0;
  const cleaningFee = property.pricing.cleaningFee || 0;
  const serviceFee = property.pricing.serviceFee || 0;
  const taxRate = (property.pricing.taxRate || 13.5) / 100;
  
  const baseTotal = basePrice * (nights || 0);
  const subtotal = baseTotal + cleaningFee + serviceFee;
  const taxes = subtotal * taxRate;
  const total = subtotal + taxes;
  
  return {
    nightlyRate: basePrice,
    nights: nights || 0,
    baseTotal: Math.round(baseTotal * 100) / 100,
    cleaningFee: Math.round(cleaningFee * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    taxes: Math.round(taxes * 100) / 100,
    discount: 0,
    total: Math.round(total * 100) / 100,
  };
};
