/**
 * Button Component - Design System
 * Unified button component with consistent styling and variants
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      isLoading = false,
      fullWidth = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    };

    // Variant styles
    const variantStyles = {
      primary:
        'bg-[var(--accent-primary)] text-white border-transparent hover:bg-[var(--accent-primary-hover)] active:bg-[var(--accent-primary-active)] shadow-sm hover:shadow-md',
      secondary:
        'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[var(--border-secondary)] hover:bg-[var(--bg-secondary)] hover:shadow-sm',
      ghost:
        'bg-transparent text-[var(--text-primary)] border-transparent hover:bg-[var(--bg-tertiary)]',
      danger:
        'bg-[var(--color-error)] text-white border-transparent hover:bg-[var(--color-error-hover)] shadow-sm hover:shadow-md',
      success:
        'bg-[var(--color-success)] text-white border-transparent hover:bg-[var(--color-success-hover)] shadow-sm hover:shadow-md',
    };

    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent-primary)]';

    const widthStyle = fullWidth ? 'w-full' : '';
    const hoverEffect = !disabled && !isLoading ? 'hover:scale-[1.02] active:scale-[0.98]' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${hoverEffect} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
        <span>{children}</span>
        {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
