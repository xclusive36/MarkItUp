import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  actionLabel,
  onAction,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded shadow-lg flex items-center gap-3"
      >
        <span>{message}</span>
        {actionLabel && onAction && (
          <button
            className="ml-2 px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            onClick={() => {
              onAction();
              onClose();
            }}
          >
            {actionLabel}
          </button>
        )}
        <button
          className="ml-2 text-gray-300 hover:text-white text-lg font-bold"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
