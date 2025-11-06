import React from 'react';

export interface TouchTargetProps {
  children: React.ReactNode;
  onClick?: () => void;
  minSize?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * TouchTarget ensures interactive elements meet minimum touch target size (44x44px)
 * for better mobile accessibility and usability.
 */
const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  onClick,
  minSize = 44,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`touch-target ${className}`}
      style={{
        minWidth: `${minSize}px`,
        minHeight: `${minSize}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.2s ease',
      }}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

export default TouchTarget;
