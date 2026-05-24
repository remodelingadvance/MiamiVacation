import { useState, useEffect } from 'react';
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
  HiPhotograph,
  HiCog,
  HiLogout,
  HiMenu,
  HiX,
  HiBell,
  HiSearch,
  HiChevronDown,
  HiTrendingUp,
  HiNewspaper,
  HiExternalLink,
  HiRefresh,
} from 'react-icons/hi';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const sidebarLinks = [
  {
    category: 'Main',
    links: [
      { to: '/admin/dashboard', icon: HiChartBar, label: 'Dashboard' },
      { to: '/admin/analytics', icon: HiTrendingUp, label: 'Analytics' },
    ],
  },
  {
    category: 'Management',
    links: [
      { to: '/admin/properties', icon: HiHome, label: 'Properties' },
      { to: '/admin/bookings', icon: HiCalendar, label: 'Bookings' },
      { to: '/admin/users', icon: HiUsers, label: 'Users' },
      { to: '/admin/reviews', icon: HiStar, label: 'Reviews' },
    ],
  },
  {
    category: 'Marketing',
    links: [
      { to: '/admin/coupons', icon: HiTag, label: 'Coupons' },
      { to: '/admin/contacts', icon: HiMail, label: 'Contacts' },
    ],
  },
  {
    category: 'Other',
    links: [
      { to: '/admin/settings', icon: HiCog, label: 'Settings' },
    ],
  },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Keyboard shortcut for sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                  <span className="text-lg font-bold text-[var(--color-bg-dark)]">M</span>
                </div>
                <div>
                  <h1 className="text-sm font-display font-bold text-white leading-tight">MLR</h1>
                  <p className="text-[9px] text-[var(--color-primary)] uppercase tracking-wider">Admin</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden lg:flex w-8 h-8 rounded-lg glass-light items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors ${
                sidebarCollapsed ? '' : ''
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
                  <p className="text-xs text-[var(--color-text-muted)] capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {sidebarLinks.map((category) => (
              <div key={category.category}>
                {!sidebarCollapsed && (
                  <p className="px-3 mb-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
                    {category.category}
                  </p>
                )}
                <ul className="space-y-1">
                  {category.links.map((link) => (
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
                        <link.icon className="w-5 h-5 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <span className="text-sm font-medium">{link.label}</span>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="p-3 border-t border-white/5 space-y-1">
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
              title="Logout"
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

            {/* Breadcrumb / Page title */}
            <div>
              <h2 className="text-white font-semibold text-sm">
                {location.pathname.split('/').pop()?.replace(/-/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh button */}
            <button
              onClick={() => window.location.reload()}
              className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors"
              title="Refresh data"
            >
              <HiRefresh className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="relative w-10 h-10 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors">
              <HiBell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-light hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                  <span className="text-[var(--color-primary)] font-semibold text-xs">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <HiChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 glass-strong rounded-xl overflow-hidden shadow-2xl z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="p-3 border-b border-white/5">
                      <p className="text-white text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { navigate('/admin/settings'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white transition-all"
                      >
                        <HiCog className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
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