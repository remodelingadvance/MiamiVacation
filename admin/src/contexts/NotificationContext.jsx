import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import adminApi from '../config/api';
import { useAdminAuth } from './AdminAuthContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, user } = useAdminAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState(null);
    const [sidebarBadges, setSidebarBadges] = useState({
        pendingReviews: 0,
        unreadContacts: 0,
        activeCoupons: 0,
        pendingBookings: 0,
        unreadNotifications: 0,
        newsletterStats: 0,
    });
    
    // Use refs to prevent multiple simultaneous requests
    const fetchingRef = useRef(false);
    const lastFetchTime = useRef(0);
    const FETCH_INTERVAL = 30000; // 30 seconds

    // Connect to Socket.io
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const token = localStorage.getItem('mlr_admin_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        const newSocket = io(API_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
        });

        newSocket.on('admin:new-notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            // Refresh badges when new notification arrives
            fetchSidebarBadges();

            // Show toast for high priority
            if (notification.priority === 'high' || notification.priority === 'urgent') {
                toast(notification.title, {
                    icon: notification.type === 'payment_received' ? '💰' :
                        notification.type === 'new_booking' ? '🎉' : '🔔',
                    duration: 5000,
                });
            }
        });

        newSocket.on('admin:notification-updated', (updatedNotification) => {
            setNotifications(prev =>
                prev.map(n => n._id === updatedNotification._id ? updatedNotification : n)
            );
            fetchUnreadCount();
        });

        newSocket.on('admin:all-marked-read', () => {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            fetchSidebarBadges();
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, user]);

    // Fetch initial notifications
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            fetchUnreadCount();
            fetchSidebarBadges();

            // Poll for new notifications every 30 seconds
            const interval = setInterval(() => {
                fetchUnreadCount();
                fetchSidebarBadges();
            }, FETCH_INTERVAL);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchNotifications = async (page = 1) => {
        try {
            setLoading(true);
            const response = await adminApi.getNotifications({ page, limit: 50 });
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            if (error.response?.status !== 429) {
                console.error('Failed to fetch notifications:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await adminApi.getUnreadCount();
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            if (error.response?.status !== 429) {
                console.error('Failed to fetch unread count:', error);
            }
        }
    };

    // Fetch real counts from API for sidebar badges
    const fetchSidebarBadges = useCallback(async () => {
        // Prevent multiple simultaneous requests
        if (fetchingRef.current) return;
        
        // Throttle requests (don't fetch more than once every 5 seconds)
        const now = Date.now();
        if (now - lastFetchTime.current < 5000) {
            console.log('Throttling badge fetch');
            return;
        }
        
        fetchingRef.current = true;
        lastFetchTime.current = now;
        
        try {
            console.log('Fetching sidebar badges...');
            
            // Get pending reviews count
            let pendingReviews = 0;
            try {
                const reviewsRes = await adminApi.getAllReviews({ status: 'pending', limit: 1 });
                pendingReviews = reviewsRes.data?.total || reviewsRes.data?.count || 0;
                console.log('Pending reviews:', pendingReviews);
            } catch (e) {
                console.error('Failed to fetch reviews count:', e);
            }
            
            // Get unread contacts count
            let unreadContacts = 0;
            try {
                const contactsRes = await adminApi.getContacts({ status: 'unread', limit: 1 });
                unreadContacts = contactsRes.data?.total || contactsRes.data?.count || 0;
                console.log('Unread contacts:', unreadContacts);
            } catch (e) {
                console.error('Failed to fetch contacts count:', e);
            }
            
            // Get pending bookings count
            let pendingBookings = 0;
            try {
                const bookingsRes = await adminApi.getAllBookings({ status: 'pending', limit: 1 });
                pendingBookings = bookingsRes.data?.total || bookingsRes.data?.count || 0;
                console.log('Pending bookings:', pendingBookings);
            } catch (e) {
                console.error('Failed to fetch bookings count:', e);
            }
            
            // Get active coupons count
            let activeCoupons = 0;
            try {
                const couponsRes = await adminApi.getCoupons();
                if (couponsRes.data?.coupons) {
                    activeCoupons = couponsRes.data.coupons.filter(c => c.status === 'active').length;
                }
                console.log('Active coupons:', activeCoupons);
            } catch (e) {
                console.error('Failed to fetch coupons count:', e);
            }
            
            // Get newsletter subscribers count
            let newsletterStats = 0;
            try {
                const newsletterRes = await adminApi.getSubscribers({ status: 'active', limit: 1 });
                newsletterStats = newsletterRes.data?.total || newsletterRes.data?.count || 0;
                console.log('Newsletter subscribers:', newsletterStats);
            } catch (e) {
                console.error('Failed to fetch newsletter count:', e);
            }

            const newBadges = {
                pendingReviews,
                unreadContacts,
                activeCoupons,
                pendingBookings,
                unreadNotifications: unreadCount,
                newsletterStats,
            };

            console.log('Badges updated:', newBadges);
            setSidebarBadges(newBadges);

            return newBadges;
        } catch (error) {
            console.error('Failed to fetch sidebar badges:', error);
            return null;
        } finally {
            fetchingRef.current = false;
        }
    }, [unreadCount]);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await adminApi.markNotificationRead(notificationId);

            if (socket) {
                socket.emit('admin:mark-notification-read', notificationId);
            }

            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            fetchSidebarBadges();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }, [socket, fetchSidebarBadges]);

    const markAllAsRead = useCallback(async () => {
        try {
            await adminApi.markAllNotificationsRead();

            if (socket) {
                socket.emit('admin:mark-all-read');
            }

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            fetchSidebarBadges();
            return true;
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            return false;
        }
    }, [socket, fetchSidebarBadges]);

    const deleteNotification = useCallback(async (notificationId) => {
        try {
            await adminApi.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            if (!notifications.find(n => n._id === notificationId)?.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            fetchSidebarBadges();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    }, [notifications, fetchSidebarBadges]);

    // Function to reset badge after visiting a page
    const resetBadge = useCallback(async (type) => {
        try {
            console.log(`Resetting badge for type: ${type}`);
            switch (type) {
                case 'contacts':
                    await adminApi.markAllContactsRead();
                    break;
                case 'reviews':
                    await adminApi.markAllReviewsViewed();
                    break;
                case 'bookings':
                    await adminApi.markAllBookingsViewed();
                    break;
                case 'notifications':
                    await markAllAsRead();
                    break;
                default:
                    break;
            }
            // Refresh badges after reset
            await fetchSidebarBadges();
            return true;
        } catch (error) {
            console.error(`Failed to reset ${type} badge:`, error);
            return false;
        }
    }, [markAllAsRead, fetchSidebarBadges]);

    const value = {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        socket,
        sidebarBadges,
        fetchSidebarBadges,
        resetBadge,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;