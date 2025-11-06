/**
 * Badge Component - Design System
 * Small status indicators, tags, and labels
 */

import React from 'react';
import { X } from 'lucide-react';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  removable?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      removable = false,
      onRemove,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    // Size styles
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-sm gap-1.5',
      lg: 'px-3 py-1.5 text-base gap-2',
    };

    // Variant styles
    const variantStyles = {
      default:
        'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-secondary)]',
      primary:
        'bg-[var(--accent-primary-light)] text-[var(--accent-primary)] border-[var(--accent-primary)] border-opacity-20',
      success:
        'bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success-border)]',
      warning:
        'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning-border)]',
      error:
        'bg-[var(--color-error-light)] text-[var(--color-error)] border-[var(--color-error-border)]',
      info: 'bg-[var(--color-info-light)] text-[var(--color-info)] border-[var(--color-info-border)]',
    };

    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-full border whitespace-nowrap transition-all duration-200';

    const hoverStyle = removable || props.onClick ? 'cursor-pointer hover:opacity-80' : '';

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${hoverStyle} ${className}`}
        {...props}
      >
        <span>{children}</span>
        {removable && (
          <button
            onClick={e => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
            aria-label="Remove"
            type="button"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
