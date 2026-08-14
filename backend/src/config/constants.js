// Application constants
export const COMPANY_INFO = {
  name: process.env.COMPANY_NAME || 'Stay Wise Miami',
  email: process.env.COMPANY_EMAIL || 'info@staywise.miami',
  phone: process.env.COMPANY_PHONE || '(305) 615-3735',
  phoneHref: process.env.COMPANY_PHONE_E164 || '+13056153735',
  address: process.env.COMPANY_ADDRESS || '1717 N Bayshore Dr. Ste R217, Miami, FL',
  url: process.env.COMPANY_URL || 'https://www.staywise.miami',
};
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super-admin',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
};

export const PROPERTY_TYPE = {
  CONDO: 'condo',
  VILLA: 'villa',
  PENTHOUSE: 'penthouse',
  APARTMENT: 'apartment',
  STUDIO: 'studio',
  HOUSE: 'house',
  MANSION: 'mansion',
};

export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged',
};

export const CONTACT_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
  REPLIED: 'replied',
  RESOLVED: 'resolved',
  SPAM: 'spam',
};

export const COUPON_TYPE = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
};

export const CANCELLATION_POLICY = {
  FLEXIBLE: 'flexible',    // Full refund up to 1 day before
  MODERATE: 'moderate',    // Full refund up to 5 days before
  STRICT: 'strict',        // 50% refund up to 1 week before
  NON_REFUNDABLE: 'non_refundable', // No refund
};

export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024,  // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  AVATAR: 5 * 1024 * 1024,  // 5MB
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const AMENITY_CATEGORIES = {
  BASIC: 'basic',
  KITCHEN: 'kitchen',
  BATHROOM: 'bathroom',
  OUTDOOR: 'outdoor',
  ENTERTAINMENT: 'entertainment',
  SAFETY: 'safety',
  ACCESSIBILITY: 'accessibility',
  OTHER: 'other',
};

export default {
  COMPANY_INFO,
  ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PROPERTY_TYPE,
  REVIEW_STATUS,
  CONTACT_STATUS,
  COUPON_TYPE,
  CANCELLATION_POLICY,
  FILE_SIZE_LIMITS,
  PAGINATION,
  AMENITY_CATEGORIES,
};
