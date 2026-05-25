import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { HiArrowLeft, HiSave } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import adminApi from '../config/api';
import toast from 'react-hot-toast';

const AdminCouponForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      minimumBookingAmount: '',
      maximumDiscount: '',
      minimumNights: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimitTotal: '',
      usageLimitPerUser: 1,
      status: 'active',
    },
  });

  const couponType = watch('type');

  useEffect(() => {
    if (isEditing) {
      fetchCoupon();
    }
  }, [id]);

  const fetchCoupon = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getCoupon(id);
      const coupon = response.data.coupon;

      reset({
        code: coupon.code,
        description: coupon.description || '',
        type: coupon.type,
        value: coupon.value,
        minimumBookingAmount: coupon.minimumBookingAmount || '',
        maximumDiscount: coupon.maximumDiscount || '',
        minimumNights: coupon.minimumNights || 1,
        startDate: new Date(coupon.startDate).toISOString().split('T')[0],
        endDate: new Date(coupon.endDate).toISOString().split('T')[0],
        usageLimitTotal: coupon.usageLimit?.total || '',
        usageLimitPerUser: coupon.usageLimit?.perUser || 1,
        status: coupon.status,
      });
    } catch (error) {
      toast.error('Failed to load coupon');
      navigate('/admin/coupons');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);

      // Build the coupon data properly
      const couponData = {
        code: data.code.toUpperCase(),
        description: data.description || '',
        type: data.type,
        value: parseFloat(data.value),
        minimumBookingAmount: data.minimumBookingAmount ? parseFloat(data.minimumBookingAmount) : 0,
        minimumNights: parseInt(data.minimumNights) || 1,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status,
      };

      // Add maximumDiscount only if provided and type is percentage
      if (data.type === 'percentage' && data.maximumDiscount) {
        couponData.maximumDiscount = parseFloat(data.maximumDiscount);
      }

      // Add usageLimit object
      couponData.usageLimit = {
        perUser: parseInt(data.usageLimitPerUser) || 1,
      };
      
      if (data.usageLimitTotal) {
        couponData.usageLimit.total = parseInt(data.usageLimitTotal);
      }

      console.log('Submitting coupon data:', couponData);

      if (isEditing) {
        await adminApi.updateCoupon(id, couponData);
        toast.success('Coupon updated successfully');
      } else {
        await adminApi.createCoupon(couponData);
        toast.success('Coupon created successfully');
      }

      navigate('/admin/coupons');
    } catch (error) {
      console.error('Error saving coupon:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save coupon';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEOHead title={isEditing ? 'Edit Coupon' : 'Create Coupon'} />

      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/coupons')}
            className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Edit Coupon' : 'Create Coupon'}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Create discount codes for your customers
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-xl p-6 space-y-5">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Coupon Code *</label>
              <input
                type="text"
                {...register('code', { 
                  required: 'Code is required',
                  minLength: { value: 3, message: 'Minimum 3 characters' },
                  maxLength: { value: 20, message: 'Maximum 20 characters' },
                  pattern: { value: /^[A-Z0-9_-]+$/i, message: 'Only letters, numbers, hyphens and underscores' }
                })}
                className="input-field uppercase"
                placeholder="SUMMER20"
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="input-label">Status</label>
              <select {...register('status')} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Description</label>
            <input
              type="text"
              {...register('description')}
              className="input-field"
              placeholder="e.g., Summer special discount - 20% off"
            />
          </div>

          {/* Discount Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Discount Type *</label>
              <select {...register('type')} className="input-field">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="input-label">Discount Value *</label>
              <div className="relative">
                {couponType === 'percentage' ? (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">%</span>
                ) : (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                )}
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={couponType === 'percentage' ? 100 : undefined}
                  {...register('value', { 
                    required: 'Value is required',
                    min: { value: 0, message: 'Value must be positive' },
                    max: couponType === 'percentage' ? { value: 100, message: 'Percentage cannot exceed 100%' } : undefined
                  })}
                  className={`input-field ${couponType === 'percentage' ? 'pr-8' : 'pl-8'}`}
                  placeholder={couponType === 'percentage' ? '20' : '50'}
                />
              </div>
              {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>}
            </div>
          </div>

          {/* Minimum Requirements */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Minimum Booking Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('minimumBookingAmount')}
                  className="input-field pl-8"
                  placeholder="0.00 (no minimum)"
                />
              </div>
            </div>
            <div>
              <label className="input-label">Minimum Nights Required</label>
              <input
                type="number"
                min="1"
                {...register('minimumNights')}
                className="input-field"
                placeholder="1"
              />
            </div>
          </div>

          {/* For percentage coupons only */}
          {couponType === 'percentage' && (
            <div>
              <label className="input-label">Maximum Discount Amount (Optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('maximumDiscount')}
                  className="input-field pl-8"
                  placeholder="No maximum limit"
                />
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Cap the maximum discount amount for percentage coupons
              </p>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Start Date *</label>
              <input
                type="date"
                {...register('startDate', { required: 'Start date is required' })}
                className="input-field"
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="input-label">End Date *</label>
              <input
                type="date"
                {...register('endDate', { 
                  required: 'End date is required',
                  validate: (value) => {
                    const startDate = new Date(watch('startDate'));
                    const endDate = new Date(value);
                    return endDate > startDate || 'End date must be after start date';
                  }
                })}
                className="input-field"
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Total Usage Limit</label>
              <input
                type="number"
                min="0"
                {...register('usageLimitTotal')}
                className="input-field"
                placeholder="Unlimited"
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Maximum number of times this coupon can be used
              </p>
            </div>
            <div>
              <label className="input-label">Uses Per Customer</label>
              <input
                type="number"
                min="1"
                {...register('usageLimitPerUser')}
                className="input-field"
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                How many times a single customer can use this coupon
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 px-6 py-2.5"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <HiSave className="w-4 h-4" />
                  {isEditing ? 'Update Coupon' : 'Create Coupon'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminCouponForm;