/**
 * Tooltip Component - Design System
 * Contextual information on hover
 *
 * Simple CSS-based tooltip using title attribute and pseudo-elements
 * More performant and accessible than JS-based positioning
 */

import React from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string;
  position?: TooltipPosition;
  children: React.ReactElement;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  className = '',
}) => {
  const positionClasses = {
    top: 'tooltip-top',
    bottom: 'tooltip-bottom',
    left: 'tooltip-left',
    right: 'tooltip-right',
  };

  return (
    <span
      className={`tooltip-wrapper ${positionClasses[position]} ${className}`}
      data-tooltip={content}
    >
      {children}
    </span>
  );
};

export default Tooltip;
