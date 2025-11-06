/**
 * Input Component - Design System
 * Unified text input with consistent styling
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'error';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  inputSize?: InputSize;
  variant?: InputVariant;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  error?: string;
  helperText?: string;
  label?: string;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = 'md',
      variant = 'default',
      icon: Icon,
      iconPosition = 'left',
      error,
      helperText,
      label,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = variant === 'error' || !!error;

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    // Icon padding adjustments
    const iconPaddingStyles = Icon
      ? {
          left: inputSize === 'sm' ? 'pl-9' : inputSize === 'md' ? 'pl-10' : 'pl-12',
          right: inputSize === 'sm' ? 'pr-9' : inputSize === 'md' ? 'pr-10' : 'pr-12',
        }
      : { left: '', right: '' };

    const baseStyles =
      'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';

    const variantStyles = hasError
      ? 'border-[var(--color-error)] focus:ring-[var(--color-error)] bg-[var(--color-error-light)]'
      : 'border-[var(--border-secondary)] focus:ring-[var(--accent-primary)] bg-[var(--bg-secondary)]';

    const textColor = 'text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]';

    const widthStyle = fullWidth ? 'w-full' : '';

    const iconSize = inputSize === 'sm' ? 'w-4 h-4' : inputSize === 'md' ? 'w-5 h-5' : 'w-6 h-6';
    const iconPositionStyle =
      iconPosition === 'left'
        ? inputSize === 'sm'
          ? 'left-3'
          : inputSize === 'md'
            ? 'left-3'
            : 'left-4'
        : inputSize === 'sm'
          ? 'right-3'
          : inputSize === 'md'
            ? 'right-3'
            : 'right-4';

    return (
      <div className={`${widthStyle} ${className}`}>
        {label && (
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div
              className={`absolute ${iconPositionStyle} top-1/2 -translate-y-1/2 pointer-events-none`}
              style={{ color: hasError ? 'var(--color-error)' : 'var(--text-secondary)' }}
            >
              <Icon className={iconSize} />
            </div>
          )}
          <input
            ref={ref}
            className={`${baseStyles} ${sizeStyles[inputSize]} ${variantStyles} ${textColor} ${Icon ? iconPaddingStyles[iconPosition] : ''}`}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <p
            className="mt-1.5 text-sm"
            style={{ color: error ? 'var(--color-error)' : 'var(--text-secondary)' }}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
