import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiHome,
  HiCalendar,
  HiUsers,
  HiCurrencyDollar,
  HiStar,
  HiTag,
  HiMail,
  HiTrendingUp,
  HiArrowRight,
  HiRefresh,
  HiClock,
  HiExclamation,
  HiBell,
  HiNewspaper,
  HiChartSquareBar,
  HiEye,
} from 'react-icons/hi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import SEOHead from '../components/common/SEOHead';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import NotificationBell from '../components/notifications/NotificationBell';
import { useNotifications } from '../contexts/NotificationContext';
import adminApi from '../config/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const COLORS = ['#C8A97E', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [propertyTypeData, setPropertyTypeData] = useState([]);
  const [occupancyRate, setOccupancyRate] = useState(0);
  const [timeframe, setTimeframe] = useState('month');
  const { unreadCount } = useNotifications();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboardStats();
      const data = response.data;
      
      setStats(data.stats);
      setRecentBookings(data.recentBookings || []);
      setMonthlyRevenue(data.monthlyRevenue || []);
      setPropertyTypeData(data.propertyTypeDistribution || []);
      setOccupancyRate(data.occupancyRate || 0);

      // Fetch recent reviews
      try {
        const reviewsRes = await adminApi.getAllReviews({ limit: 5, status: 'pending' });
        setRecentReviews(reviewsRes.data.reviews || []);
      } catch (e) { /* silent */ }

      // Fetch recent contacts
      try {
        const contactsRes = await adminApi.getContacts({ limit: 5, status: 'unread' });
        setRecentContacts(contactsRes.data.contacts || []);
      } catch (e) { /* silent */ }

    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const bookingColumns = [
    {
      key: 'bookingNumber',
      title: 'Booking #',
      render: (row) => (
        <Link to={`/admin/bookings/${row._id}`} className="text-[var(--color-primary)] hover:underline font-mono text-xs">
          {row.bookingNumber}
        </Link>
      ),
    },
    {
      key: 'user',
      title: 'Guest',
      render: (row) => `${row.user?.firstName || ''} ${row.user?.lastName || ''}`,
    },
    {
      key: 'property',
      title: 'Property',
      render: (row) => (
        <span className="text-sm truncate max-w-[150px] block">{row.property?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'checkIn',
      title: 'Check-in',
      render: (row) => formatDate(row.checkIn),
    },
    {
      key: 'pricing.total',
      title: 'Amount',
      render: (row) => formatCurrency(row.pricing?.total),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  // Sample data for charts (would come from API in production)
  const revenueData = monthlyRevenue.length > 0 ? monthlyRevenue : [
    { month: 'Jan', revenue: 45000, bookings: 45 },
    { month: 'Feb', revenue: 52000, bookings: 52 },
    { month: 'Mar', revenue: 48000, bookings: 48 },
    { month: 'Apr', revenue: 61000, bookings: 61 },
    { month: 'May', revenue: 55000, bookings: 55 },
    { month: 'Jun', revenue: 67000, bookings: 67 },
  ];

  return (
    <>
      <SEOHead title="Admin Dashboard" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Real-time overview of your business · Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass-light text-sm text-[var(--color-text-secondary)] hover:text-white transition-all"
              title="Refresh data"
            >
              <HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Alert cards for pending items */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats?.reviews?.pending > 0 && (
            <Link to="/admin/reviews?status=pending" className="glass rounded-xl p-4 border-l-4 border-yellow-500 hover:bg-white/[0.02] transition-all">
              <div className="flex items-center gap-3">
                <HiStar className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="text-white font-medium">{stats.reviews.pending} Pending Reviews</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Requires moderation</p>
                </div>
              </div>
            </Link>
          )}
          {unreadCount > 0 && (
            <Link to="/admin/notifications" className="glass rounded-xl p-4 border-l-4 border-blue-500 hover:bg-white/[0.02] transition-all">
              <div className="flex items-center gap-3">
                <HiBell className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-white font-medium">{unreadCount} Unread Notifications</p>
                  <p className="text-xs text-[var(--color-text-muted)]">New updates</p>
                </div>
              </div>
            </Link>
          )}
          {stats?.contacts?.unread > 0 && (
            <Link to="/admin/contacts?status=unread" className="glass rounded-xl p-4 border-l-4 border-green-500 hover:bg-white/[0.02] transition-all">
              <div className="flex items-center gap-3">
                <HiMail className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-white font-medium">{stats.contacts.unread} Unread Messages</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Customer inquiries</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={stats?.revenue?.total || 0}
            icon={HiCurrencyDollar}
            prefix="$"
            trend={stats?.revenue?.trend || 12.5}
            trendLabel="vs last month"
            loading={loading}
            color="success"
          />
          <StatCard
            title="Total Bookings"
            value={stats?.bookings?.total || 0}
            icon={HiCalendar}
            trend={stats?.bookings?.trend || 8.2}
            trendLabel="vs last month"
            loading={loading}
            color="primary"
          />
          <StatCard
            title="Occupancy Rate"
            value={occupancyRate || 78}
            icon={HiHome}
            suffix="%"
            trend={5.3}
            trendLabel="vs last month"
            loading={loading}
            color="info"
          />
          <StatCard
            title="Active Users"
            value={stats?.users?.total || 0}
            icon={HiUsers}
            trend={stats?.users?.trend || 15.7}
            trendLabel="vs last month"
            loading={loading}
            color="warning"
          />
        </div>

        {/* Second row stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="stat-card text-center">
            <p className="text-2xl font-bold text-white">{stats?.revenue?.thisMonth || '$0'}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Revenue This Month</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-2xl font-bold text-white">{stats?.bookings?.thisMonth || 0}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Bookings This Month</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-2xl font-bold text-white">{stats?.properties?.active || 0}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Active Properties</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-2xl font-bold text-white">{stats?.coupons?.active || 0}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Active Coupons</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <HiTrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
                Revenue Overview
              </h3>
              <div className="flex gap-2">
                {['week', 'month', 'year'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      timeframe === t
                        ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
                        : 'glass-light text-[var(--color-text-muted)] hover:text-white'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8A97E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C8A97E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      background: '#1A1A2E',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#F5F5F7',
                    }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C8A97E"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Property Distribution */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <HiChartSquareBar className="w-5 h-5 text-[var(--color-primary)]" />
              Property Types
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeData.length > 0 ? propertyTypeData : [
                      { name: 'Condo', value: 35 },
                      { name: 'Villa', value: 25 },
                      { name: 'Penthouse', value: 20 },
                      { name: 'Other', value: 20 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1A1A2E',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#F5F5F7',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {(propertyTypeData.length > 0 ? propertyTypeData : [
                { name: 'Condo', value: 35 },
                { name: 'Villa', value: 25 },
                { name: 'Penthouse', value: 20 },
                { name: 'Other', value: 20 },
              ]).map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-[var(--color-text-secondary)]">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions & Recent items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick actions */}
          <div className="space-y-4">
            <h3 className="text-white font-bold">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: '/admin/properties/new', label: 'Add Property', icon: HiHome, color: 'bg-blue-500/10 text-blue-500' },
                { to: '/admin/bookings', label: 'View Bookings', icon: HiCalendar, color: 'bg-green-500/10 text-green-500' },
                { to: '/admin/users', label: 'Manage Users', icon: HiUsers, color: 'bg-purple-500/10 text-purple-500' },
                { to: '/admin/coupons/new', label: 'Create Coupon', icon: HiTag, color: 'bg-orange-500/10 text-orange-500' },
                { to: '/admin/newsletter', label: 'Newsletter', icon: HiNewspaper, color: 'bg-pink-500/10 text-pink-500' },
                { to: '/admin/reviews?status=pending', label: 'Moderate Reviews', icon: HiStar, color: 'bg-yellow-500/10 text-yellow-500' },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="glass rounded-xl p-4 hover:border-[var(--color-primary)]/30 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <p className="text-white font-medium text-sm">{action.label}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent pending reviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Pending Reviews</h3>
              <Link to="/admin/reviews?status=pending" className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1">
                View All <HiArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentReviews.length > 0 ? recentReviews.slice(0, 4).map((review) => (
                <Link
                  key={review._id}
                  to={`/admin/reviews`}
                  className="glass rounded-xl p-3 block hover:bg-white/[0.02] transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <HiStar className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="text-white text-sm font-medium">{review.title}</span>
                    <span className="text-yellow-500 text-xs">★ {review.rating}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{review.content}</p>
                </Link>
              )) : (
                <div className="glass rounded-xl p-6 text-center">
                  <p className="text-[var(--color-text-muted)] text-sm">No pending reviews</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent contacts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Recent Messages</h3>
              <Link to="/admin/contacts" className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1">
                View All <HiArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentContacts.length > 0 ? recentContacts.slice(0, 4).map((contact) => (
                <Link
                  key={contact._id}
                  to={`/admin/contacts/${contact._id}`}
                  className="glass rounded-xl p-3 block hover:bg-white/[0.02] transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{contact.name}</span>
                    <StatusBadge status={contact.status} />
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{contact.message}</p>
                </Link>
              )) : (
                <div className="glass rounded-xl p-6 text-center">
                  <p className="text-[var(--color-text-muted)] text-sm">No new messages</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent bookings table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
              View All Bookings <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <DataTable
            columns={bookingColumns}
            data={recentBookings}
            loading={loading}
            emptyMessage="No bookings yet"
          />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;