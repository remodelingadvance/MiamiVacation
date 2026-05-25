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
    markAllBookingsViewed: () => api.post('/bookings/mark-all-viewed'),

    // Users
    getUsers: (params) => api.get('/admin/users', { params }),
    getUser: (id) => api.get(`/admin/users/${id}`),
    updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),

    // Reviews
    getAllReviews: (params) => api.get('/reviews/admin/all', { params }),
    moderateReview: (id, data) => api.patch(`/reviews/${id}/moderate`, data),
    markAllReviewsViewed: () => api.post('/reviews/mark-all-viewed'),

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
    markAllContactsRead: () => api.post('/contact/mark-all-read'),

    // Upload
    uploadImage: (formData) => api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    uploadImages: (formData) => api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),

    // Newsletter Subscribers (Admin)
    getSubscribers: (params) => api.get('/newsletter/subscribers', { params }),
    deleteSubscriber: (id) => api.delete(`/newsletter/subscribers/${id}`),
    exportSubscribers: () => api.get('/newsletter/subscribers/export', { responseType: 'blob' }),

    // Newsletter Campaigns (Admin)
    getCampaigns: (params) => api.get('/newsletter-campaigns/campaigns', { params }),
    getCampaign: (id) => api.get(`/newsletter-campaigns/campaigns/${id}`),
    createCampaign: (data) => api.post('/newsletter-campaigns/campaigns', data),
    updateCampaign: (id, data) => api.patch(`/newsletter-campaigns/campaigns/${id}`, data),
    sendCampaign: (id) => api.post(`/newsletter-campaigns/campaigns/${id}/send`),
    deleteCampaign: (id) => api.delete(`/newsletter-campaigns/campaigns/${id}`),

    // Notifications
    getNotifications: (params) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markNotificationRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllNotificationsRead: () => api.patch('/notifications/read-all'),
    deleteNotification: (id) => api.delete(`/notifications/${id}`),
    getNotificationSettings: () => api.get('/notifications/settings'),

    // Analytics
    getAnalytics: (params) => api.get('/admin/analytics', { params }),

    // Generic request methods for custom endpoints
    get: (url, config) => api.get(url, config),
    post: (url, data, config) => api.post(url, data, config),
    patch: (url, data, config) => api.patch(url, data, config),
    delete: (url, config) => api.delete(url, config),
    put: (url, data, config) => api.put(url, data, config),
};

export { api };
export default adminApi;