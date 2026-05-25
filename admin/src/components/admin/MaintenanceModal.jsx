// components/admin/MaintenanceModal.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiCalendar, HiPlus, HiTrash, HiInformationCircle } from 'react-icons/hi';
import { FaWrench } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import adminApi from '../../config/api';
import toast from 'react-hot-toast';

const MAINTENANCE_REASONS = [
  { value: 'maintenance', label: '🔧 Maintenance', color: 'yellow' },
  { value: 'renovation', label: '🏗️ Renovation', color: 'orange' },
  { value: 'owner_use', label: '👤 Owner Use', color: 'blue' },
  { value: 'seasonal_closing', label: '🌴 Seasonal Closing', color: 'green' },
  { value: 'other', label: '📝 Other', color: 'gray' }
];

const MaintenanceModal = ({ isOpen, onClose, property, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [maintenanceDates, setMaintenanceDates] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState('maintenance');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (property && isOpen) {
      fetchMaintenanceDates();
    }
  }, [property, isOpen]);

  const fetchMaintenanceDates = async () => {
    try {
      const response = await adminApi.get(`/properties/${property._id}/maintenance-dates`);
      setMaintenanceDates(response.data.maintenanceDates || []);
    } catch (error) {
      console.error('Failed to fetch maintenance dates:', error);
      // Don't show error toast for 404, just set empty array
      setMaintenanceDates([]);
    }
  };

  const handleAddMaintenanceDate = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (startDate > endDate) {
      toast.error('Start date must be before end date');
      return;
    }

    setLoading(true);
    try {
      const response = await adminApi.post(`/properties/${property._id}/maintenance-dates`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason,
        description
      });

      if (response.data.success) {
        toast.success('Maintenance period added successfully');
        setStartDate(null);
        setEndDate(null);
        setReason('maintenance');
        setDescription('');
        fetchMaintenanceDates();
        onSuccess?.();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add maintenance period');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMaintenanceDate = async (dateId) => {
    try {
      const response = await adminApi.delete(`/properties/${property._id}/maintenance-dates/${dateId}`);
      if (response.data.success) {
        toast.success('Maintenance period removed');
        fetchMaintenanceDates();
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Failed to remove maintenance period');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReasonColor = (reasonValue) => {
    const reasonObj = MAINTENANCE_REASONS.find(r => r.value === reasonValue);
    return reasonObj?.color || 'gray';
  };

  const getReasonLabel = (reasonValue) => {
    const reasonObj = MAINTENANCE_REASONS.find(r => r.value === reasonValue);
    return reasonObj?.label || reasonValue;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/80" onClick={onClose} />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative glass-strong rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <FaWrench className="w-5 h-5 text-yellow-500" />
                Manage Maintenance - {property.name}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Mark dates when the property is unavailable for booking
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Info Box */}
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <HiInformationCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-400 font-medium">How Maintenance Mode Works</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    When you mark dates as maintenance, those dates will appear in red on the booking calendar.
                    Customers will see that the property is unavailable on those specific dates but can still book other available dates.
                  </p>
                </div>
              </div>
            </div>

            {/* Add New Maintenance Period */}
            <div className="glass rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <HiPlus className="w-4 h-4 text-[var(--color-primary)]" />
                Add Maintenance Period
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label text-sm">Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    className="input-field w-full"
                    placeholderText="Select start date"
                    dateFormat="MM/dd/yyyy"
                  />
                </div>
                <div>
                  <label className="input-label text-sm">End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || new Date()}
                    className="input-field w-full"
                    placeholderText="Select end date"
                    dateFormat="MM/dd/yyyy"
                  />
                </div>
                <div>
                  <label className="input-label text-sm">Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input-field"
                  >
                    {MAINTENANCE_REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label text-sm">Description (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Deep cleaning and maintenance"
                  />
                </div>
              </div>
              <button
                onClick={handleAddMaintenanceDate}
                disabled={loading}
                className="mt-4 btn-primary text-sm flex items-center gap-2 justify-center w-full md:w-auto"
              >
                <HiPlus className="w-4 h-4" />
                {loading ? 'Adding...' : 'Add Maintenance Period'}
              </button>
            </div>

            {/* Existing Maintenance Periods */}
            {maintenanceDates.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <HiCalendar className="w-4 h-4 text-yellow-500" />
                  Existing Maintenance Periods ({maintenanceDates.length})
                </h3>
                <div className="space-y-2">
                  {maintenanceDates.map((date) => (
                    <div
                      key={date._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm text-white">
                            {formatDate(date.startDate)} - {formatDate(date.endDate)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-${getReasonColor(date.reason)}-500/20 text-${getReasonColor(date.reason)}-400`}>
                            {getReasonLabel(date.reason)}
                          </span>
                        </div>
                        {date.description && (
                          <p className="text-xs text-[var(--color-text-muted)] mt-1">
                            {date.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveMaintenanceDate(date._id)}
                        className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Maintenance Dates */}
            {maintenanceDates.length === 0 && (
              <div className="text-center py-8">
                <HiCalendar className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3" />
                <p className="text-[var(--color-text-secondary)]">No maintenance periods scheduled</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Add maintenance dates to block booking on specific days</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex justify-end">
            <button onClick={onClose} className="btn-outline text-sm">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MaintenanceModal;