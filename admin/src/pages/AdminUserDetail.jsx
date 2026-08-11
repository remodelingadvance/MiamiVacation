import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiArrowLeft,
  HiMail,
  HiPhone,
  HiCalendar,
  HiHome,
  HiStar,
  HiShieldCheck,
  HiBadgeCheck,
  HiXCircle,
  HiRefresh,
} from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import adminApi from '../config/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await adminApi.getUser(id);
        setUser(response.data.user);
      } catch (error) {
        toast.error('User not found');
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  const handleToggleStatus = async () => {
    try {
      await adminApi.updateUser(id, { isActive: !user.isActive });
      setUser(prev => ({ ...prev, isActive: !prev.isActive }));
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

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
      key: 'checkOut',
      title: 'Check-out',
      render: (row) => formatDate(row.checkOut),
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
      <SEOHead title={`User: ${user.firstName} ${user.lastName}`} />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.firstName} {user.lastName}</h1>
            <p className="text-sm text-[var(--color-text-muted)]">User ID: {user._id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                <span className="text-3xl font-bold text-[var(--color-primary)]">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{user.firstName} {user.lastName}</h2>
              <p className="text-sm text-[var(--color-text-muted)]">{user.email}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <StatusBadge status={user.role} />
                <span className={`inline-flex items-center gap-1 text-xs ${user.isVerified ? 'text-green-500' : 'text-yellow-500'}`}>
                  {user.isVerified ? <HiBadgeCheck className="w-4 h-4" /> : <HiXCircle className="w-4 h-4" />}
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>

            <div className="glass rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Contact Information</h3>
              
              <div className="flex items-center gap-3">
                <HiMail className="w-5 h-5 text-[var(--color-primary)]" />
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Email</p>
                  <p className="text-white text-sm">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HiPhone className="w-5 h-5 text-[var(--color-primary)]" />
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Phone</p>
                  <p className="text-white text-sm">{user.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HiCalendar className="w-5 h-5 text-[var(--color-primary)]" />
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Member Since</p>
                  <p className="text-white text-sm">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              {user.lastLogin && (
                <div className="flex items-center gap-3">
                  <HiRefresh className="w-5 h-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Last Login</p>
                    <p className="text-white text-sm">{formatDate(user.lastLogin)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleToggleStatus}
                  className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    user.isActive
                      ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30'
                      : 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/30'
                  }`}
                >
                  {user.isActive ? 'Deactivate User' : 'Activate User'}
                </button>
              </div>
            </div>
          </div>

          {/* User stats & bookings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: HiHome, label: 'Bookings', value: user.bookings?.length || 0 },
                { icon: HiStar, label: 'Reviews', value: user.reviews?.length || 0 },
                { icon: HiShieldCheck, label: 'Favorites', value: user.favorites?.length || 0 },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-4 text-center">
                  <stat.icon className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Booking history */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Booking History</h3>
              <DataTable
                columns={bookingColumns}
                data={user.bookings || []}
                emptyMessage="No bookings found"
              />
            </div>

            {/* Address */}
            {user.address && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Address</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[var(--color-text-muted)]">Street</p>
                    <p className="text-white">{user.address.street || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-muted)]">City</p>
                    <p className="text-white">{user.address.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-muted)]">State</p>
                    <p className="text-white">{user.address.state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-muted)]">Country</p>
                    <p className="text-white">{user.address.country || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUserDetail;
