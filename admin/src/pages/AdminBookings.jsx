import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiEye, HiDownload, HiFilter, HiChevronRight } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import adminApi from '../config/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchBookings = useCallback(async (page = 1, status = '') => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (status) params.status = status;
      
      const response = await adminApi.getAllBookings(params);
      setBookings(response.data.bookings);
      setTotalItems(response.data.total || response.data.count);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(currentPage, filterStatus);
  }, [currentPage, filterStatus, fetchBookings]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await adminApi.updateBookingStatus(bookingId, newStatus);
      toast.success(`Booking status updated to ${newStatus}`);
      fetchBookings(currentPage, filterStatus);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to update booking status');
    }
  };

  const handleViewDetails = (bookingId) => {
    navigate(`/admin/bookings/${bookingId}`);
  };

  const columns = [
    {
      key: 'bookingNumber',
      title: 'Booking #',
      render: (row) => (
        <button
          onClick={() => handleViewDetails(row._id)}
          className="text-[var(--color-primary)] hover:underline font-mono text-xs flex items-center gap-1"
        >
          {row.bookingNumber}
          <HiChevronRight className="w-3 h-3" />
        </button>
      ),
    },
    {
      key: 'user',
      title: 'Guest',
      render: (row) => (
        <div>
          <p className="text-white text-sm">{row.user?.firstName} {row.user?.lastName}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{row.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'property',
      title: 'Property',
      render: (row) => row.property?.name || 'N/A',
    },
    {
      key: 'checkIn',
      title: 'Dates',
      render: (row) => (
        <div className="text-xs">
          <p>{formatDate(row.checkIn)}</p>
          <p className="text-[var(--color-text-muted)]">to {formatDate(row.checkOut)}</p>
        </div>
      ),
    },
    {
      key: 'guests',
      title: 'Guests',
      render: (row) => row.guests?.adults + (row.guests?.children || 0),
    },
    {
      key: 'pricing.total',
      title: 'Amount',
      render: (row) => (
        <div>
          <p className="font-medium">{formatCurrency(row.pricing?.total)}</p>
          <StatusBadge status={row.payment?.status} />
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusUpdate(row._id, e.target.value)}
          className="text-xs px-2 py-1 rounded-lg bg-[var(--color-bg-light)] border border-white/10 text-white cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </select>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleViewDetails(row._id)}
          className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors"
          title="View Details"
        >
          <HiEye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <>
      <SEOHead title="Manage Bookings" />

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Bookings</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Manage all bookings ({totalItems} total)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="input-field w-auto py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={bookings}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          emptyMessage="No bookings found"
          onRowClick={(row) => handleViewDetails(row._id)}
        />
      </div>
    </>
  );
};

export default AdminBookings;
