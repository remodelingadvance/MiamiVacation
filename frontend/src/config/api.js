// config/api.js - Frontend User API Service
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
    // ============ AUTH ============
    login: (credentials) => api.post('/auth/login', credentials),
    signup: (userData) => api.post('/auth/signup', userData),
    firebaseAuth: (data) => api.post('/auth/firebase', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.patch('/auth/update-profile', data),
    updatePassword: (data) => api.patch('/auth/update-password', data),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
    verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
    verifyEmailCode: (data) => api.post('/auth/verify-email-code', data),
    resendVerificationCode: (data) => api.post('/auth/resend-verification-code', data),
    refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),

    // ============ PROPERTIES ============
    getProperties: (params) => api.get('/properties', { params }),
    getFeaturedProperties: () => api.get('/properties/featured'),
    getPropertyNeighborhoods: () => api.get('/properties/neighborhoods'),
    getProperty: (id) => api.get(`/properties/${id}`),
    getPropertyBySlug: (slug) => api.get(`/properties/slug/${slug}`),
    searchProperties: (params) => api.get('/properties/search', { params }),
    checkAvailability: (id, params) => api.get(`/properties/${id}/availability`, { params }),
    getPropertyRateCalendar: (propertyId, params) =>
        api.get(`/properties/${propertyId}/rate-calendar`, { params }),
    
    // Maintenance dates - ADD THIS
    getMaintenanceDates: (propertyId) => api.get(`/properties/${propertyId}/maintenance-dates`),

    // ============ BOOKINGS ============
    createBooking: (data) => api.post('/bookings', data),
    getMyBookings: () => api.get('/bookings/my-bookings'),
    getBooking: (id) => api.get(`/bookings/${id}`),
    cancelBooking: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
    getPropertyBookings: (propertyId) => api.get(`/properties/${propertyId}/bookings`),
    
    // Check availability for booking - ADD THIS
    checkBookingAvailability: (propertyId, checkIn, checkOut) => 
        api.get(`/bookings/check-availability?propertyId=${propertyId}&checkIn=${checkIn}&checkOut=${checkOut}`),

    // ============ PAYMENTS ============
    createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data),
    confirmPayment: (data) => api.post('/payments/confirm', data),
    createCheckoutSession: (data) => api.post('/payments/create-checkout-session', data),

    // ============ REVIEWS ============
    getPropertyReviews: (propertyId, params) => api.get(`/reviews/property/${propertyId}`, { params }),
    createReview: (data) => api.post('/reviews', data),
    updateReview: (id, data) => api.patch(`/reviews/${id}`, data),
    deleteReview: (id) => api.delete(`/reviews/${id}`),
    markHelpful: (id, vote) => api.post(`/reviews/${id}/helpful`, { vote }),

    // ============ COUPONS ============
    validateCoupon: (data) => api.post('/coupons/validate', data),

    // ============ CONTACT ============
    submitContact: (data) => api.post('/contact', data),

    // ============ NEWSLETTER ============
    subscribeNewsletter: (data) => api.post('/newsletter/subscribe', data),
    unsubscribeNewsletter: (email) => api.post('/newsletter/unsubscribe', { email }),

    // ============ USER / FAVORITES ============
    getFavorites: () => api.get('/users/favorites'),
    addToFavorites: (propertyId) => api.post(`/users/favorites/${propertyId}`),
    removeFromFavorites: (propertyId) => api.delete(`/users/favorites/${propertyId}`),
    getUserReviews: () => api.get('/users/reviews'),

    // ============ UPLOAD ============
    uploadImage: (formData) => api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    uploadImages: (formData) => api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),

    // ============ GENERIC METHODS ============
    get: (url, config) => api.get(url, config),
    post: (url, data, config) => api.post(url, data, config),
    patch: (url, data, config) => api.patch(url, data, config),
    delete: (url, config) => api.delete(url, config),
    put: (url, data, config) => api.put(url, data, config),
};

export { api };
export default apiService;
