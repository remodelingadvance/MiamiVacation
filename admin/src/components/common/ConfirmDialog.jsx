import Modal from './Modal';
import { HiExclamation } from 'react-icons/hi';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-outline text-sm" disabled={loading}>
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`text-sm px-6 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'btn-primary'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </>
      }
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <HiExclamation className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;