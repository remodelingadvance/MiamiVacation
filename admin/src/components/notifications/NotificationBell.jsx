import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBell, HiCheck, HiTrash, HiX } from 'react-icons/hi';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    const icons = {
      new_booking: '🎉',
      booking_cancelled: '❌',
      booking_confirmed: '✅',
      new_review: '⭐',
      new_contact: '📧',
      payment_received: '💰',
      payment_failed: '⚠️',
      new_user: '👤',
      system_alert: '🔔',
    };
    return icons[type] || '📌';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'border-l-red-500',
      high: 'border-l-orange-500',
      medium: 'border-l-yellow-500',
      low: 'border-l-gray-500',
    };
    return colors[priority] || 'border-l-gray-500';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors"
      >
        <HiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 glass-strong rounded-xl overflow-hidden shadow-2xl z-[100]"
            style={{ position: 'absolute', top: '100%', right: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[var(--color-bg-dark)]/90 backdrop-blur-sm">
              <h3 className="text-white font-bold text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors flex items-center gap-1"
                  >
                    <HiCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-[400px] overflow-y-auto bg-[var(--color-bg-dark)]/95">
              {notifications && notifications.length > 0 ? (
                notifications.slice(0, 20).map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 border-b border-white/5 border-l-2 transition-all hover:bg-white/[0.05] cursor-pointer ${
                      notification.read ? 'border-l-transparent opacity-60' : getPriorityColor(notification.priority)
                    }`}
                    onClick={() => !notification.read && markAsRead(notification._id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-white text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="flex-shrink-0 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                          >
                            <HiTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          {notification.link && (
                            <Link
                              to={notification.link}
                              onClick={() => setIsOpen(false)}
                              className="text-[10px] text-[var(--color-primary)] hover:underline"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <HiBell className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2 opacity-50" />
                  <p className="text-[var(--color-text-muted)] text-sm">No notifications yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 text-center bg-[var(--color-bg-dark)]/90 backdrop-blur-sm">
              <Link
                to="/admin/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;