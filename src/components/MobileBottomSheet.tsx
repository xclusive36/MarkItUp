'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

export default function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  theme = 'light',
}: MobileBottomSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll when sheet is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    // Only allow dragging down
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;

    // Close if dragged down more than 100px
    if (diff > 100) {
      onClose();
    }

    // Reset position
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }

    startY.current = 0;
    currentY.current = 0;
  };

  if (!isOpen && !isAnimating) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
        onTransitionEnd={() => {
          if (!isOpen) setIsAnimating(false);
        }}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          maxHeight: '85vh',
          touchAction: 'pan-y',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-3">
          <div
            className="w-12 h-1.5 rounded-full"
            style={{
              backgroundColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
            }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 pb-3 border-b"
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          }}
        >
          <h3
            className="text-lg font-semibold"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
              color: theme === 'dark' ? '#f9fafb' : '#111827',
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
          {children}
        </div>
      </div>
    </>
  );
}
