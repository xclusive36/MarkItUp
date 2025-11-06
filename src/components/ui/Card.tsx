/**
 * Card Component - Design System
 * Unified card component with consistent elevation and styling
 */

import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'bordered' | 'interactive';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', children, className = '', ...props }, ref) => {
    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    // Variant styles
    const variantStyles = {
      default:
        'bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-[var(--shadow-sm)]',
      elevated:
        'bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-[var(--shadow-md)]',
      bordered: 'bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg',
      interactive:
        'bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
    };

    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
