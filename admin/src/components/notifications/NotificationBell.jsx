// NotificationBell.jsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBell, HiCheck, HiTrash, HiX } from 'react-icons/hi';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const listContainerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) && 
        buttonRef.current && 
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Update dropdown position when opened or on scroll/resize
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 384;
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom - 20;
        const spaceAbove = rect.top - 20;
        
        // Determine if dropdown should open upward or downward
        const shouldOpenUpward = spaceBelow < 400 && spaceAbove > spaceBelow;
        
        const top = shouldOpenUpward 
          ? rect.top - Math.min(400, spaceAbove) 
          : rect.bottom + 8;
        
        const right = Math.min(
          window.innerWidth - rect.right,
          window.innerWidth - 16
        );
        
        setDropdownPosition({
          top: Math.max(8, top),
          right: Math.max(0, right),
          maxHeight: Math.min(400, shouldOpenUpward ? spaceAbove - 20 : spaceBelow - 20),
          shouldOpenUpward,
        });
      }
    };

    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('orientationchange', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('orientationchange', updatePosition);
    };
  }, [isOpen]);

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

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { duration: 0.15 }
          }}
          exit={{ 
            opacity: 0, 
            y: -10, 
            scale: 0.95,
            transition: { duration: 0.1 }
          }}
          style={{
            position: 'fixed',
            top: dropdownPosition.top || '60px',
            right: dropdownPosition.right || '16px',
            width: '384px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: dropdownPosition.maxHeight || '400px',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          }}
          className="glass-strong rounded-xl"
        >
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[var(--color-bg-dark)]/90 backdrop-blur-sm flex-shrink-0">
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

          {/* Notifications list - Scrollable */}
          <div 
            ref={listContainerRef}
            className="overflow-y-auto flex-1 bg-[var(--color-bg-dark)]/95"
            style={{
              maxHeight: '300px', // Fixed max height for scrolling
              minHeight: '100px',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch', // For smooth scrolling on iOS
            }}
          >
            {notifications && notifications.length > 0 ? (
              <div className="divide-y divide-white/5">
                {notifications.slice(0, 50).map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 border-l-2 transition-all hover:bg-white/[0.05] cursor-pointer ${
                      notification.read ? 'border-l-transparent opacity-60' : getPriorityColor(notification.priority)
                    }`}
                    onClick={() => !notification.read && markAsRead(notification._id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">
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
                            className="flex-shrink-0 text-[var(--color-text-muted)] hover:text-red-500 transition-colors mt-0.5"
                          >
                            <HiTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
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
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <HiBell className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2 opacity-50" />
                <p className="text-[var(--color-text-muted)] text-sm">No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="p-3 border-t border-white/5 text-center bg-[var(--color-bg-dark)]/90 backdrop-blur-sm flex-shrink-0">
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
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors z-50"
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

      {createPortal(dropdownContent, document.body)}
    </>
  );
};

export default NotificationBell;