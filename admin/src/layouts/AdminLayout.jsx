import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiChartBar,
  HiHome,
  HiCalendar,
  HiUsers,
  HiStar,
  HiTag,
  HiMail,
  HiCog,
  HiLogout,
  HiMenu,
  HiX,
  HiBell,
  HiChevronDown,
  HiTrendingUp,
  HiNewspaper,
  HiExternalLink,
  HiRefresh,
  HiSearch,
  HiExclamation,
} from 'react-icons/hi';
import { useAdminAuth } from '../contexts/AdminAuthContext';
// import { useNotifications } from '../contexts/NotificationContext';
// import NotificationBell from '../components/notifications/NotificationBell';

const sidebarLinks = [
  {
    category: 'Main',
    links: [
      { 
        to: '/admin/dashboard', 
        icon: HiChartBar, 
        label: 'Dashboard',
        badge: null,
        badgeColor: null,
      },
      { 
        to: '/admin/analytics', 
        icon: HiTrendingUp, 
        label: 'Analytics',
        badge: null,
        badgeColor: null,
      },
    ],
  },
  {
    category: 'Management',
    links: [
      { 
        to: '/admin/properties', 
        icon: HiHome, 
        label: 'Properties',
        badge: null,
        badgeColor: null,
      },
      { 
        to: '/admin/bookings', 
        icon: HiCalendar, 
        label: 'Bookings',
        badge: null,
        badgeColor: 'bg-blue-500',
        badgeKey: 'pendingBookings',
      },
      { 
        to: '/admin/users', 
        icon: HiUsers, 
        label: 'Users',
        badge: null,
        badgeColor: null,
      },
      { 
        to: '/admin/reviews', 
        icon: HiStar, 
        label: 'Reviews',
        badge: null,
        badgeColor: 'bg-yellow-500',
        badgeKey: 'pendingReviews',
      },
    ],
  },
  {
    category: 'Marketing',
    links: [
      { 
        to: '/admin/coupons', 
        icon: HiTag, 
        label: 'Coupons',
        badge: null,
        badgeColor: 'bg-green-500',
        badgeKey: 'activeCoupons',
      },
      { 
        to: '/admin/newsletter', 
        icon: HiNewspaper, 
        label: 'Newsletter',
        badge: null,
        badgeColor: 'bg-pink-500',
        badgeKey: 'newsletterStats',
      },
      { 
        to: '/admin/contacts', 
        icon: HiMail, 
        label: 'Contacts',
        badge: null,
        badgeColor: 'bg-orange-500',
        badgeKey: 'unreadContacts',
      },
    ],
  },
  {
    category: 'System',
    links: [
      { 
        to: '/admin/notifications', 
        icon: HiBell, 
        label: 'Notifications',
        badge: null,
        badgeColor: 'bg-red-500',
        badgeKey: 'unreadNotifications',
      },
      { 
        to: '/admin/settings', 
        icon: HiCog, 
        label: 'Settings',
        badge: null,
        badgeColor: null,
      },
    ],
  },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const { user, logout } = useAdminAuth();
  // const { unreadCount, notifications } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch dashboard stats for sidebar badges
  const [sidebarBadges, setSidebarBadges] = useState({
    pendingReviews: 0,
    unreadContacts: 0,
    activeCoupons: 0,
    pendingBookings: 0,
    unreadNotifications: 0,
    newsletterStats: 0,
  });

  // Update sidebar badges from notifications and context
//   useEffect(() => {
//     setSidebarBadges(prev => ({
//       ...prev,
//       unreadNotifications: unreadCount,
//     }));
//   }, [unreadCount]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
    setGlobalSearchOpen(false);
  }, [location]);

  // Handle click outside for user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+B - Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
      // Ctrl+K - Global search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      // Escape - Close modals
      if (e.key === 'Escape') {
        setGlobalSearchOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!globalSearchQuery.trim()) return;

    // Navigate based on search type
    const query = globalSearchQuery.toLowerCase();
    
    if (query.startsWith('booking') || query.startsWith('#')) {
      const bookingNum = query.replace('booking', '').replace('#', '').trim();
      if (bookingNum) navigate(`/admin/bookings?search=${bookingNum}`);
    } else if (query.startsWith('user') || query.includes('@')) {
      const userQuery = query.replace('user', '').trim();
      navigate(`/admin/users?search=${userQuery || query}`);
    } else if (query.startsWith('property')) {
      const propQuery = query.replace('property', '').trim();
      navigate(`/admin/properties?search=${propQuery}`);
    } else {
      // Default: search properties
      navigate(`/admin/properties?search=${query}`);
    }
    
    setGlobalSearchOpen(false);
    setGlobalSearchQuery('');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/properties')) return path.includes('new') ? 'Add Property' : path.includes('edit') ? 'Edit Property' : 'Properties';
    if (path.includes('/bookings')) return path.includes('/') && path.split('/').length > 3 ? 'Booking Details' : 'Bookings';
    if (path.includes('/users')) return path.includes('/') && path.split('/').length > 3 ? 'User Details' : 'Users';
    if (path.includes('/reviews')) return 'Reviews';
    if (path.includes('/coupons')) return path.includes('new') ? 'Create Coupon' : path.includes('edit') ? 'Edit Coupon' : 'Coupons';
    if (path.includes('/newsletter')) return 'Newsletter';
    if (path.includes('/contacts')) return path.includes('/') && path.split('/').length > 3 ? 'Message Details' : 'Contacts';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/settings')) return 'Settings';
    return 'Admin';
  };

  return (
    <div className="flex h-screen bg-[var(--color-bg-dark)] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Global Search Modal */}
      <AnimatePresence>
        {globalSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setGlobalSearchOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="relative w-full max-w-lg glass-strong rounded-2xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleGlobalSearch} className="p-4">
                <div className="flex items-center gap-3">
                  <HiSearch className="w-5 h-5 text-[var(--color-text-muted)]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    placeholder="Search bookings, users, properties... (Ctrl+K)"
                    className="flex-1 bg-transparent text-white placeholder:text-[var(--color-text-muted)] outline-none text-base"
                    autoComplete="off"
                  />
                  <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-[var(--color-text-muted)] bg-white/5 rounded border border-white/10">
                    ESC
                  </kbd>
                </div>
              </form>
              <div className="px-4 pb-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-2">Quick navigation</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Dashboard', path: '/admin/dashboard' },
                    { label: 'Properties', path: '/admin/properties' },
                    { label: 'Bookings', path: '/admin/bookings' },
                    { label: 'Users', path: '/admin/users' },
                    { label: 'Reviews', path: '/admin/reviews' },
                    { label: 'Newsletter', path: '/admin/newsletter' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { navigate(item.path); setGlobalSearchOpen(false); }}
                      className="text-left px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-all"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex-1 flex flex-col glass-strong border-r border-white/5">
          {/* Logo */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-white/10`}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                  <span className="text-lg font-bold text-[var(--color-bg-dark)]">M</span>
                </div>
                <div>
                  <h1 className="text-sm font-display font-bold text-white leading-tight">MLR</h1>
                  <p className="text-[9px] text-[var(--color-primary)] uppercase tracking-wider">Admin</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div 
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center cursor-pointer"
                onClick={() => navigate('/admin/dashboard')}
              >
                <span className="text-lg font-bold text-[var(--color-bg-dark)]">M</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden lg:flex w-8 h-8 rounded-lg glass-light items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors ${
                sidebarCollapsed ? 'mx-auto mt-2' : ''
              }`}
              title={`${sidebarCollapsed ? 'Expand' : 'Collapse'} sidebar (Ctrl+B)`}
            >
              {sidebarCollapsed ? (
                <HiMenu className="w-4 h-4" />
              ) : (
                <HiX className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* User info */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--color-primary)] font-semibold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] capitalize flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      user?.role === 'super-admin' ? 'bg-purple-500' : 'bg-[var(--color-primary)]'
                    }`} />
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
            {sidebarLinks.map((category) => (
              <div key={category.category}>
                {!sidebarCollapsed && (
                  <p className="px-3 mb-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
                    {category.category}
                  </p>
                )}
                <ul className="space-y-1">
                  {category.links.map((link) => {
                    const badgeCount = link.badgeKey ? sidebarBadges[link.badgeKey] : link.badge;
                    const showBadge = badgeCount && badgeCount > 0;
                    
                    return (
                      <li key={link.to}>
                        <NavLink
                          to={link.to}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                              isActive
                                ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                                : 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white'
                            } ${sidebarCollapsed ? 'justify-center' : ''}`
                          }
                          title={sidebarCollapsed ? link.label : ''}
                        >
                          <div className="relative">
                            <link.icon className="w-5 h-5 flex-shrink-0" />
                            {/* Badge dot on icon for collapsed sidebar */}
                            {sidebarCollapsed && showBadge && (
                              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${link.badgeColor || 'bg-red-500'} rounded-full border-2 border-[var(--color-bg-dark)]`} />
                            )}
                          </div>
                          
                          {!sidebarCollapsed && (
                            <>
                              <span className="text-sm font-medium flex-1">{link.label}</span>
                              {/* Badge count for expanded sidebar */}
                              {showBadge && (
                                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full ${link.badgeColor || 'bg-red-500'} text-white text-[10px] font-bold`}>
                                  {badgeCount > 99 ? '99+' : badgeCount}
                                </span>
                              )}
                              {/* Active indicator */}
                              {link.to === location.pathname && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-primary)] rounded-full" />
                              )}
                            </>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="p-3 border-t border-white/5 space-y-1">
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white transition-all ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title="Search (Ctrl+K)"
            >
              <HiSearch className="w-5 h-5" />
              {!sidebarCollapsed && (
                <>
                  <span className="text-sm">Search</span>
                  <kbd className="ml-auto px-1.5 py-0.5 text-[10px] bg-white/5 rounded border border-white/10 text-[var(--color-text-muted)]">
                    ⌘K
                  </kbd>
                </>
              )}
            </button>
            <button
              onClick={() => window.open('/', '_blank')}
              className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white transition-all ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title="View Website"
            >
              <HiExternalLink className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm">View Website</span>}
            </button>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-all ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title="Sign Out"
            >
              <HiLogout className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 rounded-lg glass-light flex items-center justify-center text-white hover:text-[var(--color-primary)] transition-colors"
            >
              <HiMenu className="w-5 h-5" />
            </button>

            {/* Page title with breadcrumb */}
            <div>
              <h2 className="text-white font-semibold text-sm">
                {getPageTitle()}
              </h2>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                {location.pathname}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global search button */}
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-light text-sm text-[var(--color-text-muted)] hover:text-white transition-all"
            >
              <HiSearch className="w-4 h-4" />
              <span>Search...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white/5 rounded border border-white/10">
                ⌘K
              </kbd>
            </button>

            {/* Refresh button */}
            <button
              onClick={() => window.location.reload()}
              className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors"
              title="Refresh data"
            >
              <HiRefresh className="w-5 h-5" />
            </button>

            {/* Notification Bell */}
            {/* <NotificationBell /> */}

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-light hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center relative">
                  <span className="text-[var(--color-primary)] font-semibold text-xs">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[var(--color-bg-dark)]" />
                </div>
                <HiChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 glass-strong rounded-xl overflow-hidden shadow-2xl z-50"
                  >
                    <div className="p-4 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                          <span className="text-[var(--color-primary)] font-bold text-lg">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{user?.email}</p>
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-[var(--color-primary)] capitalize">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                            {user?.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { navigate('/admin/settings'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white transition-all"
                      >
                        <HiCog className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={() => { navigate('/admin/notifications'); setUserMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white transition-all"
                      >
                        <span className="flex items-center gap-3">
                          <HiBell className="w-4 h-4" />
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      <div className="border-t border-white/5 my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <HiLogout className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg-dark)]">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 lg:p-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;