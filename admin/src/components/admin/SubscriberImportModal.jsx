// components/admin/SubscriberImportModal.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiX, 
  HiUpload, 
  HiPencil, 
  HiTable, 
  HiDownload,
  HiCheck,
  HiExclamationCircle 
} from 'react-icons/hi';
import adminApi from '../../config/api';
import toast from 'react-hot-toast';

const SubscriberImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [activeMethod, setActiveMethod] = useState('single');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  // Single subscriber form
  const [singleForm, setSingleForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  
  // Bulk text form
  const [bulkText, setBulkText] = useState('');
  const [bulkFormat, setBulkFormat] = useState('simple');
  
  // File import
  const [selectedFile, setSelectedFile] = useState(null);
  
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!singleForm.email) {
      toast.error('Email is required');
      return;
    }
    
    setLoading(true);
    try {
      const response = await adminApi.post('/newsletter/admin/add-single', singleForm);
      if (response.data.success) {
        toast.success('Subscriber added successfully');
        setSingleForm({ email: '', firstName: '', lastName: '', phone: '' });
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to add subscriber');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBulkTextSubmit = async () => {
    if (!bulkText.trim()) {
      toast.error('Please enter subscriber data');
      return;
    }
    
    setLoading(true);
    try {
      const response = await adminApi.post('/newsletter/admin/bulk-text', {
        subscribers: bulkText,
        format: bulkFormat,
      });
      
      if (response.data.success) {
        setResults(response.data.results);
        toast.success(response.data.message);
        
        // Refresh after 3 seconds
        setTimeout(() => {
          setResults(null);
          setBulkText('');
          onSuccess?.();
          onClose();
        }, 3000);
      }
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Bulk import failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    setLoading(true);
    try {
      const response = await adminApi.post('/newsletter/admin/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (response.data.success) {
        setResults(response.data.results);
        toast.success(response.data.message);
        
        setTimeout(() => {
          setResults(null);
          setSelectedFile(null);
          onSuccess?.();
          onClose();
        }, 3000);
      }
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'File import failed');
    } finally {
      setLoading(false);
    }
  };
  
  const downloadTemplate = async (format) => {
    try {
      const response = await adminApi.get(`/newsletter/admin/template?format=${format}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `subscriber-template.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded');
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to download template');
    }
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
          className="relative glass-strong rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Add Subscribers</h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Choose your preferred method to add subscribers
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
          
          {/* Method Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => { setActiveMethod('single'); setResults(null); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                activeMethod === 'single'
                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`}
            >
              <HiPencil className="w-4 h-4" />
              Single Entry
            </button>
            <button
              onClick={() => { setActiveMethod('bulk'); setResults(null); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                activeMethod === 'bulk'
                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`}
            >
              <HiTable className="w-4 h-4" />
              Bulk Text
            </button>
            <button
              onClick={() => { setActiveMethod('file'); setResults(null); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                activeMethod === 'file'
                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`}
            >
              <HiUpload className="w-4 h-4" />
              File Import
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Single Entry Method */}
            {activeMethod === 'single' && (
              <form onSubmit={handleSingleSubmit} className="space-y-4">
                <div>
                  <label className="input-label text-white">Email Address *</label>
                  <input
                    type="email"
                    value={singleForm.email}
                    onChange={(e) => setSingleForm({ ...singleForm, email: e.target.value })}
                    className="input-field"
                    placeholder="subscriber@example.com"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label text-white">First Name</label>
                    <input
                      type="text"
                      value={singleForm.firstName}
                      onChange={(e) => setSingleForm({ ...singleForm, firstName: e.target.value })}
                      className="input-field"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="input-label text-white">Last Name</label>
                    <input
                      type="text"
                      value={singleForm.lastName}
                      onChange={(e) => setSingleForm({ ...singleForm, lastName: e.target.value })}
                      className="input-field"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="input-label text-white">Phone Number</label>
                  <input
                    type="tel"
                    value={singleForm.phone}
                    onChange={(e) => setSingleForm({ ...singleForm, phone: e.target.value })}
                    className="input-field"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={onClose} className="flex-1 btn-outline">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 btn-primary">
                    {loading ? 'Adding...' : 'Add Subscriber'}
                  </button>
                </div>
              </form>
            )}
            
            {/* Bulk Text Method */}
            {activeMethod === 'bulk' && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setBulkFormat('simple')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      bulkFormat === 'simple'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'glass-light text-[var(--color-text-secondary)] hover:text-white'
                    }`}
                  >
                    One per line
                  </button>
                  <button
                    onClick={() => setBulkFormat('csv')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      bulkFormat === 'csv'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'glass-light text-[var(--color-text-secondary)] hover:text-white'
                    }`}
                  >
                    CSV Format
                  </button>
                  <button
                    onClick={() => setBulkFormat('json')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      bulkFormat === 'json'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'glass-light text-[var(--color-text-secondary)] hover:text-white'
                    }`}
                  >
                    JSON Format
                  </button>
                </div>
                
                <div>
                  <label className="input-label text-white">Enter Subscribers</label>
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="input-field resize-none font-mono text-sm"
                    rows={10}
                    placeholder={
                      bulkFormat === 'simple'
                        ? 'john@example.com\njane@example.com\nbob@example.com'
                        : bulkFormat === 'csv'
                        ? 'email,firstName,lastName\njohn@example.com,John,Doe\njane@example.com,Jane,Smith'
                        : '[{"email":"john@example.com","firstName":"John"},{"email":"jane@example.com","firstName":"Jane"}]'
                    }
                  />
                </div>
                
                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="flex-1 btn-outline">
                    Cancel
                  </button>
                  <button onClick={handleBulkTextSubmit} disabled={loading} className="flex-1 btn-primary">
                    {loading ? 'Importing...' : 'Import Subscribers'}
                  </button>
                </div>
              </div>
            )}
            
            {/* File Import Method */}
            {activeMethod === 'file' && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => downloadTemplate('csv')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg glass-light text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors"
                  >
                    <HiDownload className="w-4 h-4" />
                    Download CSV Template
                  </button>
                  <button
                    onClick={() => downloadTemplate('excel')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg glass-light text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors"
                  >
                    <HiDownload className="w-4 h-4" />
                    Download Excel Template
                  </button>
                </div>
                
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                  <input
                    type="file"
                    id="fileInput"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="fileInput" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <HiCheck className="w-12 h-12 text-green-500 mx-auto" />
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-sm text-red-400 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <HiUpload className="w-12 h-12 text-[var(--color-primary)] mx-auto" />
                        <p className="text-white font-medium">Click to upload</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          CSV or Excel files (max 10MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                
                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="flex-1 btn-outline">
                    Cancel
                  </button>
                  <button onClick={handleFileImport} disabled={!selectedFile || loading} className="flex-1 btn-primary">
                    {loading ? 'Importing...' : 'Import File'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Results Display */}
            {results && (
              <div className="mt-4 p-4 rounded-xl glass-light">
                <h4 className="text-white font-medium mb-2">Import Results</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-green-500 flex items-center gap-2">
                    <HiCheck className="w-4 h-4" />
                    Success: {results.success}
                  </p>
                  <p className="text-yellow-500 flex items-center gap-2">
                    <HiExclamationCircle className="w-4 h-4" />
                    Skipped: {results.skipped}
                  </p>
                  <p className="text-red-500 flex items-center gap-2">
                    <HiX className="w-4 h-4" />
                    Failed: {results.failed}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriberImportModal;
