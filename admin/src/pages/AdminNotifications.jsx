import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiCheck, HiTrash, HiFilter } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const AdminNotifications = () => {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchNotifications(page);
  }, [page, fetchNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'border-l-red-500',
      high: 'border-l-orange-500',
      medium: 'border-l-yellow-500',
      low: 'border-l-gray-500',
    };
    return colors[priority] || 'border-l-gray-500';
  };

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
      newsletter_subscriber: '📬',
    };
    return icons[type] || '📌';
  };

  return (
    <>
      <SEOHead title="Notifications" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Notifications</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {unreadCount} unread notifications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field w-auto py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn-outline text-sm flex items-center gap-2"
              >
                <HiCheck className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass rounded-xl p-4 border-l-4 transition-all hover:bg-white/[0.02] ${
                notification.read ? 'opacity-60' : getPriorityColor(notification.priority)
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-white font-medium">{notification.title}</h4>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500/20 transition-colors"
                          title="Mark as read"
                        >
                          <HiCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredNotifications.length === 0 && !loading && (
            <div className="text-center py-16">
              <p className="text-[var(--color-text-muted)]">No notifications found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminNotifications;