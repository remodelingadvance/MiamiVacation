import axios from 'axios';

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
    const token = localStorage.getItem('mlr_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mlr_admin_token');
      localStorage.removeItem('mlr_admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

const adminApi = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),

  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),

  // Properties
  getProperties: (params) => api.get('/properties', { params }),
  getProperty: (id) => api.get(`/properties/${id}`),
  createProperty: (data) => api.post('/properties', data),
  updateProperty: (id, data) => api.patch(`/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/properties/${id}`),

  // Bookings
  getAllBookings: (params) => api.get('/bookings/admin/all', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),

  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Reviews
  getAllReviews: (params) => api.get('/reviews/admin/all', { params }),
  moderateReview: (id, data) => api.patch(`/reviews/${id}/moderate`, data),

  // Coupons
  getCoupons: () => api.get('/coupons'),
  getCoupon: (id) => api.get(`/coupons/${id}`),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.patch(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),

  // Contacts
  getContacts: (params) => api.get('/contact', { params }),
  getContact: (id) => api.get(`/contact/${id}`),
  replyToContact: (id, message) => api.post(`/contact/${id}/reply`, { message }),
  updateContactStatus: (id, data) => api.patch(`/contact/${id}/status`, data),

  // Upload
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadImages: (formData) => api.post('/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Newsletter
  getSubscribers: (params) => api.get('/newsletter/subscribers', { params }),

  // Analytics
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};

export { api };
export default adminApi;