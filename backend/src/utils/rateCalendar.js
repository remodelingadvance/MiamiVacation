const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const toDateKey = (value) => {
  if (!value) return null;

  if (typeof value === 'string' && DATE_KEY_REGEX.test(value.slice(0, 10))) {
    return value.slice(0, 10);
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
};

export const dateKeyToUTCDate = (dateKey) => new Date(`${dateKey}T00:00:00.000Z`);

export const addDaysToKey = (dateKey, days) => {
  const date = dateKeyToUTCDate(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateKey(date);
};

export const getDateKeysBetween = (startDate, endDate, includeEnd = false) => {
  const startKey = toDateKey(startDate);
  const endKey = toDateKey(endDate);

  if (!startKey || !endKey || startKey > endKey) return [];

  const keys = [];
  let currentKey = startKey;

  while (includeEnd ? currentKey <= endKey : currentKey < endKey) {
    keys.push(currentKey);
    currentKey = addDaysToKey(currentKey, 1);
  }

  return keys;
};

export const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;

const getAvailabilityOverride = (property, dateKey) => {
  const availability = property?.availability || [];
  return availability.find((item) => toDateKey(item.date) === dateKey);
};

const getSeasonalPricing = (property, dateKey) => {
  const seasonalPricing = property?.pricing?.seasonalPricing || [];
  return seasonalPricing.find((season) => {
    const startKey = toDateKey(season.startDate);
    const endKey = toDateKey(season.endDate);
    return startKey && endKey && dateKey >= startKey && dateKey <= endKey;
  });
};

export const getNightlyRate = (property, dateValue) => {
  const dateKey = toDateKey(dateValue);
  const pricing = property?.pricing || {};
  const basePrice = roundMoney(pricing.basePrice || 0);
  const currency = pricing.currency || 'USD';
  const baseMinimumStay = Number(pricing.minimumStay || 1);

  let price = basePrice;
  let minimumStay = baseMinimumStay;
  let source = 'base';

  const seasonal = getSeasonalPricing(property, dateKey);
  if (seasonal?.multiplier) {
    price = roundMoney(basePrice * Number(seasonal.multiplier));
    minimumStay = Math.max(minimumStay, Number(seasonal.minimumStay || minimumStay));
    source = 'seasonal';
  }

  const day = dateKeyToUTCDate(dateKey).getUTCDay();
  const isWeekendNight = day === 5 || day === 6;
  const weekendMultiplier = Number(pricing.weekendMultiplier || 1);
  if (source === 'base' && isWeekendNight && weekendMultiplier > 1) {
    price = roundMoney(basePrice * weekendMultiplier);
    source = 'weekend';
  }

  const override = getAvailabilityOverride(property, dateKey);
  if (override) {
    if (override.price !== undefined && override.price !== null) {
      price = roundMoney(override.price);
      source = 'custom';
    }

    if (override.minimumStay) {
      minimumStay = Number(override.minimumStay);
    }
  }

  return {
    date: dateKey,
    price,
    currency,
    minimumStay,
    isAvailable: override?.isAvailable !== false,
    isCustomPrice: source === 'custom',
    source,
  };
};

const getBookedDateKeys = (bookings = []) => {
  const bookedKeys = new Set();

  bookings.forEach((booking) => {
    getDateKeysBetween(booking.checkIn, booking.checkOut).forEach((dateKey) => {
      bookedKeys.add(dateKey);
    });
  });

  return bookedKeys;
};

const getMaintenanceDateKeys = (maintenanceDates = []) => {
  const maintenanceKeys = new Set();

  maintenanceDates.forEach((item) => {
    getDateKeysBetween(item.startDate, item.endDate, true).forEach((dateKey) => {
      maintenanceKeys.add(dateKey);
    });
  });

  return maintenanceKeys;
};

export const buildRateCalendar = (property, options = {}) => {
  const startKey = toDateKey(options.startDate) || toDateKey(new Date());
  const endKey = toDateKey(options.endDate) || addDaysToKey(startKey, 365);
  const bookings = options.bookings || [];
  const bookedKeys = getBookedDateKeys(bookings);
  const maintenanceKeys = getMaintenanceDateKeys(property?.maintenanceDates || []);

  return getDateKeysBetween(startKey, endKey, true).map((dateKey) => {
    const nightlyRate = getNightlyRate(property, dateKey);
    const isBooked = bookedKeys.has(dateKey);
    const isMaintenance = maintenanceKeys.has(dateKey);
    const isBlocked = nightlyRate.isAvailable === false;

    let status = 'available';
    if (isMaintenance) status = 'maintenance';
    else if (isBooked) status = 'booked';
    else if (isBlocked) status = 'blocked';

    return {
      ...nightlyRate,
      status,
      isBooked,
      isMaintenance,
      isAvailable: status === 'available',
    };
  });
};

export const calculateStayPricing = (property, checkIn, checkOut) => {
  const nightKeys = getDateKeysBetween(checkIn, checkOut);
  const dailyRates = nightKeys.map((dateKey) => getNightlyRate(property, dateKey));
  const baseTotal = roundMoney(dailyRates.reduce((sum, day) => sum + day.price, 0));
  const nights = dailyRates.length;
  const minimumStay = dailyRates.reduce(
    (max, day) => Math.max(max, Number(day.minimumStay || 1)),
    Number(property?.pricing?.minimumStay || 1)
  );

  return {
    nights,
    minimumStay,
    dailyRates,
    baseTotal,
    averageNightlyRate: nights ? roundMoney(baseTotal / nights) : 0,
    currency: property?.pricing?.currency || 'USD',
  };
};

export const calculatePriceBreakdown = (baseTotal, nights, options = {}) => {
  const cleaningFee = roundMoney(options.cleaningFee || 0);
  const serviceFee = roundMoney(options.serviceFee || 0);
  const taxRate = Number(options.taxRate || 0);
  const discount = roundMoney(options.discount || 0);
  const subtotal = roundMoney(baseTotal + cleaningFee + serviceFee);
  const taxes = roundMoney(subtotal * (taxRate / 100));
  const total = roundMoney(Math.max(0, subtotal + taxes - discount));

  return {
    nightlyRate: nights ? roundMoney(baseTotal / nights) : 0,
    nights,
    baseTotal: roundMoney(baseTotal),
    cleaningFee,
    serviceFee,
    subtotal,
    taxes,
    discount,
    total,
  };
};
