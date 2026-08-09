const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'Stay Wise';
const COMPANY_URL = import.meta.env.VITE_APP_URL || 'https://www.staywise.miami';

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
    { value: 'wifi', label: 'WiFi', icon: 'ðŸ“¶' },
    { value: 'ac', label: 'Air Conditioning', icon: 'â„ï¸' },
    { value: 'heating', label: 'Heating', icon: 'ðŸ”¥' },
    { value: 'washer', label: 'Washer', icon: 'ðŸ§º' },
    { value: 'dryer', label: 'Dryer', icon: 'ðŸ‘•' },
    { value: 'parking', label: 'Free Parking', icon: 'ðŸš—' },
  ]},
  { category: 'kitchen', amenities: [
    { value: 'kitchen', label: 'Kitchen', icon: 'ðŸ³' },
    { value: 'dishwasher', label: 'Dishwasher', icon: 'ðŸ§¼' },
    { value: 'microwave', label: 'Microwave', icon: 'ðŸ“¡' },
    { value: 'coffee', label: 'Coffee Maker', icon: 'â˜•' },
  ]},
  { category: 'outdoor', amenities: [
    { value: 'pool', label: 'Pool', icon: 'ðŸŠ' },
    { value: 'hot_tub', label: 'Hot Tub', icon: 'ðŸ›' },
    { value: 'balcony', label: 'Balcony', icon: 'ðŸŒ…' },
    { value: 'garden', label: 'Garden', icon: 'ðŸŒ¿' },
    { value: 'bbq', label: 'BBQ Grill', icon: 'ðŸ–' },
  ]},
  { category: 'entertainment', amenities: [
    { value: 'tv', label: 'TV', icon: 'ðŸ“º' },
    { value: 'gym', label: 'Gym', icon: 'ðŸ’ª' },
    { value: 'theater', label: 'Home Theater', icon: 'ðŸŽ¬' },
    { value: 'games', label: 'Game Room', icon: 'ðŸŽ®' },
  ]},
  { category: 'safety', amenities: [
    { value: 'security', label: 'Security System', icon: 'ðŸ”’' },
    { value: 'smoke_alarm', label: 'Smoke Alarm', icon: 'ðŸš¨' },
    { value: 'first_aid', label: 'First Aid Kit', icon: 'ðŸ¥' },
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
