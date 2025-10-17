'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  priority?: NotificationPriority;
  persistent?: boolean;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  onClose?: () => void;
}

interface NotificationQueueProps {
  maxNotifications?: number;
}

// Global notification manager
let notificationManager: {
  add: (notification: Omit<Notification, 'id'>) => string;
  remove: (id: string) => void;
  clear: () => void;
} | null = null;

export const useNotifications = () => {
  return {
    addNotification: (notification: Omit<Notification, 'id'>) => {
      if (notificationManager) {
        return notificationManager.add(notification);
      }
      return '';
    },
    removeNotification: (id: string) => {
      if (notificationManager) {
        notificationManager.remove(id);
      }
    },
    clearNotifications: () => {
      if (notificationManager) {
        notificationManager.clear();
      }
    },
  };
};

const NotificationQueue: React.FC<NotificationQueueProps> = ({ maxNotifications = 5 }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: Notification = {
        id,
        priority: 'normal',
        duration: notification.persistent ? undefined : 5000,
        ...notification,
      };

      setNotifications(prev => {
        // Sort by priority (high first)
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        const updated = [...prev, newNotification].sort(
          (a, b) => priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal']
        );

        // Limit number of notifications
        return updated.slice(0, maxNotifications);
      });

      // Auto-dismiss if not persistent
      if (!notification.persistent && newNotification.duration) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }

      return id;
    },
    [maxNotifications]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification?.onClose) {
        notification.onClose();
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Register global manager
  useEffect(() => {
    notificationManager = {
      add: addNotification,
      remove: removeNotification,
      clear: clearNotifications,
    };

    return () => {
      notificationManager = null;
    };
  }, [addNotification, removeNotification, clearNotifications]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-green-500';
      case 'error':
        return 'border-l-4 border-l-red-500';
      case 'warning':
        return 'border-l-4 border-l-yellow-500';
      case 'info':
        return 'border-l-4 border-l-blue-500';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification ${getNotificationStyle(notification.type)}`}
          role="alert"
          aria-live={notification.priority === 'high' ? 'assertive' : 'polite'}
        >
          <div className="notification-icon">{getIcon(notification.type)}</div>

          <div className="notification-content">
            {notification.title && <div className="notification-title">{notification.title}</div>}
            <div className="notification-message">{notification.message}</div>

            {notification.actions && notification.actions.length > 0 && (
              <div className="notification-actions">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      if (!notification.persistent) {
                        removeNotification(notification.id);
                      }
                    }}
                    className={`notification-action-btn ${
                      action.variant === 'primary' ? 'bg-blue-600 text-white border-blue-600' : ''
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => removeNotification(notification.id)}
            className="notification-close"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationQueue;
