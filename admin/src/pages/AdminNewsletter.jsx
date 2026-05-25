// pages/admin/AdminNewsletter.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  HiPlus,
  HiPaperAirplane,
  HiDownload,
  HiEye,
  HiPencil,
  HiTrash,
  HiUsers,
  HiChartBar,
  HiMail,
  HiClock,
  HiCheck,
  HiX,
  HiRefresh,
} from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import adminApi from '../config/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminNewsletter = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [subscriberStats, setSubscriberStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    content: '',
    status: 'draft',
    targetAudience: 'all',
  });

  // Fetch campaigns - FIXED: Use correct API endpoint
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      // Use the correct endpoint from adminApi
      const response = await adminApi.getCampaigns({ page: 1, limit: 100 });
      console.log('Campaigns response:', response.data);
      setCampaigns(response.data.campaigns || []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch subscribers - FIXED: Use correct API endpoint
  const fetchSubscribers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminApi.getSubscribers({ page, limit: 20 });
      console.log('Subscribers response:', response.data);
      setSubscribers(response.data.subscribers || []);
      setTotalSubscribers(response.data.total || 0);
      setSubscriberStats(response.data.stats || {});
    } catch (error) {
      console.error('Failed to load subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (activeTab === 'campaigns') {
      fetchCampaigns();
    } else {
      fetchSubscribers(currentPage);
    }
  }, [activeTab, currentPage, fetchCampaigns, fetchSubscribers]);

  // Create campaign - FIXED: Use correct API endpoint
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    // Validate
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
      toast.error(error.response?.data?.message || 'Failed to create campaign');
    }
  };

  // Send campaign - FIXED: Use correct API endpoint
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
      toast.error(error.response?.data?.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  // Delete campaign - FIXED: Use correct API endpoint
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await adminApi.deleteCampaign(deleteId);
      toast.success('Campaign deleted');
      setDeleteId(null);
      fetchCampaigns();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete campaign');
    } finally {
      setDeleting(false);
    }
  };

  // Export subscribers
  const handleExportSubscribers = async () => {
    try {
      const response = await adminApi.exportSubscribers();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `subscribers-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Subscribers exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };

  // Table columns
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

  const subscriberColumns = [
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
      title: 'Name',
      render: (row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {row.firstName || 'N/A'}
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
            : 'bg-red-500/10 text-red-500'
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
                : `Manage subscribers (${totalSubscribers} total)`
              }
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Toggle tabs */}
            <div className="flex rounded-lg glass-light p-1">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'campaigns'
                    ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
                    : 'text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                <HiMail className="w-4 h-4 inline mr-1" />
                Campaigns
              </button>
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'subscribers'
                    ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
                    : 'text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                <HiUsers className="w-4 h-4 inline mr-1" />
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
              <button
                onClick={handleExportSubscribers}
                className="btn-outline flex items-center gap-2 text-sm"
              >
                <HiDownload className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Subscriber Stats */}
        {activeTab === 'subscribers' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="stat-card text-center">
              <HiUsers className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{subscriberStats.total || totalSubscribers}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Total</p>
            </div>
            <div className="stat-card text-center">
              <HiCheck className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-500">{subscriberStats.active || 0}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Active</p>
            </div>
            <div className="stat-card text-center">
              <HiX className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-500">{subscriberStats.unsubscribed || 0}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Unsubscribed</p>
            </div>
            <div className="stat-card text-center">
              <HiRefresh className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-500">{subscriberStats.bounced || 0}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Bounced</p>
            </div>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          columns={activeTab === 'campaigns' ? campaignColumns : subscriberColumns}
          data={activeTab === 'campaigns' ? campaigns : subscribers}
          loading={loading}
          totalItems={activeTab === 'subscribers' ? totalSubscribers : campaigns.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onSearch={activeTab === 'subscribers' ? (query) => {
            setSearchQuery(query);
            setCurrentPage(1);
            fetchSubscribers(1, query);
          } : undefined}
          searchPlaceholder="Search subscribers..."
          emptyMessage={activeTab === 'campaigns' ? 'No campaigns yet. Create your first campaign!' : 'No subscribers found'}
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign? This action cannot be undone."
        confirmText="Delete Campaign"
        loading={deleting}
      />
    </>
  );
};

export default AdminNewsletter;