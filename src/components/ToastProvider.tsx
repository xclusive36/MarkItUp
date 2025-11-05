'use client';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast, { ToastType } from '@/components/Toast';

interface ToastItem {
  id: number;
  message: string;
  type?: ToastType;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    actionLabel?: string,
    onAction?: () => void
  ) => void;
  success: (message: string, actionLabel?: string, onAction?: () => void) => void;
  error: (message: string, actionLabel?: string, onAction?: () => void) => void;
  info: (message: string, actionLabel?: string, onAction?: () => void) => void;
  warning: (message: string, actionLabel?: string, onAction?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type?: ToastType, actionLabel?: string, onAction?: () => void) => {
      const id = Date.now() + Math.random();
      setToasts(ts => [...ts, { id, message, type: type || 'info', actionLabel, onAction }]);
    },
    []
  );

  const success = useCallback(
    (message: string, actionLabel?: string, onAction?: () => void) =>
      showToast(message, 'success', actionLabel, onAction),
    [showToast]
  );

  const error = useCallback(
    (message: string, actionLabel?: string, onAction?: () => void) =>
      showToast(message, 'error', actionLabel, onAction),
    [showToast]
  );

  const info = useCallback(
    (message: string, actionLabel?: string, onAction?: () => void) =>
      showToast(message, 'info', actionLabel, onAction),
    [showToast]
  );

  const warning = useCallback(
    (message: string, actionLabel?: string, onAction?: () => void) =>
      showToast(message, 'warning', actionLabel, onAction),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {toasts.map(toast => (
              <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                actionLabel={toast.actionLabel}
                onAction={toast.onAction}
                onClose={() => removeToast(toast.id)}
                duration={5000}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
};
