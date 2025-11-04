import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id?: string;
  message: string;
  type?: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
  duration?: number;
}

const toastStyles: Record<
  ToastType,
  { bg: string; border: string; textColor: string; icon: React.ReactNode }
> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-700',
    textColor: 'text-green-900 dark:text-green-100',
    icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-700',
    textColor: 'text-red-900 dark:text-red-100',
    icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-700',
    textColor: 'text-blue-900 dark:text-blue-100',
    icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    border: 'border-yellow-200 dark:border-yellow-700',
    textColor: 'text-yellow-900 dark:text-yellow-100',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
  },
};

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  actionLabel,
  onAction,
  onClose,
  duration = 5000,
}) => {
  const style = toastStyles[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [onClose, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.2 }}
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${style.bg} ${style.border}
        min-w-[320px] max-w-md
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className={`flex-1 text-sm font-medium ${style.textColor}`}>{message}</div>
      {actionLabel && onAction && (
        <button
          className="flex-shrink-0 px-3 py-1 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          onClick={() => {
            onAction();
            onClose();
          }}
        >
          {actionLabel}
        </button>
      )}
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;
