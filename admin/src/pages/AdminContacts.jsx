import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiReply, HiEye, HiCheck, HiX } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import adminApi from '../config/api';
import { formatDate, truncateText } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchContacts = useCallback(async (page = 1, status = '') => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (status) params.status = status;
      
      const response = await adminApi.getContacts(params);
      setContacts(response.data.contacts);
      setTotalItems(response.data.total || response.data.count);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts(currentPage, filterStatus);
  }, [currentPage, filterStatus, fetchContacts]);

  const handleReply = async () => {
    if (!selectedContact || !replyText) return;

    try {
      setReplying(true);
      await adminApi.replyToContact(selectedContact._id, replyText);
      toast.success('Reply sent');
      setReplyText('');
      setShowDetailModal(false);
      fetchContacts(currentPage, filterStatus);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const handleStatusUpdate = async (contactId, status) => {
    try {
      await adminApi.updateContactStatus(contactId, { status });
      toast.success(`Contact marked as ${status}`);
      fetchContacts(currentPage, filterStatus);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to update status');
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Contact',
      render: (row) => (
        <div>
          <Link
            to={`/admin/contacts/${row._id}`}
            className="text-white font-medium hover:text-[var(--color-primary)] transition-colors"
          >
            {row.name}
          </Link>
          <p className="text-xs text-[var(--color-text-muted)]">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'subject',
      title: 'Subject',
      render: (row) => (
        <span className="capitalize text-sm">{row.subject}</span>
      ),
    },
    {
      key: 'message',
      title: 'Message',
      render: (row) => truncateText(row.message, 100),
    },
    {
      key: 'createdAt',
      title: 'Date',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          row.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
          row.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
          row.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
          'bg-gray-500/10 text-gray-500'
        }`}>
          {row.priority}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/contacts/${row._id}`}
            className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-info)] transition-colors"
            title="View Details"
          >
            <HiEye className="w-4 h-4" />
          </Link>
          {row.status !== 'resolved' && (
            <button
              onClick={() => handleStatusUpdate(row._id, 'resolved')}
              className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 hover:bg-green-500/20 transition-colors"
              title="Mark Resolved"
            >
              <HiCheck className="w-4 h-4" />
            </button>
          )}
          {row.status !== 'spam' && (
            <button
              onClick={() => handleStatusUpdate(row._id, 'spam')}
              className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors"
              title="Mark Spam"
            >
              <HiX className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      width: '120px',
    },
  ];

  return (
    <>
      <SEOHead title="Manage Contacts" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Contact Messages</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Manage inquiries ({totalItems} total)
            </p>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="input-field w-auto py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="resolved">Resolved</option>
            <option value="spam">Spam</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={contacts}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          emptyMessage="No messages found"
        />
      </div>
    </>
  );
};

export default AdminContacts;
