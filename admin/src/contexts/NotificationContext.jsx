// contexts/NotificationContext.jsx - Complete fixed version
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
  const { isAuthenticated, user, token } = useAdminAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [sidebarBadges, setSidebarBadges] = useState({
    pendingReviews: 0,
    unreadContacts: 0,
    activeCoupons: 0,
    pendingBookings: 0,
    unreadNotifications: 0,
    newsletterStats: 0,
  });
  
  // Refs for preventing excessive requests
  const fetchingRef = useRef(false);
  const lastFetchTime = useRef(0);
  const lastBadgeFetchTime = useRef(0);
  const mountedRef = useRef(true);
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const badgeIntervalRef = useRef(null);
  
  // Increased intervals to reduce requests
  const FETCH_INTERVAL = 60000; // 60 seconds (was 30)
  const BADGE_FETCH_INTERVAL = 120000; // 120 seconds (2 minutes) - badges don't need frequent updates
  const MIN_REQUEST_INTERVAL = 10000; // Minimum 10 seconds between ANY request

  // Connect to Socket.io
  useEffect(() => {
    if (!isAuthenticated || !user || !token) {
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('admin:new-notification', (notification) => {
      if (!mountedRef.current) return;
      
      console.log('[Socket] New notification:', notification.type);
      
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      setSidebarBadges(prev => ({
        ...prev,
        unreadNotifications: prev.unreadNotifications + 1,
      }));
      
      // Show toast for high priority notifications
      if (notification.priority === 'urgent' || notification.priority === 'high') {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full glass-strong rounded-lg shadow-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className={`w-2 h-2 rounded-full ${
                    notification.priority === 'urgent' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                  }`} />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">{notification.title}</p>
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">{notification.message}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-white/10">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  if (notification.link) {
                    window.location.href = notification.link;
                  }
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-accent)]"
              >
                View
              </button>
            </div>
          </div>
        ), { duration: 5000 });
      }
    });

    newSocket.on('admin:unread-count-update', (count) => {
      if (!mountedRef.current) return;
      console.log('[Socket] Unread count update:', count);
      setUnreadCount(count);
      setSidebarBadges(prev => ({
        ...prev,
        unreadNotifications: count,
      }));
    });

    newSocket.on('admin:all-marked-read', () => {
      if (!mountedRef.current) return;
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      setSidebarBadges(prev => ({
        ...prev,
        unreadNotifications: 0,
      }));
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, user, token]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Clear intervals on unmount
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (badgeIntervalRef.current) clearInterval(badgeIntervalRef.current);
    };
  }, []);

  // Fetch initial data ONCE on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchNotifications(),
          fetchUnreadCount(),
          fetchAllSidebarBadges(),
        ]);
      } catch (error) {
        console.error('[Notification] Initial fetch error:', error);
      }
    };
    
    fetchInitialData();
    
    // Set up polling intervals - REDUCED FREQUENCY
    intervalRef.current = setInterval(() => {
      if (mountedRef.current && isAuthenticated) {
        fetchUnreadCount();
      }
    }, FETCH_INTERVAL);
    
    // Badges fetch less frequently - every 2 minutes
    badgeIntervalRef.current = setInterval(() => {
      if (mountedRef.current && isAuthenticated) {
        fetchAllSidebarBadges();
      }
    }, BADGE_FETCH_INTERVAL);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (badgeIntervalRef.current) clearInterval(badgeIntervalRef.current);
    };
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async (page = 1, limit = 50) => {
    if (!isAuthenticated || !mountedRef.current) return;
    
    // Prevent too frequent requests
    const now = Date.now();
    if (now - lastFetchTime.current < MIN_REQUEST_INTERVAL) {
      return;
    }
    lastFetchTime.current = now;
    
    try {
      setLoading(true);
      const response = await adminApi.getNotifications({ page, limit });
      if (mountedRef.current) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      if (error.response?.status !== 429) {
        console.error('[Notification] Fetch error:', error);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !mountedRef.current || fetchingRef.current) return;
    
    // Prevent too frequent requests
    const now = Date.now();
    if (now - lastFetchTime.current < MIN_REQUEST_INTERVAL) {
      return;
    }
    
    fetchingRef.current = true;
    lastFetchTime.current = now;
    
    try {
      const response = await adminApi.getUnreadCount();
      if (mountedRef.current) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      if (error.response?.status !== 429) {
        console.error('[Notification] Unread count error:', error);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, [isAuthenticated]);

  // Fetch all sidebar badges - WITH THROTTLING
  const fetchAllSidebarBadges = useCallback(async () => {
    if (!isAuthenticated || !mountedRef.current || fetchingRef.current) return;
    
    const now = Date.now();
    // Throttle: Don't fetch more than once every 30 seconds
    if (now - lastBadgeFetchTime.current < 30000) {
      console.log('[Notification] Throttling badge fetch - too frequent');
      return;
    }
    
    fetchingRef.current = true;
    lastBadgeFetchTime.current = now;
    
    try {
      console.log('[Notification] Fetching all sidebar badges...');
      
      // Fetch all counts in parallel with proper error handling
      const [
        reviewsRes,
        contactsRes,
        bookingsRes,
        couponsRes,
        subscribersRes,
      ] = await Promise.allSettled([
        adminApi.getAllReviews({ status: 'pending', limit: 1 }).catch(() => ({ data: { total: 0, count: 0 } })),
        adminApi.getContacts({ status: 'unread', limit: 1 }).catch(() => ({ data: { total: 0, count: 0 } })),
        adminApi.getAllBookings({ status: 'pending', limit: 1 }).catch(() => ({ data: { total: 0, count: 0 } })),
        adminApi.getCoupons().catch(() => ({ data: { coupons: [] } })),
        adminApi.getSubscribers({ status: 'active', limit: 1 }).catch(() => ({ data: { total: 0 } })),
      ]);
      
      const pendingReviews = reviewsRes.status === 'fulfilled' ? (reviewsRes.value.data?.total || reviewsRes.value.data?.count || 0) : 0;
      const unreadContacts = contactsRes.status === 'fulfilled' ? (contactsRes.value.data?.total || contactsRes.value.data?.count || 0) : 0;
      const pendingBookings = bookingsRes.status === 'fulfilled' ? (bookingsRes.value.data?.total || bookingsRes.value.data?.count || 0) : 0;
      
      let activeCoupons = 0;
      if (couponsRes.status === 'fulfilled' && couponsRes.value.data?.coupons) {
        activeCoupons = couponsRes.value.data.coupons.filter(c => c.status === 'active').length;
      }
      
      const newsletterStats = subscribersRes.status === 'fulfilled' ? (subscribersRes.value.data?.total || 0) : 0;
      
      const badges = {
        pendingReviews,
        unreadContacts,
        activeCoupons,
        pendingBookings,
        unreadNotifications: unreadCount,
        newsletterStats,
      };
      
      console.log('[Notification] Badges updated:', badges);
      
      if (mountedRef.current) {
        setSidebarBadges(badges);
      }
    } catch (error) {
      console.error('[Notification] Badge fetch error:', error);
    } finally {
      fetchingRef.current = false;
    }
  }, [isAuthenticated, unreadCount]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await adminApi.markNotificationRead(notificationId);
      
      if (socketRef.current && isConnected) {
        socketRef.current.emit('admin:mark-notification-read', notificationId);
      }
      
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      setSidebarBadges(prev => ({
        ...prev,
        unreadNotifications: Math.max(0, prev.unreadNotifications - 1),
      }));
      
      return true;
    } catch (error) {
      console.error('[Notification] Mark read error:', error);
      toast.error('Failed to mark notification as read');
      return false;
    }
  }, [isConnected]);

  const markAllAsRead = useCallback(async () => {
    try {
      await adminApi.markAllNotificationsRead();
      
      if (socketRef.current && isConnected) {
        socketRef.current.emit('admin:mark-all-read');
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      setSidebarBadges(prev => ({
        ...prev,
        unreadNotifications: 0,
      }));
      
      toast.success('All notifications marked as read');
      return true;
    } catch (error) {
      console.error('[Notification] Mark all read error:', error);
      toast.error('Failed to mark all as read');
      return false;
    }
  }, [isConnected]);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const wasUnread = !notifications.find(n => n._id === notificationId)?.read;
      await adminApi.deleteNotification(notificationId);
      
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        setSidebarBadges(prev => ({
          ...prev,
          unreadNotifications: Math.max(0, prev.unreadNotifications - 1),
        }));
      }
      
      toast.success('Notification deleted');
      return true;
    } catch (error) {
      console.error('[Notification] Delete error:', error);
      toast.error('Failed to delete notification');
      return false;
    }
  }, [notifications]);

  const bulkDeleteNotifications = useCallback(async (notificationIds) => {
    try {
      await adminApi.post('/notifications/bulk', { notificationIds });
      
      const deletedUnreadCount = notifications
        .filter(n => notificationIds.includes(n._id) && !n.read)
        .length;
      
      setNotifications(prev => prev.filter(n => !notificationIds.includes(n._id)));
      
      if (deletedUnreadCount > 0) {
        setUnreadCount(prev => Math.max(0, prev - deletedUnreadCount));
        setSidebarBadges(prev => ({
          ...prev,
          unreadNotifications: Math.max(0, prev.unreadNotifications - deletedUnreadCount),
        }));
      }
      
      toast.success(`${notificationIds.length} notification(s) deleted`);
      return true;
    } catch (error) {
      console.error('[Notification] Bulk delete error:', error);
      toast.error('Failed to delete notifications');
      return false;
    }
  }, [notifications]);

  const resetBadge = useCallback(async (type) => {
    try {
      console.log(`[Notification] Resetting badge for type: ${type}`);
      
      switch (type) {
        case 'contacts':
          await adminApi.markAllContactsRead();
          setSidebarBadges(prev => ({ ...prev, unreadContacts: 0 }));
          break;
        case 'reviews':
          await adminApi.markAllReviewsViewed();
          setSidebarBadges(prev => ({ ...prev, pendingReviews: 0 }));
          break;
        case 'bookings':
          await adminApi.markAllBookingsViewed();
          setSidebarBadges(prev => ({ ...prev, pendingBookings: 0 }));
          break;
        case 'notifications':
          await markAllAsRead();
          break;
        default:
          break;
      }
      
      // Refresh all badges after reset with delay
      setTimeout(() => fetchAllSidebarBadges(), 2000);
      return true;
    } catch (error) {
      console.error(`[Notification] Reset badge error for ${type}:`, error);
      return false;
    }
  }, [markAllAsRead, fetchAllSidebarBadges]);

  // Force refresh badges (can be called manually)
  const refreshBadges = useCallback(async () => {
    // Reset throttle to allow immediate fetch
    lastBadgeFetchTime.current = 0;
    await fetchAllSidebarBadges();
  }, [fetchAllSidebarBadges]);

  const value = {
    notifications,
    unreadCount,
    loading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkDeleteNotifications,
    fetchNotifications,
    socket,
    sidebarBadges,
    refreshBadges,
    resetBadge,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;