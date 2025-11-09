'use client';

import { useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CollapsibleSidebarProps {
  children: ReactNode;
  side: 'left' | 'right';
  defaultOpen?: boolean;
  storageKey?: string;
}

export default function CollapsibleSidebar({
  children,
  side,
  defaultOpen = false,
  storageKey,
}: CollapsibleSidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Load saved state from localStorage
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setIsOpen(saved === 'true');
      }
    }
  }, [storageKey]);

  // Save state to localStorage
  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, String(newState));
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-1/2 -translate-y-1/2 z-30 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hover:shadow-xl transition-all ${
          side === 'left'
            ? isOpen
              ? 'left-80 lg:left-96'
              : 'left-2'
            : isOpen
              ? 'right-80 lg:right-96'
              : 'right-2'
        }`}
        title={isOpen ? `Collapse ${side} sidebar` : `Expand ${side} sidebar`}
      >
        {side === 'left' ? (
          isOpen ? (
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          )
        ) : isOpen ? (
          <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        )}
      </button>

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full bg-white dark:bg-slate-900 border-${side === 'left' ? 'r' : 'l'} border-slate-200 dark:border-slate-700 z-20 overflow-y-auto transition-transform duration-300 ease-in-out w-80 lg:w-96 ${
          isOpen ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full'
        }`}
      >
        <div className="p-4">{children}</div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-10 lg:hidden" onClick={toggleSidebar} />
      )}
    </>
  );
}
