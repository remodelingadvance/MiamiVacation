import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiEye, HiSearch, HiPhotograph } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import adminApi from '../config/api';
import { formatCurrency, truncateText } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProperties = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      
      const response = await adminApi.getProperties(params);
      setProperties(response.data.properties);
      setTotalItems(response.data.total || response.data.count);
    } catch (error) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(currentPage, searchQuery);
  }, [currentPage, fetchProperties]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchProperties(1, query);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleting(true);
      await adminApi.deleteProperty(deleteId);
      toast.success('Property deleted successfully');
      fetchProperties(currentPage, searchQuery);
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete property');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'images',
      title: 'Image',
      render: (row) => (
        <div className="w-16 h-12 rounded-lg overflow-hidden bg-[var(--color-bg-light)]">
          {row.images?.[0]?.url ? (
            <img src={row.images[0].url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiPhotograph className="w-5 h-5 text-[var(--color-text-muted)]" />
            </div>
          )}
        </div>
      ),
      width: '80px',
    },
    {
      key: 'name',
      title: 'Property Name',
      render: (row) => (
        <div>
          <Link to={`/admin/properties/${row._id}/edit`} className="text-white font-medium hover:text-[var(--color-primary)] transition-colors">
            {row.name}
          </Link>
          <p className="text-xs text-[var(--color-text-muted)]">{truncateText(row.description?.short, 60)}</p>
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Type',
      render: (row) => <span className="capitalize">{row.type}</span>,
    },
    {
      key: 'location.neighborhood',
      title: 'Location',
      render: (row) => row.location?.neighborhood || row.location?.city || 'N/A',
    },
    {
      key: 'pricing.basePrice',
      title: 'Price/Night',
      render: (row) => formatCurrency(row.pricing?.basePrice),
    },
    {
      key: 'ratings.average',
      title: 'Rating',
      render: (row) => (
        <span className="flex items-center gap-1">
          ⭐ {row.ratings?.average?.toFixed(1) || 'N/A'}
          <span className="text-xs text-[var(--color-text-muted)]">({row.ratings?.count || 0})</span>
        </span>
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
          <a
            href={`/properties/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-info)] transition-colors"
            title="View"
          >
            <HiEye className="w-4 h-4" />
          </a>
          <Link
            to={`/admin/properties/${row._id}/edit`}
            className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            title="Edit"
          >
            <HiPencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setDeleteId(row._id)}
            className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
            title="Delete"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      ),
      width: '120px',
    },
  ];

  return (
    <>
      <SEOHead title="Manage Properties" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Properties</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Manage all properties ({totalItems} total)
            </p>
          </div>
          <Link to="/admin/properties/new" className="btn-primary flex items-center gap-2">
            <HiPlus className="w-5 h-5" />
            Add Property
          </Link>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={properties}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onSearch={handleSearch}
          searchPlaceholder="Search properties..."
          emptyMessage="No properties found"
        />
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmText="Delete Property"
        loading={deleting}
      />
    </>
  );
};

export default AdminProperties;