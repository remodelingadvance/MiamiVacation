import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiArrowLeft,
  HiPencil,
  HiTrash,
  HiTag,
  HiCalendar,
  HiUser,
  HiChartBar,
  HiRefresh,
  HiCheckCircle,
  HiXCircle,
  HiClock,
} from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import adminApi from '../config/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminCouponDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCoupon();
  }, [id]);

  const fetchCoupon = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getCoupon(id);
      setCoupon(response.data.coupon);
    } catch (error) {
      console.error('Failed to fetch coupon:', error);
      toast.error('Coupon not found');
      navigate('/admin/coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await adminApi.deleteCoupon(id);
      toast.success('Coupon deactivated successfully');
      navigate('/admin/coupons');
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to deactivate coupon');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'inactive': return 'text-gray-500 bg-gray-500/10';
      case 'expired': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const isExpired = coupon && new Date(coupon.endDate) < new Date();
  const isActive = coupon?.status === 'active' && !isExpired;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!coupon) return null;

  return (
    <>
      <SEOHead title={`Coupon Details - ${coupon.code}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/coupons')}
              className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-display font-bold text-white">
                  {coupon.code}
                </h1>
                <StatusBadge status={coupon.status} />
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                {coupon.description || 'No description provided'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/admin/coupons/${id}/edit`}
              className="btn-outline flex items-center gap-2 text-sm"
            >
              <HiPencil className="w-4 h-4" />
              Edit Coupon
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm flex items-center gap-2"
            >
              <HiTrash className="w-4 h-4" />
              Deactivate
            </button>
            <button
              onClick={fetchCoupon}
              className="btn-outline flex items-center gap-2 text-sm"
            >
              <HiRefresh className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-2">
              <HiTag className="w-4 h-4" />
              <span className="text-xs">Discount Value</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
            </p>
            {coupon.type === 'percentage' && coupon.maximumDiscount && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Max discount: {formatCurrency(coupon.maximumDiscount)}
              </p>
            )}
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-2">
              <HiChartBar className="w-4 h-4" />
              <span className="text-xs">Usage Count</span>
            </div>
            <p className="text-2xl font-bold text-white">{coupon.usedCount}</p>
            {coupon.usageLimit?.total && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Limit: {coupon.usageLimit.total}
              </p>
            )}
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-2">
              <HiUser className="w-4 h-4" />
              <span className="text-xs">Per User Limit</span>
            </div>
            <p className="text-2xl font-bold text-white">{coupon.usageLimit?.perUser || 1}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              times per customer
            </p>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-2">
              {isActive ? (
                <HiCheckCircle className="w-4 h-4 text-green-500" />
              ) : isExpired ? (
                <HiXCircle className="w-4 h-4 text-red-500" />
              ) : (
                <HiClock className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-xs">Status</span>
            </div>
            <p className={`text-xl font-bold ${isActive ? 'text-green-500' : isExpired ? 'text-red-500' : 'text-yellow-500'}`}>
              {isActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Coupon Information */}
            <div className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-display font-bold text-white border-b border-white/10 pb-3">
                Coupon Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Coupon Code</span>
                  <span className="font-mono text-[var(--color-primary)] font-bold">{coupon.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Discount Type</span>
                  <span className="capitalize text-white">{coupon.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Discount Value</span>
                  <span className="text-white font-semibold">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                  </span>
                </div>
                {coupon.minimumBookingAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Minimum Booking Amount</span>
                    <span className="text-white">{formatCurrency(coupon.minimumBookingAmount)}</span>
                  </div>
                )}
                {coupon.minimumNights > 1 && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Minimum Nights</span>
                    <span className="text-white">{coupon.minimumNights} nights</span>
                  </div>
                )}
              </div>
            </div>

            {/* Date Information */}
            <div className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-display font-bold text-white border-b border-white/10 pb-3">
                Validity Period
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Start Date</span>
                  <span className="text-white">{formatDate(coupon.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">End Date</span>
                  <span className="text-white">{formatDate(coupon.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Days Remaining</span>
                  <span className="text-white">
                    {Math.ceil((new Date(coupon.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Usage Information */}
            <div className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-display font-bold text-white border-b border-white/10 pb-3">
                Usage Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Total Used</span>
                  <span className="text-white font-semibold">{coupon.usedCount}</span>
                </div>
                {coupon.usageLimit?.total && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Remaining Uses</span>
                    <span className="text-white">{coupon.usageLimit.total - coupon.usedCount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Per User Limit</span>
                  <span className="text-white">{coupon.usageLimit?.perUser || 1} time(s)</span>
                </div>
              </div>
            </div>

            {/* Created By */}
            <div className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-display font-bold text-white border-b border-white/10 pb-3">
                Additional Info
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Created By</span>
                  <span className="text-white">
                    {coupon.createdBy?.firstName} {coupon.createdBy?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Created At</span>
                  <span className="text-white">{formatDate(coupon.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Last Updated</span>
                  <span className="text-white">{formatDate(coupon.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Usage - if available */}
        {coupon.usedBy && coupon.usedBy.length > 0 && (
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-display font-bold text-white border-b border-white/10 pb-3 mb-4">
              Recent Usage
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-[var(--color-text-muted)] font-medium">User</th>
                    <th className="text-left py-2 text-[var(--color-text-muted)] font-medium">Booking</th>
                    <th className="text-left py-2 text-[var(--color-text-muted)] font-medium">Used At</th>
                  </tr>
                </thead>
                <tbody>
                  {coupon.usedBy.slice(0, 10).map((usage, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="py-2 text-white">
                        {usage.user?.firstName} {usage.user?.lastName}
                      </td>
                      <td className="py-2">
                        <Link to={`/admin/bookings/${usage.booking?._id}`} className="text-[var(--color-primary)] hover:underline">
                          {usage.booking?.bookingNumber || 'N/A'}
                        </Link>
                      </td>
                      <td className="py-2 text-[var(--color-text-muted)]">{formatDate(usage.usedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Deactivate Coupon"
        message={`Are you sure you want to deactivate ${coupon.code}? It will no longer be usable.`}
        loading={deleting}
      />
    </>
  );
};

export default AdminCouponDetails;
