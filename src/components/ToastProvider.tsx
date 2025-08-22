'use client';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Toast {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: Toast['type'],
    actionLabel?: string,
    onAction?: () => void
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback(
    (message: string, type?: Toast['type'], actionLabel?: string, onAction?: () => void) => {
      const id = Date.now() + Math.random();
      setToasts(ts => [...ts, { id, message, type, actionLabel, onAction }]);
      setTimeout(() => {
        setToasts(ts => ts.filter(t => t.id !== id));
      }, 4000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={`px-4 py-2 rounded shadow-lg text-white text-sm font-medium flex items-center gap-3
                ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-gray-800'}`}
            >
              <span>{toast.message}</span>
              {toast.actionLabel && toast.onAction && (
                <button
                  className="ml-2 px-2 py-1 rounded text-xs font-semibold border border-white border-opacity-30 transition-colors"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    color: '#222',
                  }}
                  onClick={() => {
                    toast.onAction?.();
                    setToasts(ts => ts.filter(t => t.id !== toast.id));
                  }}
                >
                  {toast.actionLabel}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
