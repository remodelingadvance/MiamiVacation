// pages/admin/AdminNewsletter.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  HiPlus,
  HiPaperAirplane,
  HiDownload,
  HiEye,
  HiTrash,
  HiUsers,
  HiMail,
  HiCheck,
  HiX,
  HiRefresh,
  HiUserAdd,
  HiFilter,
} from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SubscriberImportModal from '../components/admin/SubscriberImportModal';
import adminApi from '../config/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const SUBSCRIBER_PAGE_SIZE = 20;

const AdminNewsletter = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [subscriberStats, setSubscriberStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [exportFilter, setExportFilter] = useState('all');

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    content: '',
    status: 'draft',
    targetAudience: 'all',
  });

  const currentPageSubscriberIds = subscribers.map((subscriber) => subscriber._id);
  const allCurrentPageSubscribersSelected =
    currentPageSubscriberIds.length > 0 &&
    currentPageSubscriberIds.every((id) => selectedSubscribers.includes(id));

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getCampaigns({ page: 1, limit: 100 });
      setCampaigns(response.data.campaigns || []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch subscribers with pagination for display
  const fetchSubscribers = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = { page, limit: SUBSCRIBER_PAGE_SIZE };
      if (search) params.search = search;
      
      const response = await adminApi.getSubscribers(params);
      setSubscribers(response.data.subscribers || []);
      setTotalSubscribers(response.data.total || 0);
      setActiveCount(response.data.activeCount || 0);
      setSubscriberStats(response.data.stats || {});
    } catch (error) {
      console.error('Failed to load subscribers:', error);
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (activeTab === 'campaigns') {
      fetchCampaigns();
    } else {
      fetchSubscribers(currentPage, searchQuery);
    }
  }, [activeTab, currentPage, searchQuery, fetchCampaigns, fetchSubscribers]);

  // Create campaign
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    if (!campaignForm.name.trim()) {
      toast.error('Campaign name is required');
      return;
    }
    if (!campaignForm.subject.trim()) {
      toast.error('Email subject is required');
      return;
    }
    if (!campaignForm.content.trim()) {
      toast.error('Email content is required');
      return;
    }

    try {
      const response = await adminApi.createCampaign(campaignForm);
      if (response.data.success) {
        toast.success('Campaign created successfully');
        setShowCreateModal(false);
        setCampaignForm({ 
          name: '', 
          subject: '', 
          content: '', 
          status: 'draft', 
          targetAudience: 'all' 
        });
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Create campaign error:', error);
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to create campaign');
    }
  };

  // Send campaign
  const handleSendCampaign = async (campaignId) => {
    try {
      setSending(true);
      const response = await adminApi.sendCampaign(campaignId);
      if (response.data.success) {
        toast.success('Campaign sending started');
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Send campaign error:', error);
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await adminApi.deleteCampaign(deleteId);
      toast.success('Campaign deleted');
      setDeleteId(null);
      fetchCampaigns();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to delete campaign');
    } finally {
      setDeleting(false);
    }
  };

  // Delete single subscriber
  const handleDeleteSubscriber = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await adminApi.deleteSubscriber(deleteId);
      toast.success('Subscriber deleted');
      setDeleteId(null);

      const nextPage = subscribers.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
      } else {
        fetchSubscribers(nextPage, searchQuery);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to delete subscriber');
    } finally {
      setDeleting(false);
    }
  };

  // Bulk delete subscribers
  const handleBulkDeleteSubscribers = async () => {
    if (selectedSubscribers.length === 0) return;
    
    try {
      setDeleting(true);
      const response = await adminApi.bulkDeleteSubscribers(selectedSubscribers);
      const deletedCount = response.data.deletedCount ?? selectedSubscribers.length;
      toast.success(`${deletedCount} subscriber${deletedCount === 1 ? '' : 's'} deleted`);

      const deletedFromCurrentPage = subscribers.filter((subscriber) =>
        selectedSubscribers.includes(subscriber._id)
      ).length;
      const nextPage =
        deletedFromCurrentPage >= subscribers.length && currentPage > 1
          ? currentPage - 1
          : currentPage;

      setSelectedSubscribers([]);
      setShowBulkDeleteConfirm(false);
      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
      } else {
        fetchSubscribers(nextPage, searchQuery);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to delete subscribers');
    } finally {
      setDeleting(false);
    }
  };

  // Export ALL subscribers (not just current page)
  const handleExportSubscribers = async (format = 'csv', status = null) => {
    try {
      setExportStatus('exporting');
      const loadingToast = toast.loading(`Preparing to export all subscribers...`);
      
      // First get total count
      const statsResponse = await adminApi.getSubscribers({ limit: 1 });
      const totalCount = statsResponse.data.total || 0;
      
      if (totalCount === 0) {
        toast.dismiss(loadingToast);
        toast.error('No subscribers to export');
        setExportStatus(null);
        return;
      }
      
      toast.loading(`Exporting ${totalCount} subscribers to ${format.toUpperCase()}...`, { id: loadingToast });
      
      // Build URL with filters
      let url = `/newsletter/admin/export?format=${format}`;
      if (status && status !== 'all') {
        url += `&status=${status}`;
      }
      
      const response = await adminApi.get(url, {
        responseType: 'blob',
      });
      
      toast.dismiss(loadingToast);
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv' 
      });
      const url_blob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url_blob;
      const statusText = status && status !== 'all' ? `-${status}` : '';
      link.setAttribute('download', `subscribers${statusText}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url_blob);
      
      toast.success(`Successfully exported ${totalCount} subscribers`);
      setExportStatus(null);
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
      setExportStatus(null);
    }
  };

  // Handle subscriber selection for bulk delete
  const handleSelectSubscriber = (subscriberId, checked) => {
    if (checked) {
      setSelectedSubscribers(prev => [...prev, subscriberId]);
    } else {
      setSelectedSubscribers(prev => prev.filter(id => id !== subscriberId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedSubscribers((prev) => Array.from(new Set([...prev, ...currentPageSubscriberIds])));
    } else {
      setSelectedSubscribers((prev) => prev.filter((id) => !currentPageSubscriberIds.includes(id)));
    }
  };

  const handleSubscriberSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setSelectedSubscribers([]);
  };

  // Campaign Table Columns
  const campaignColumns = [
    {
      key: 'name',
      title: 'Campaign Name',
      render: (row) => (
        <button
          onClick={() => { setSelectedCampaign(row); setShowDetailModal(true); }}
          className="text-white font-medium hover:text-[var(--color-primary)] transition-colors text-left"
        >
          {row.name}
        </button>
      ),
    },
    {
      key: 'subject',
      title: 'Subject',
      render: (row) => <span className="text-sm text-[var(--color-text-secondary)]">{row.subject}</span>,
    },
    {
      key: 'targetAudience',
      title: 'Target',
      render: (row) => (
        <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-white/5 text-[var(--color-text-secondary)]">
          {row.targetAudience}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'recipients',
      title: 'Sent',
      render: (row) => (
        <div className="text-sm">
          <span className="text-white font-medium">{row.recipients?.sent || 0}</span>
          <span className="text-[var(--color-text-muted)]">/{row.recipients?.total || 0}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (row) => <span className="text-xs text-[var(--color-text-muted)]">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {(row.status === 'draft' || row.status === 'scheduled') && (
            <button
              onClick={() => handleSendCampaign(row._id)}
              disabled={sending}
              className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50"
              title="Send Now"
            >
              <HiPaperAirplane className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => { setSelectedCampaign(row); setShowDetailModal(true); }}
            className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors"
            title="View Details"
          >
            <HiEye className="w-4 h-4" />
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
      width: '130px',
    },
  ];

  // Subscriber Table Columns
  const subscriberColumns = [
    {
      key: 'select',
      title: () => (
        <input
          type="checkbox"
          checked={allCurrentPageSubscribersSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          aria-label="Select all subscribers on this page"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedSubscribers.includes(row._id)}
          onChange={(e) => handleSelectSubscriber(row._id, e.target.checked)}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          aria-label={`Select subscriber ${row.email}`}
        />
      ),
      width: '50px',
    },
    {
      key: 'email',
      title: 'Email',
      render: (row) => (
        <div className="flex items-center gap-2">
          <HiMail className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
          <span className="text-white text-sm">{row.email}</span>
        </div>
      ),
    },
    {
      key: 'firstName',
      title: 'First Name',
      render: (row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {row.firstName || '-'}
        </span>
      ),
    },
    {
      key: 'lastName',
      title: 'Last Name',
      render: (row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {row.lastName || '-'}
        </span>
      ),
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {row.phone || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          row.status === 'active' 
            ? 'bg-green-500/10 text-green-500' 
            : row.status === 'unsubscribed'
            ? 'bg-red-500/10 text-red-500'
            : 'bg-yellow-500/10 text-yellow-500'
        }`}>
          {row.status === 'active' ? <HiCheck className="w-3 h-3" /> : <HiX className="w-3 h-3" />}
          {row.status}
        </span>
      ),
    },
    {
      key: 'source',
      title: 'Source',
      render: (row) => (
        <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-white/5 text-[var(--color-text-secondary)]">
          {row.source || 'unknown'}
        </span>
      ),
    },
    {
      key: 'subscribedAt',
      title: 'Subscribed',
      render: (row) => (
        <span className="text-xs text-[var(--color-text-muted)]">
          {formatDate(row.subscribedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <button
          onClick={() => setDeleteId(row._id)}
          className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
          title="Delete"
        >
          <HiTrash className="w-4 h-4" />
        </button>
      ),
      width: '60px',
    },
  ];

  return (
    <>
      <SEOHead title="Newsletter Management" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Newsletter</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {activeTab === 'campaigns' 
                ? `Manage email campaigns (${campaigns.length} total)`
                : `Manage ${totalSubscribers.toLocaleString()} subscribers (${activeCount.toLocaleString()} active)`
              }
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Toggle tabs */}
            <div className="flex rounded-lg glass-light p-1">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'campaigns'
                    ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
                    : 'text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                <HiMail className="w-4 h-4" />
                Campaigns
              </button>
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'subscribers'
                    ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
                    : 'text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                <HiUsers className="w-4 h-4" />
                Subscribers
              </button>
            </div>

            {activeTab === 'campaigns' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <HiPlus className="w-4 h-4" />
                New Campaign
              </button>
            )}
            
            {activeTab === 'subscribers' && (
              <>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <HiUserAdd className="w-4 h-4" />
                  Add Subscriber
                </button>
                
                {selectedSubscribers.length > 0 && (
                  <button
                    onClick={() => setShowBulkDeleteConfirm(true)}
                    className="btn-outline flex items-center gap-2 text-sm text-red-500 border-red-500/30 hover:bg-red-500/10"
                  >
                    <HiTrash className="w-4 h-4" />
                    Delete ({selectedSubscribers.length})
                  </button>
                )}
                
                {/* Export Dropdown with Filter Options */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={exportStatus === 'exporting'}
                    className="btn-outline flex items-center gap-2 text-sm"
                  >
                    <HiDownload className="w-4 h-4" />
                    {exportStatus === 'exporting' ? 'Exporting...' : 'Export All'}
                    <HiFilter className="w-3 h-3" />
                  </button>
                  
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-64 glass-strong rounded-lg overflow-hidden shadow-xl z-20">
                      <div className="p-2 border-b border-white/10">
                        <p className="text-xs text-[var(--color-text-muted)] px-2 mb-1">Filter by status</p>
                        <select
                          value={exportFilter}
                          onChange={(e) => setExportFilter(e.target.value)}
                          className="input-field text-sm w-full"
                        >
                          <option value="all">All Subscribers ({totalSubscribers})</option>
                          <option value="active">Active Only ({subscriberStats.active || activeCount})</option>
                          <option value="unsubscribed">Unsubscribed ({subscriberStats.unsubscribed || 0})</option>
                          <option value="bounced">Bounced ({subscriberStats.bounced || 0})</option>
                        </select>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => handleExportSubscribers('csv', exportFilter)}
                          className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-white/5 transition-colors rounded-lg flex items-center justify-between"
                        >
                          <span>Export as CSV</span>
                          <span className="text-xs text-[var(--color-text-muted)]">.csv</span>
                        </button>
                        <button
                          onClick={() => handleExportSubscribers('excel', exportFilter)}
                          className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-white/5 transition-colors rounded-lg flex items-center justify-between"
                        >
                          <span>Export as Excel</span>
                          <span className="text-xs text-[var(--color-text-muted)]">.xlsx</span>
                        </button>
                      </div>
                      <div className="p-2 border-t border-white/10">
                        <p className="text-xs text-[var(--color-text-muted)] px-2">
                          Total subscribers in export: {exportFilter === 'all' ? totalSubscribers : 
                            exportFilter === 'active' ? (subscriberStats.active || activeCount) :
                            exportFilter === 'unsubscribed' ? (subscriberStats.unsubscribed || 0) :
                            (subscriberStats.bounced || 0)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Subscriber Stats */}
        {activeTab === 'subscribers' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="stat-card text-center">
              <HiUsers className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalSubscribers.toLocaleString()}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Total Subscribers</p>
            </div>
            <div className="stat-card text-center">
              <HiCheck className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-500">{(subscriberStats.active || activeCount).toLocaleString()}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Active</p>
            </div>
            <div className="stat-card text-center">
              <HiX className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-500">{(subscriberStats.unsubscribed || 0).toLocaleString()}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Unsubscribed</p>
            </div>
            <div className="stat-card text-center">
              <HiRefresh className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-500">{(subscriberStats.bounced || 0).toLocaleString()}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Bounced</p>
            </div>
          </div>
        )}

        {/* Info message about export */}
        {activeTab === 'subscribers' && totalSubscribers > 20 && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
            <p className="text-xs text-blue-400">
              <HiDownload className="w-3 h-3 inline mr-1" />
              Exporting will download all {totalSubscribers.toLocaleString()} subscribers, not just the current page.
            </p>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          columns={activeTab === 'campaigns' ? campaignColumns : subscriberColumns}
          data={activeTab === 'campaigns' ? campaigns : subscribers}
          loading={loading}
          totalItems={activeTab === 'subscribers' ? totalSubscribers : campaigns.length}
          currentPage={activeTab === 'subscribers' ? currentPage : 1}
          onPageChange={activeTab === 'subscribers' ? setCurrentPage : undefined}
          onSearch={activeTab === 'subscribers' ? handleSubscriberSearch : undefined}
          searchPlaceholder="Search by email, name..."
          pageSize={activeTab === 'subscribers' ? SUBSCRIBER_PAGE_SIZE : Math.max(campaigns.length, 1)}
          emptyMessage={activeTab === 'campaigns' ? 'No campaigns yet. Create your first campaign!' : 'No subscribers found. Click "Add Subscriber" to get started!'}
        />
      </div>

      {/* Create Campaign Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Newsletter Campaign"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn-outline text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="campaign-form"
              className="btn-primary text-sm flex items-center gap-2"
            >
              <HiPlus className="w-4 h-4" />
              Create Campaign
            </button>
          </>
        }
      >
        <form id="campaign-form" onSubmit={handleCreateCampaign} className="space-y-4">
          <div>
            <label className="input-label">Campaign Name *</label>
            <input
              type="text"
              value={campaignForm.name}
              onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              className="input-field"
              required
              placeholder="Summer Promotion 2024"
            />
          </div>
          <div>
            <label className="input-label">Email Subject *</label>
            <input
              type="text"
              value={campaignForm.subject}
              onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
              className="input-field"
              required
              placeholder="Exclusive Summer Deals Inside! 🌴"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Status</label>
              <select
                value={campaignForm.status}
                onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })}
                className="input-field"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="input-label">Target Audience</label>
              <select
                value={campaignForm.targetAudience}
                onChange={(e) => setCampaignForm({ ...campaignForm, targetAudience: e.target.value })}
                className="input-field"
              >
                <option value="all">All Subscribers</option>
                <option value="active">Active Only</option>
                <option value="new">New (Last 30 days)</option>
                <option value="returning">Returning</option>
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Email Content (HTML) *</label>
            <textarea
              value={campaignForm.content}
              onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
              className="input-field resize-none font-mono text-sm"
              rows={12}
              required
              placeholder="<h1>Hello!</h1><p>Your newsletter content here...</p>"
            />
          </div>
        </form>
      </Modal>

      {/* Campaign Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Campaign: ${selectedCampaign?.name || ''}`}
        size="lg"
      >
        {selectedCampaign && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="stat-card text-center">
                <p className="text-xl font-bold text-white">{selectedCampaign.recipients?.total || 0}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Total Recipients</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-xl font-bold text-green-500">{selectedCampaign.recipients?.sent || 0}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Sent</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-xl font-bold text-blue-500">{selectedCampaign.recipients?.opened || 0}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Opened</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-xl font-bold text-purple-500">{selectedCampaign.recipients?.clicked || 0}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Clicked</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Subject</p>
              <p className="text-white font-medium">{selectedCampaign.subject}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Target Audience</p>
              <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-white/5 text-white">
                {selectedCampaign.targetAudience}
              </span>
            </div>

            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Status</p>
              <StatusBadge status={selectedCampaign.status} />
            </div>

            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Created</p>
              <p className="text-white">{formatDate(selectedCampaign.createdAt)}</p>
            </div>

            {selectedCampaign.sentAt && (
              <div>
                <p className="text-sm text-[var(--color-text-muted)] mb-1">Sent At</p>
                <p className="text-white">{formatDate(selectedCampaign.sentAt)}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-2">Content Preview</p>
              <div className="p-4 rounded-lg bg-white/5 max-h-96 overflow-y-auto border border-white/5">
                <div 
                  dangerouslySetInnerHTML={{ __html: selectedCampaign.content }}
                  className="prose prose-invert max-w-none text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Subscriber Import Modal */}
      <SubscriberImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => fetchSubscribers(currentPage, searchQuery)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={activeTab === 'campaigns' ? handleDeleteCampaign : handleDeleteSubscriber}
        title={activeTab === 'campaigns' ? "Delete Campaign" : "Delete Subscriber"}
        message={activeTab === 'campaigns' 
          ? "Are you sure you want to delete this campaign? This action cannot be undone."
          : "Are you sure you want to delete this subscriber? This action cannot be undone."
        }
        confirmText="Delete"
        loading={deleting}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDeleteSubscribers}
        title="Delete Subscribers"
        message={`Are you sure you want to delete ${selectedSubscribers.length} subscriber(s)? This action cannot be undone.`}
        confirmText="Delete All"
        loading={deleting}
      />
    </>
  );
};

export default AdminNewsletter;
