import crypto from 'crypto';

// Generate random string
export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate booking number
export const generateBookingNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MIA${year}${month}${random}`;
};

// Format currency
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Calculate nights between two dates
export const calculateNights = (checkIn, checkOut) => {
  const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Calculate total price - FIXED VERSION
export const calculateTotalPrice = (
  basePrice,
  nights,
  options = {}
) => {
  const {
    cleaningFee = 0,
    serviceFee = 0,
    taxRate = 13.5,
    weekendMultiplier = 1.2,
    discount = 0,
  } = options;

  // Calculate base total (with weekend multiplier if needed)
  let baseTotal = basePrice * nights;
  
  // Apply weekend multiplier (for simplicity, we'll apply to all nights)
  // In production, you'd check each date individually
  // baseTotal = baseTotal * weekendMultiplier;
  
  const subtotal = baseTotal + cleaningFee + serviceFee;
  const tax = subtotal * (taxRate / 100);
  const totalBeforeDiscount = subtotal + tax;
  const finalTotal = totalBeforeDiscount - discount;

  return {
    nightlyRate: basePrice,
    nights: nights,
    baseTotal: Math.round(baseTotal * 100) / 100,
    cleaningFee: Math.round(cleaningFee * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    taxes: Math.round(tax * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(finalTotal * 100) / 100,
  };
};

// Check if date is weekend
export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

// Pagination helper
export const getPaginationData = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null,
  };
};

// Slugify string
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Sanitize object (remove sensitive fields)
export const sanitizeUser = (user) => {
  const sanitized = user.toObject();
  delete sanitized.password;
  delete sanitized.resetPasswordToken;
  delete sanitized.resetPasswordExpires;
  delete sanitized.verificationToken;
  delete sanitized.verificationTokenExpires;
  delete sanitized.verificationCode;
  delete sanitized.verificationCodeExpires;
  delete sanitized.verificationCodeAttempts;
  delete sanitized.refreshToken;
  delete sanitized.loginAttempts;
  return sanitized;
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Validate phone format
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[0-9\s().-]{7,20}$/;
  return phoneRegex.test(phone);
};

// Get date range array
export const getDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// Merge objects deeply
export const deepMerge = (target, source) => {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
};

const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};
