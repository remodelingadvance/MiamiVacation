// pages/admin/AdminProperties.jsx - Complete working version
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiEye, 
  HiPhotograph,
  HiCalendar,
  HiFilter
} from 'react-icons/hi';
import { FaWrench } from "react-icons/fa";
import SEOHead from '../components/common/SEOHead';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import MaintenanceModal from '../components/admin/MaintenanceModal';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    maintenance_mode: 0,
    inactive: 0
  });

  const fetchProperties = useCallback(async (page = 1, search = '', filter = 'all') => {
    try {
      setLoading(true);
      const params = { page, limit: 10, statusFilter: filter };
      if (search) params.search = search;
      
      const response = await adminApi.get('/properties/admin/all-with-filter', { params });
      console.log('Fetched properties:', response.data);
      setProperties(response.data.properties || []);
      setTotalItems(response.data.total || 0);
      setCounts(response.data.counts || {
        all: response.data.total || 0,
        active: 0,
        maintenance_mode: 0,
        inactive: 0
      });
    } catch (error) {
      console.error('Failed to load properties:', error);
      toast.error('Failed to load properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(currentPage, searchQuery, statusFilter);
  }, [currentPage, statusFilter, searchQuery, fetchProperties]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleting(true);
      await adminApi.deleteProperty(deleteId);
      toast.success('Property deleted successfully');
      fetchProperties(currentPage, searchQuery, statusFilter);
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete property');
    } finally {
      setDeleting(false);
    }
  };

  const handleMaintenanceClick = (property) => {
    setSelectedProperty(property);
    setShowMaintenanceModal(true);
  };

  const handleMaintenanceSuccess = () => {
    fetchProperties(currentPage, searchQuery, statusFilter);
  };

  // Check if property has active maintenance
  const hasActiveMaintenance = (property) => {
    if (!property.maintenanceDates || property.maintenanceDates.length === 0) {
      return false;
    }
    const today = new Date();
    return property.maintenanceDates.some(md => {
      const start = new Date(md.startDate);
      const end = new Date(md.endDate);
      return start <= today && end >= today;
    });
  };

  // Get active maintenance count
  const getActiveMaintenanceCount = (property) => {
    const today = new Date();
    return property.maintenanceDates?.filter(md => {
      const start = new Date(md.startDate);
      const end = new Date(md.endDate);
      return start <= today && end >= today;
    }).length || 0;
  };

  const columns = [
    {
      key: 'images',
      title: 'Image',
      render: (row) => (
        <div className="w-16 h-12 rounded-lg overflow-hidden bg-[var(--color-bg-light)]">
          {row.images?.[0]?.url ? (
            <img src={row.images[0].url} alt={row.images[0].alt || `${row.name} property thumbnail`} className="w-full h-full object-cover" />
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
      render: (row) => <span className="capitalize text-sm">{row.type}</span>,
    },
    {
      key: 'location',
      title: 'Location',
      render: (row) => <span className="text-sm">{row.location?.neighborhood || row.location?.city || 'N/A'}</span>,
    },
    {
      key: 'pricing',
      title: 'Price/Night',
      render: (row) => <span className="text-sm">{formatCurrency(row.pricing?.basePrice)}</span>,
    },
    {
      key: 'rating',
      title: 'Rating',
      render: (row) => (
        <span className="flex items-center gap-1 text-sm">
          â­ {row.ratings?.average?.toFixed(1) || 'N/A'}
          <span className="text-xs text-[var(--color-text-muted)]">({row.ratings?.count || 0})</span>
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => {
        // Show Under Maintenance badge if property has active maintenance
        if (hasActiveMaintenance(row)) {
          return <StatusBadge status="maintenance" />;
        }
        return <StatusBadge status={row.status} />;
      },
    },
    {
      key: 'maintenanceCount',
      title: 'Maintenance',
      render: (row) => {
        const activeCount = getActiveMaintenanceCount(row);
        const totalCount = row.maintenanceDates?.length || 0;
        
        if (activeCount > 0) {
          return (
            <div className="flex items-center gap-1">
              <FaWrench className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-yellow-500">Active Maintenance</span>
            </div>
          );
        }
        
        return (
          <div className="flex items-center gap-1">
            <HiCalendar className="w-3 h-3 text-[var(--color-text-muted)]" />
            <span className="text-xs text-[var(--color-text-muted)]">
              {totalCount} {totalCount === 1 ? 'period' : 'periods'}
            </span>
          </div>
        );
      },
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
            onClick={() => handleMaintenanceClick(row)}
            className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-yellow-500 transition-colors"
            title="Manage Maintenance"
          >
            <FaWrench className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row._id)}
            className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
            title="Delete"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      ),
      width: '160px',
    },
  ];

  const filterButtons = [
    { key: 'all', label: 'All Properties', icon: HiFilter },
    { key: 'active', label: 'Active', icon: null },
    { key: 'maintenance_mode', label: 'Under Maintenance', icon: FaWrench },
    { key: 'inactive', label: 'Inactive', icon: null },
  ];

  return (
    <>
      <SEOHead title="Manage Properties" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
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

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleStatusFilterChange(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                statusFilter === filter.key
                  ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
                  : 'glass-light text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              {filter.icon && <filter.icon className="w-4 h-4" />}
              {filter.label}
              {counts[filter.key] !== undefined && (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                  statusFilter === filter.key
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-[var(--color-text-muted)]'
                }`}>
                  {counts[filter.key]}
                </span>
              )}
            </button>
          ))}
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
          searchPlaceholder="Search properties by name or location..."
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

      {/* Maintenance Modal */}
      {selectedProperty && (
        <MaintenanceModal
          isOpen={showMaintenanceModal}
          onClose={() => {
            setShowMaintenanceModal(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
          onSuccess={handleMaintenanceSuccess}
        />
      )}
    </>
  );
};

export default AdminProperties;
