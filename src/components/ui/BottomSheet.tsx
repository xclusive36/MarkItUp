'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'auto' | 'half' | 'full';
  showHandle?: boolean;
  dismissible?: boolean;
  className?: string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  height = 'auto',
  showHandle = true,
  dismissible = true,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const heightClasses = {
    auto: 'max-h-[85vh]',
    half: 'h-[50vh]',
    full: 'h-[90vh]',
  };

  // Handle drag start
  const handleDragStart = (clientY: number) => {
    if (!dismissible) return;
    setIsDragging(true);
    setDragStart(clientY);
    setDragOffset(0);
  };

  // Handle drag move
  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    const offset = Math.max(0, clientY - dragStart); // Only allow dragging down
    setDragOffset(offset);
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Close if dragged down more than 100px
    if (dragOffset > 100) {
      onClose();
    }

    setDragOffset(0);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleDragStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleDragMove(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse events (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Add/remove mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    return undefined;
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
    return undefined;
  }, [isOpen, onClose, dismissible]);

  if (!isOpen) return null;

  return (
    <div className="bottom-sheet-overlay" style={{ zIndex: 'var(--z-modal)' }}>
      {/* Backdrop */}
      <div
        className="bottom-sheet-backdrop"
        onClick={dismissible ? onClose : undefined}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`bottom-sheet ${heightClasses[height]} ${className}`}
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-primary)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
      >
        {/* Drag Handle */}
        {showHandle && (
          <div
            className="bottom-sheet-handle-area"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            <div
              className="bottom-sheet-handle"
              style={{ backgroundColor: 'var(--border-secondary)' }}
            />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="bottom-sheet-header" style={{ borderColor: 'var(--border-primary)' }}>
            <h2
              id="bottom-sheet-title"
              className="bottom-sheet-title"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h2>
            {dismissible && (
              <button
                onClick={onClose}
                className="bottom-sheet-close"
                aria-label="Close"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="bottom-sheet-content">{children}</div>
      </div>
    </div>
  );
};

export default BottomSheet;
