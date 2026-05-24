import { useState, useEffect } from 'react';
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
} from 'recharts';
import SEOHead from '../components/common/SEOHead';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import adminApi from '../config/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboardStats();
      setStats(response.data.stats);
      setRecentBookings(response.data.recentBookings || []);
      setMonthlyRevenue(response.data.monthlyRevenue || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = ['#C8A97E', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

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
      render: (row) => row.property?.name || 'N/A',
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

  return (
    <>
      <SEOHead title="Admin Dashboard" />

      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Overview of your business performance</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass-light text-sm text-[var(--color-text-secondary)] hover:text-white transition-all"
          >
            <HiRefresh className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={stats?.revenue?.total || 0}
            icon={HiCurrencyDollar}
            prefix="$"
            trend={12.5}
            trendLabel="vs last month"
            loading={loading}
            color="success"
          />
          <StatCard
            title="Total Bookings"
            value={stats?.bookings?.total || 0}
            icon={HiCalendar}
            trend={8.2}
            trendLabel="vs last month"
            loading={loading}
            color="primary"
          />
          <StatCard
            title="Active Properties"
            value={stats?.properties?.active || 0}
            icon={HiHome}
            loading={loading}
            color="info"
          />
          <StatCard
            title="Total Users"
            value={stats?.users?.total || 0}
            icon={HiUsers}
            suffix=""
            loading={loading}
            color="warning"
          />
        </div>

        {/* Second row stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Pending Reviews"
            value={stats?.reviews?.pending || 0}
            icon={HiStar}
            loading={loading}
            color="warning"
          />
          <StatCard
            title="Unread Messages"
            value={stats?.contacts?.unread || 0}
            icon={HiMail}
            loading={loading}
            color="info"
          />
          <StatCard
            title="Active Coupons"
            value={stats?.coupons?.active || 0}
            icon={HiTag}
            loading={loading}
            color="success"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <HiTrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
              Monthly Revenue
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="_id"
                    tickFormatter={(val) => `${val.month}/${val.year}`}
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#1A1A2E',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#F5F5F7',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C8A97E"
                    strokeWidth={2}
                    dot={{ fill: '#C8A97E', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bookings chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <HiCalendar className="w-5 h-5 text-[var(--color-primary)]" />
              Monthly Bookings
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="_id"
                    tickFormatter={(val) => `${val.month}/${val.year}`}
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#1A1A2E',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#F5F5F7',
                    }}
                  />
                  <Bar dataKey="bookings" fill="#C8A97E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: '/admin/properties/new', label: 'Add Property', icon: HiHome, color: 'bg-blue-500/10 text-blue-500' },
            { to: '/admin/bookings', label: 'View Bookings', icon: HiCalendar, color: 'bg-green-500/10 text-green-500' },
            { to: '/admin/users', label: 'Manage Users', icon: HiUsers, color: 'bg-purple-500/10 text-purple-500' },
            { to: '/admin/coupons/new', label: 'Create Coupon', icon: HiTag, color: 'bg-orange-500/10 text-orange-500' },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="glass rounded-xl p-4 hover:border-[var(--color-primary)]/30 transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <link.icon className="w-5 h-5" />
              </div>
              <p className="text-white font-medium text-sm">{link.label}</p>
              <HiArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all mt-2" />
            </Link>
          ))}
        </div>

        {/* Recent bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
              View All
              <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <DataTable
            columns={bookingColumns}
            data={recentBookings}
            loading={loading}
            emptyMessage="No bookings yet"
          />
        </motion.div>
      </div>
    </>
  );
};

export default AdminDashboard;