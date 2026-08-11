import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiEye, HiPencil, HiTrash, HiShieldCheck, HiUserGroup } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import adminApi from '../config/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async (page = 1, search = '', role = '') => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (role) params.role = role;
      
      const response = await adminApi.getUsers(params);
      setUsers(response.data.users);
      setTotalItems(response.data.total || response.data.count);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, searchQuery, filterRole);
  }, [currentPage, searchQuery, filterRole, fetchUsers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleting(true);
      await adminApi.deleteUser(deleteId);
      toast.success('User deleted successfully');
      setUsers((prev) => prev.filter((user) => user._id !== deleteId));
      setTotalItems((prev) => Math.max(prev - 1, 0));

      const nextPage = users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
      } else {
        fetchUsers(nextPage, searchQuery, filterRole);
      }

      setDeleteId(null);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUser(userId, { role: newRole });
      toast.success('User role updated');
      fetchUsers(currentPage, searchQuery, filterRole);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to update user role');
    }
  };

  const columns = [
    {
      key: 'user',
      title: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[var(--color-primary)] font-semibold text-sm">
              {row.firstName?.[0]}{row.lastName?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <Link to={`/admin/users/${row._id}`} className="text-white font-medium hover:text-[var(--color-primary)] transition-colors block truncate">
              {row.firstName} {row.lastName}
            </Link>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (row) => row.phone || 'N/A',
    },
    {
      key: 'role',
      title: 'Role',
      render: (row) => (
        <select
          value={row.role}
          onChange={(e) => handleRoleChange(row._id, e.target.value)}
          className="text-xs px-2 py-1 rounded-lg bg-[var(--color-bg-light)] border border-white/10 text-white cursor-pointer"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super-admin">Super Admin</option>
        </select>
      ),
    },
    {
      key: 'isVerified',
      title: 'Verified',
      render: (row) => (
        <span className={`inline-flex items-center gap-1 text-xs ${row.isVerified ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
          {row.isVerified ? '✅' : '⚠️'} {row.isVerified ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          row.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
        }`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Joined',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'bookings',
      title: 'Bookings',
      render: (row) => row.bookings?.length || 0,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/users/${row._id}`}
            className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-info)] transition-colors"
            title="View"
          >
            <HiEye className="w-4 h-4" />
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
      width: '100px',
    },
  ];

  return (
    <>
      <SEOHead title="Manage Users" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Users</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Manage all users ({totalItems} total)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
              className="input-field w-auto py-2 text-sm"
            >
              <option value="">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
              <option value="super-admin">Super Admins</option>
            </select>
            <HiUserGroup className="w-5 h-5 text-[var(--color-text-muted)]" />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onSearch={setSearchQuery}
          searchPlaceholder="Search users by name or email..."
          emptyMessage="No users found"
        />
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? Their account will be removed from the admin user list and they will no longer be able to access it."
        confirmText="Delete User"
        loading={deleting}
      />
    </>
  );
};

export default AdminUsers;
