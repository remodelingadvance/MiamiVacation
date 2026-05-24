export const APP_CONFIG = {
  name: 'Miami Luxury Rentals',
  description: 'Premium Vacation Properties in Miami',
  url: 'https://miamiluxuryrentals.com',
  email: 'info@miamiluxuryrentals.com',
  phone: '+1 (305) 123-4567',
  address: '1000 Ocean Drive, Miami Beach, FL 33139',
  social: {
    instagram: 'https://instagram.com/miamiluxuryrentals',
    facebook: 'https://facebook.com/miamiluxuryrentals',
    twitter: 'https://twitter.com/miamirentals',
    pinterest: 'https://pinterest.com/miamiluxuryrentals',
  },
};

export const PROPERTY_TYPES = [
  { value: 'condo', label: 'Condo' },
  { value: 'villa', label: 'Villa' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'studio', label: 'Studio' },
  { value: 'house', label: 'House' },
  { value: 'mansion', label: 'Mansion' },
];

export const AMENITIES = [
  { category: 'basic', amenities: [
    { value: 'wifi', label: 'WiFi', icon: '📶' },
    { value: 'ac', label: 'Air Conditioning', icon: '❄️' },
    { value: 'heating', label: 'Heating', icon: '🔥' },
    { value: 'washer', label: 'Washer', icon: '🧺' },
    { value: 'dryer', label: 'Dryer', icon: '👕' },
    { value: 'parking', label: 'Free Parking', icon: '🚗' },
  ]},
  { category: 'kitchen', amenities: [
    { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
    { value: 'dishwasher', label: 'Dishwasher', icon: '🧼' },
    { value: 'microwave', label: 'Microwave', icon: '📡' },
    { value: 'coffee', label: 'Coffee Maker', icon: '☕' },
  ]},
  { category: 'outdoor', amenities: [
    { value: 'pool', label: 'Pool', icon: '🏊' },
    { value: 'hot_tub', label: 'Hot Tub', icon: '🛁' },
    { value: 'balcony', label: 'Balcony', icon: '🌅' },
    { value: 'garden', label: 'Garden', icon: '🌿' },
    { value: 'bbq', label: 'BBQ Grill', icon: '🍖' },
  ]},
  { category: 'entertainment', amenities: [
    { value: 'tv', label: 'TV', icon: '📺' },
    { value: 'gym', label: 'Gym', icon: '💪' },
    { value: 'theater', label: 'Home Theater', icon: '🎬' },
    { value: 'games', label: 'Game Room', icon: '🎮' },
  ]},
  { category: 'safety', amenities: [
    { value: 'security', label: 'Security System', icon: '🔒' },
    { value: 'smoke_alarm', label: 'Smoke Alarm', icon: '🚨' },
    { value: 'first_aid', label: 'First Aid Kit', icon: '🏥' },
  ]},
];

export const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'bedrooms_desc', label: 'Most Bedrooms' },
  { value: 'newest', label: 'Newest First' },
];

export const CURRENCY = 'USD';
export const TAX_RATE = 0.135;
export const SERVICE_FEE_RATE = 0.10;