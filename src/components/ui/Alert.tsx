/**
 * Alert Component - Design System
 * Inline notifications and messages
 */

import React from 'react';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { variant = 'info', title, dismissible = false, onDismiss, children, className = '', ...props },
    ref
  ) => {
    const icons = {
      info: Info,
      success: CheckCircle,
      warning: AlertCircle,
      error: XCircle,
    };

    const variantStyles = {
      info: {
        bg: 'var(--color-info-light)',
        border: 'var(--color-info-border)',
        text: 'var(--color-info)',
      },
      success: {
        bg: 'var(--color-success-light)',
        border: 'var(--color-success-border)',
        text: 'var(--color-success)',
      },
      warning: {
        bg: 'var(--color-warning-light)',
        border: 'var(--color-warning-border)',
        text: 'var(--color-warning)',
      },
      error: {
        bg: 'var(--color-error-light)',
        border: 'var(--color-error-border)',
        text: 'var(--color-error)',
      },
    };

    const Icon = icons[variant];
    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={`rounded-lg border p-4 flex gap-3 ${className}`}
        style={{
          backgroundColor: styles.bg,
          borderColor: styles.border,
          color: styles.text,
        }}
        role="alert"
        {...props}
      >
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-semibold mb-1" style={{ color: styles.text }}>
              {title}
            </h3>
          )}
          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {children}
          </div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors"
            aria-label="Dismiss"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
