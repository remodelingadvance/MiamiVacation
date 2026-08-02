const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'Stay Wise';
const COMPANY_URL = import.meta.env.VITE_APP_URL || 'https://staywise.miami';

export const APP_CONFIG = {
  name: COMPANY_NAME,
  description: 'Premium Vacation Properties in Miami',
  url: COMPANY_URL,
  website: 'staywise.miami',
  email: import.meta.env.VITE_COMPANY_EMAIL || 'info@staywise.miami',
  phone: import.meta.env.VITE_COMPANY_PHONE || '(305) 615-3735',
  phoneHref: import.meta.env.VITE_COMPANY_PHONE_HREF || '+13056153735',
  address: import.meta.env.VITE_COMPANY_ADDRESS || '1717 N Bayshore Dr. Ste R217, Miami, FL',
  social: {
    instagram: import.meta.env.VITE_COMPANY_INSTAGRAM || '#',
    facebook: import.meta.env.VITE_COMPANY_FACEBOOK || '#',
    twitter: import.meta.env.VITE_COMPANY_TWITTER || '#',
    pinterest: import.meta.env.VITE_COMPANY_PINTEREST || '#',
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