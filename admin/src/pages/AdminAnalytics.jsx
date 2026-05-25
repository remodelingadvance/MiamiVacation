import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiTrendingUp,
  HiUsers,
  HiHome,
  HiCalendar,
  HiCurrencyDollar,
  HiDownload,
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
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import SEOHead from '../components/common/SEOHead';
import StatCard from '../components/common/StatCard';
import adminApi from '../config/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const COLORS = ['#C8A97E', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const response = await adminApi.getAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setAnalyticsData(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Sample data for demonstration
  const revenueData = [
    { month: 'Jan', revenue: 45000, bookings: 45 },
    { month: 'Feb', revenue: 52000, bookings: 52 },
    { month: 'Mar', revenue: 48000, bookings: 48 },
    { month: 'Apr', revenue: 61000, bookings: 61 },
    { month: 'May', revenue: 55000, bookings: 55 },
    { month: 'Jun', revenue: 67000, bookings: 67 },
    { month: 'Jul', revenue: 72000, bookings: 72 },
    { month: 'Aug', revenue: 78000, bookings: 78 },
    { month: 'Sep', revenue: 65000, bookings: 65 },
    { month: 'Oct', revenue: 71000, bookings: 71 },
    { month: 'Nov', revenue: 82000, bookings: 82 },
    { month: 'Dec', revenue: 95000, bookings: 95 },
  ];

  const propertyTypeData = [
    { name: 'Condo', value: 35 },
    { name: 'Villa', value: 25 },
    { name: 'Penthouse', value: 20 },
    { name: 'Apartment', value: 12 },
    { name: 'House', value: 5 },
    { name: 'Mansion', value: 3 },
  ];

  const bookingSourceData = [
    { name: 'Direct', value: 45 },
    { name: 'Google', value: 25 },
    { name: 'Referral', value: 15 },
    { name: 'Social', value: 10 },
    { name: 'Other', value: 5 },
  ];

  const guestDemographics = [
    { age: '18-24', guests: 120 },
    { age: '25-34', guests: 450 },
    { age: '35-44', guests: 380 },
    { age: '45-54', guests: 290 },
    { age: '55-64', guests: 180 },
    { age: '65+', guests: 80 },
  ];

  const topProperties = [
    { name: 'Oceanfront Penthouse', bookings: 85, revenue: 127500 },
    { name: 'Brickell Luxury Condo', bookings: 72, revenue: 86400 },
    { name: 'Miami Beach Villa', bookings: 65, revenue: 97500 },
    { name: 'Downtown Loft', bookings: 58, revenue: 58000 },
    { name: 'Coral Gables Estate', bookings: 45, revenue: 67500 },
  ];

  return (
    <>
      <SEOHead title="Analytics" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Analytics</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Detailed insights and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field w-auto py-2 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors"
              title="Refresh"
            >
              <HiRefresh className="w-5 h-5" />
            </button>
            <button className="btn-outline flex items-center gap-2 text-sm">
              <HiDownload className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={950000}
            icon={HiCurrencyDollar}
            prefix="$"
            trend={15.2}
            trendLabel="vs last year"
            color="success"
            loading={loading}
          />
          <StatCard
            title="Total Bookings"
            value={850}
            icon={HiCalendar}
            trend={12.8}
            trendLabel="vs last year"
            color="primary"
            loading={loading}
          />
          <StatCard
            title="Unique Guests"
            value={1500}
            icon={HiUsers}
            trend={8.5}
            trendLabel="vs last year"
            color="info"
            loading={loading}
          />
          <StatCard
            title="Avg. Stay Duration"
            value={4.2}
            icon={HiHome}
            suffix=" nights"
            trend={3.1}
            trendLabel="vs last year"
            color="warning"
            loading={loading}
          />
        </div>

        {/* Revenue & Bookings Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <HiTrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
              Revenue Trend
            </h3>
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
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#1A1A2E',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#F5F5F7',
                    }}
                    formatter={(value) => formatCurrency(value)}
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
          </motion.div>

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
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
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

        {/* Pie Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-white font-bold mb-4">Property Types</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <Legend
                    formatter={(value) => <span style={{ color: '#A0A0B0' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Booking Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-white font-bold mb-4">Booking Sources</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bookingSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <Legend
                    formatter={(value) => <span style={{ color: '#A0A0B0' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Guest Demographics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-white font-bold mb-4">Guest Demographics</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={guestDemographics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} />
                  <YAxis dataKey="age" type="category" stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#1A1A2E',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#F5F5F7',
                    }}
                  />
                  <Bar dataKey="guests" fill="#C8A97E" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Top Properties Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-white font-bold mb-4">Top Performing Properties</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Rank</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Property</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Bookings</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Revenue</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Performance</th>
                </tr>
              </thead>
              <tbody>
                {topProperties.map((property, index) => (
                  <tr key={property.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        index < 3 ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{property.name}</p>
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{property.bookings}</td>
                    <td className="py-3 px-4 text-white font-medium">{formatCurrency(property.revenue)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-primary)] rounded-full"
                            style={{ width: `${(property.bookings / 85) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {Math.round((property.bookings / 85) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminAnalytics;