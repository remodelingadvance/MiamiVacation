import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiStar, HiCheck, HiX, HiFlag, HiEye } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import adminApi from '../config/api';
import { formatDate, truncateText } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [moderateAction, setModerateAction] = useState(null); // { id, status }
  const [showModerateModal, setShowModerateModal] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [responseText, setResponseText] = useState('');

  const fetchReviews = useCallback(async (page = 1, status = '') => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (status) params.status = status;
      
      const response = await adminApi.getAllReviews(params);
      setReviews(response.data.reviews);
      setTotalItems(response.data.total || response.data.count);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(currentPage, filterStatus);
  }, [currentPage, filterStatus, fetchReviews]);

  // Open moderate modal for approve/reject
  const openModerateModal = (review, action) => {
    setSelectedReview(review);
    setModerateAction({ id: review._id, status: action });
    setResponseText('');
    setShowModerateModal(true);
  };

  // Handle the actual moderation API call
  const handleModerate = async () => {
    if (!moderateAction) return;

    try {
      setModerating(true);
      await adminApi.moderateReview(moderateAction.id, { 
        status: moderateAction.status,
        response: responseText.trim() || undefined,
      });
      toast.success(`Review ${moderateAction.status} successfully`);
      
      // Refresh the list
      await fetchReviews(currentPage, filterStatus);
      
      // Reset state
      setShowModerateModal(false);
      setModerateAction(null);
      setSelectedReview(null);
      setResponseText('');
    } catch (error) {
      const message = error.userMessage || error.response?.data?.message || 'Failed to moderate review';
      toast.error(message);
    } finally {
      setModerating(false);
    }
  };

  // Close moderate modal
  const closeModerateModal = () => {
    setShowModerateModal(false);
    setModerateAction(null);
    setResponseText('');
  };

  const columns = [
    {
      key: 'review',
      title: 'Review',
      render: (row) => (
        <div className="max-w-xs">
          <button
            onClick={() => { setSelectedReview(row); setShowDetailModal(true); }}
            className="text-white font-medium hover:text-[var(--color-primary)] transition-colors text-left block"
          >
            {row.title}
          </button>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{truncateText(row.content, 80)}</p>
        </div>
      ),
    },
    {
      key: 'user',
      title: 'Guest',
      render: (row) => (
        <div>
          <p className="text-white text-sm">{row.user?.firstName} {row.user?.lastName}</p>
          {row.verified && <span className="text-xs text-[var(--color-success)]">Verified Stay</span>}
        </div>
      ),
    },
    {
      key: 'property',
      title: 'Property',
      render: (row) => (
        <p className="text-sm">{row.property?.name || 'N/A'}</p>
      ),
    },
    {
      key: 'rating',
      title: 'Rating',
      render: (row) => (
        <div className="flex items-center gap-1">
          <HiStar className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-white font-medium">{row.rating}</span>
        </div>
      ),
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
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => openModerateModal(row, 'approved')}
                className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 hover:bg-green-500/20 transition-colors"
                title="Approve Review"
              >
                <HiCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => openModerateModal(row, 'rejected')}
                className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors"
                title="Reject Review"
              >
                <HiX className="w-4 h-4" />
              </button>
            </>
          )}
          {(row.status === 'approved' || row.status === 'rejected') && (
            <button
              onClick={() => openModerateModal(row, row.status === 'approved' ? 'rejected' : 'approved')}
              className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 hover:bg-yellow-500/20 transition-colors"
              title={`Change to ${row.status === 'approved' ? 'Rejected' : 'Approved'}`}
            >
              <HiFlag className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => { setSelectedReview(row); setShowDetailModal(true); }}
            className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors"
            title="View Details"
          >
            <HiEye className="w-4 h-4" />
          </button>
        </div>
      ),
      width: '140px',
    },
  ];

  return (
    <>
      <SEOHead title="Manage Reviews" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Reviews</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Moderate and manage reviews ({totalItems} total)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchReviews(currentPage, filterStatus)}
              className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors"
              title="Refresh"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="input-field w-auto py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={reviews}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          emptyMessage="No reviews found"
        />
      </div>

      {/* Review Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Review Details"
        size="lg"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <HiStar key={i} className={`w-5 h-5 ${i < selectedReview.rating ? 'text-[var(--color-primary)]' : 'text-white/20'}`} />
                  ))}
                </div>
                <span className="text-white font-bold">{selectedReview.rating}/5</span>
              </div>
              <StatusBadge status={selectedReview.status} />
            </div>

            <div>
              <h4 className="text-white font-bold text-lg">{selectedReview.title}</h4>
              <p className="text-[var(--color-text-secondary)] mt-2 whitespace-pre-wrap">{selectedReview.content}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--color-text-muted)]">Guest</p>
                <p className="text-white">{selectedReview.user?.firstName} {selectedReview.user?.lastName}</p>
                {selectedReview.user?.email && (
                  <p className="text-xs text-[var(--color-text-muted)]">{selectedReview.user.email}</p>
                )}
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">Property</p>
                <p className="text-white">{selectedReview.property?.name}</p>
                <p className="text-xs text-[var(--color-text-muted)] capitalize">{selectedReview.property?.type}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">Date</p>
                <p className="text-white">{formatDate(selectedReview.createdAt)}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">Helpful Votes</p>
                <p className="text-white">
                  👍 {selectedReview.helpful?.yes || 0} | 👎 {selectedReview.helpful?.no || 0}
                </p>
              </div>
            </div>

            {/* Sub-ratings */}
            {selectedReview.ratings && Object.keys(selectedReview.ratings).length > 0 && (
              <div>
                <p className="text-sm text-[var(--color-text-muted)] mb-2">Detailed Ratings</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(selectedReview.ratings).map(([key, value]) => (
                    <div key={key} className="text-center p-3 rounded-lg glass-light">
                      <p className="text-xs text-[var(--color-text-muted)] capitalize">{key}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <HiStar className="w-3 h-3 text-[var(--color-primary)]" />
                        <p className="text-white font-medium text-sm">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Response if exists */}
            {selectedReview.response?.text && (
              <div className="p-4 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Your Response</p>
                <p className="text-sm text-white">{selectedReview.response.text}</p>
                {selectedReview.response.respondedAt && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">
                    Responded {formatDate(selectedReview.response.respondedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Quick actions in detail modal */}
            {selectedReview.status === 'pending' && (
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openModerateModal(selectedReview, 'approved');
                  }}
                  className="flex-1 py-2 rounded-lg bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-all"
                >
                  <HiCheck className="w-4 h-4 inline mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openModerateModal(selectedReview, 'rejected');
                  }}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-all"
                >
                  <HiX className="w-4 h-4 inline mr-1" />
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Moderate Confirmation Modal */}
      <Modal
        isOpen={showModerateModal}
        onClose={closeModerateModal}
        title={moderateAction?.status === 'approved' ? 'Approve Review' : 'Reject Review'}
        size="md"
      >
        {selectedReview && (
          <div className="space-y-4">
            {/* Review summary */}
            <div className="p-4 rounded-lg glass-light">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <HiStar key={i} className={`w-4 h-4 ${i < selectedReview.rating ? 'text-[var(--color-primary)]' : 'text-white/20'}`} />
                  ))}
                </div>
                <span className="text-white text-sm font-medium">{selectedReview.rating}/5</span>
              </div>
              <p className="text-white text-sm font-medium">{selectedReview.title}</p>
              <p className="text-[var(--color-text-secondary)] text-xs mt-1">{truncateText(selectedReview.content, 150)}</p>
              <p className="text-[var(--color-text-muted)] text-xs mt-2">
                By {selectedReview.user?.firstName} {selectedReview.user?.lastName} • {formatDate(selectedReview.createdAt)}
              </p>
            </div>

            {/* Confirmation message */}
            <div className={`p-3 rounded-lg text-sm ${
              moderateAction?.status === 'approved' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {moderateAction?.status === 'approved' 
                ? 'This review will be publicly visible on the property page.' 
                : 'This review will be hidden from the property page.'}
            </div>

            {/* Response textarea */}
            <div>
              <label className="input-label">
                Response Message (Optional)
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="input-field resize-none"
                rows={4}
                placeholder={moderateAction?.status === 'approved' 
                  ? 'Write a public response to this review...' 
                  : 'Explain why this review is being rejected...'}
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {moderateAction?.status === 'approved' 
                  ? 'This response will be shown publicly with the review.' 
                  : 'This is for internal notes only.'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={closeModerateModal}
                className="flex-1 btn-outline text-sm"
                disabled={moderating}
              >
                Cancel
              </button>
              <button
                onClick={handleModerate}
                disabled={moderating}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 ${
                  moderateAction?.status === 'approved'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                } transition-all`}
              >
                {moderating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {moderateAction?.status === 'approved' ? (
                      <HiCheck className="w-4 h-4" />
                    ) : (
                      <HiX className="w-4 h-4" />
                    )}
                    {moderateAction?.status === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminReviews;
