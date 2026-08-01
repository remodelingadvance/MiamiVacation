// components/common/StatusBadge.jsx
const statusConfig = {
  // Booking statuses
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Pending' },
  confirmed: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Confirmed' },
  active: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Active' },
  completed: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Completed' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Cancelled' },
  'no-show': { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'No Show' },

  // Payment statuses
  paid: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Paid' },
  failed: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Failed' },
  refunded: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Refunded' },
  processing: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Processing' },
  partially_refunded: { bg: 'bg-orange-500/10', text: 'text-orange-500', label: 'Partial Refund' },

  // Contact statuses
  unread: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Unread' },
  read: { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Read' },
  replied: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Replied' },
  resolved: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Resolved' },
  spam: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Spam' },

  // Review statuses
  approved: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Approved' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Rejected' },
  flagged: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Flagged' },

  // Property statuses
  inactive: { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Inactive' },
  maintenance: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Under Maintenance' },
  'under-maintenance': { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Under Maintenance' },
  draft: { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Draft' },

  // Coupon statuses
  expired: { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Expired' },

  // User statuses
  user: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'User' },
  admin: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Admin' },
  'super-admin': { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Super Admin' },
};

const StatusBadge = ({ status, customLabel }) => {
  // Handle custom label override
  if (customLabel) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500`}>
        {customLabel}
      </span>
    );
  }
  
  const config = statusConfig[status] || { bg: 'bg-gray-500/10', text: 'text-gray-500', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;