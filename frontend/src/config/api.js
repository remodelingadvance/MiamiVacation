import axios from 'axios';
import { getToken, refreshAccessToken, clearAuth } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API service object
const apiService = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/update-profile', data),
  updatePassword: (data) => api.patch('/auth/update-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),

  // Properties
  getProperties: (params) => api.get('/properties', { params }),
  getFeaturedProperties: () => api.get('/properties/featured'),
  getProperty: (id) => api.get(`/properties/${id}`),
  getPropertyBySlug: (slug) => api.get(`/properties/slug/${slug}`),
  searchProperties: (params) => api.get('/properties/search', { params }),
  checkAvailability: (id, params) => api.get(`/properties/${id}/availability`, { params }),

  // Bookings
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getBooking: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),

  // Payments
  createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data),
  confirmPayment: (data) => api.post('/payments/confirm', data),
  createCheckoutSession: (data) => api.post('/payments/create-checkout-session', data),

  // Reviews
  getPropertyReviews: (propertyId, params) => api.get(`/reviews/property/${propertyId}`, { params }),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.patch(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id, vote) => api.post(`/reviews/${id}/helpful`, { vote }),

  // Coupons
  validateCoupon: (data) => api.post('/coupons/validate', data),

  // Contact
  submitContact: (data) => api.post('/contact', data),

  // Newsletter
  subscribeNewsletter: (data) => api.post('/newsletter/subscribe', data),
  unsubscribeNewsletter: (email) => api.post('/newsletter/unsubscribe', { email }),

  // User
  getFavorites: () => api.get('/users/favorites'),
  addToFavorites: (propertyId) => api.post(`/users/favorites/${propertyId}`),
  removeFromFavorites: (propertyId) => api.delete(`/users/favorites/${propertyId}`),
  getUserReviews: () => api.get('/users/reviews'),

  // Upload
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadImages: (formData) => api.post('/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Admin
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllBookings: () => api.get('/bookings/admin/all'),
  updateBookingStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  getAllReviews: (params) => api.get('/reviews/admin/all', { params }),
  moderateReview: (id, data) => api.patch(`/reviews/${id}/moderate`, data),
  getCoupons: () => api.get('/coupons'),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.patch(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  getContacts: (params) => api.get('/contact', { params }),
  getContact: (id) => api.get(`/contact/${id}`),
  replyToContact: (id, message) => api.post(`/contact/${id}/reply`, { message }),
  getSubscribers: (params) => api.get('/newsletter/subscribers', { params }),
};

export { api };
export default apiService;