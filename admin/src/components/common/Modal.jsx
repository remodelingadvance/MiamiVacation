import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw] max-h-[90vh]',
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full ${sizeClasses[size]} glass-strong rounded-2xl shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-display font-bold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;