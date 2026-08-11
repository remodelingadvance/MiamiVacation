import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiTag, HiEye } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import adminApi from '../config/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getCoupons();
      setCoupons(response.data.coupons);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleting(true);
      await adminApi.deleteCoupon(deleteId);
      toast.success('Coupon deactivated');
      fetchCoupons();
      setDeleteId(null);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to delete coupon');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'code',
      title: 'Code',
      render: (row) => (
        <Link to={`/admin/coupons/${row._id}`} className="font-mono text-[var(--color-primary)] font-bold hover:underline">
          {row.code}
        </Link>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: (row) => row.description || 'N/A',
    },
    {
      key: 'type',
      title: 'Type',
      render: (row) => (
        <span className="capitalize">{row.type}</span>
      ),
    },
    {
      key: 'value',
      title: 'Value',
      render: (row) => (
        <span className="font-semibold text-white">
          {row.type === 'percentage' ? `${row.value}%` : `$${row.value}`}
        </span>
      ),
    },
    {
      key: 'dates',
      title: 'Valid Period',
      render: (row) => (
        <div className="text-xs">
          <p>{formatDate(row.startDate)}</p>
          <p className="text-[var(--color-text-muted)]">to {formatDate(row.endDate)}</p>
        </div>
      ),
    },
    {
      key: 'usedCount',
      title: 'Usage',
      render: (row) => (
        <div className="text-sm">
          <span className="text-white">{row.usedCount}</span>
          {row.usageLimit?.total && (
            <span className="text-[var(--color-text-muted)]"> / {row.usageLimit.total}</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/coupons/${row._id}`}
            className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-info)] transition-colors"
            title="View Details"
          >
            <HiEye className="w-4 h-4" />
          </Link>
          <Link
            to={`/admin/coupons/${row._id}/edit`}
            className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            title="Edit"
          >
            <HiPencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setDeleteId(row._id)}
            className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
            title="Deactivate"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <SEOHead title="Manage Coupons" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Coupons</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Manage promotional codes ({coupons.length} total)
            </p>
          </div>
          <Link to="/admin/coupons/new" className="btn-primary flex items-center gap-2">
            <HiPlus className="w-5 h-5" />
            Create Coupon
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={coupons}
          loading={loading}
          emptyMessage="No coupons found"
        />
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Deactivate Coupon"
        message="Are you sure you want to deactivate this coupon? It will no longer be usable."
        loading={deleting}
      />
    </>
  );
};

export default AdminCoupons;
