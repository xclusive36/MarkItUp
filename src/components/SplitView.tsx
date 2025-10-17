'use client';

import React, { useRef, useEffect, useState } from 'react';
import { GripVertical, Link as LinkIcon, Unlink } from 'lucide-react';
import { useResizableSplitPanel } from '@/hooks/useResizableSplitPanel';

interface SplitViewProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftPanelRef?: React.RefObject<HTMLDivElement>;
  rightPanelRef?: React.RefObject<HTMLDivElement>;
  enableSyncScroll?: boolean;
  theme?: 'light' | 'dark';
  storageKey?: string;
}

export default function SplitView({
  leftPanel,
  rightPanel,
  leftPanelRef,
  rightPanelRef,
  enableSyncScroll: enableSyncScrollProp = false,
  theme = 'light',
  storageKey = 'split-view-size',
}: SplitViewProps) {
  const [syncScroll, setSyncScroll] = useState(enableSyncScrollProp);
  const { leftSize, rightSize, isResizing, handleMouseDown, containerRef } = useResizableSplitPanel(
    {
      minSize: 30,
      maxSize: 70,
      defaultSize: 50,
      storageKey,
    }
  );

  const internalLeftRef = useRef<HTMLDivElement>(null);
  const internalRightRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const leftRef = leftPanelRef || internalLeftRef;
  const rightRef = rightPanelRef || internalRightRef;

  // Sync scroll handler
  useEffect(() => {
    if (!syncScroll || !leftRef.current || !rightRef.current) return;

    const handleLeftScroll = () => {
      if (isScrolling.current || !leftRef.current || !rightRef.current) return;
      isScrolling.current = true;

      const leftEl = leftRef.current;
      const rightEl = rightRef.current;
      const scrollPercentage = leftEl.scrollTop / (leftEl.scrollHeight - leftEl.clientHeight);
      rightEl.scrollTop = scrollPercentage * (rightEl.scrollHeight - rightEl.clientHeight);

      setTimeout(() => {
        isScrolling.current = false;
      }, 50);
    };

    const handleRightScroll = () => {
      if (isScrolling.current || !leftRef.current || !rightRef.current) return;
      isScrolling.current = true;

      const leftEl = leftRef.current;
      const rightEl = rightRef.current;
      const scrollPercentage = rightEl.scrollTop / (rightEl.scrollHeight - rightEl.clientHeight);
      leftEl.scrollTop = scrollPercentage * (leftEl.scrollHeight - leftEl.clientHeight);

      setTimeout(() => {
        isScrolling.current = false;
      }, 50);
    };

    const leftEl = leftRef.current;
    const rightEl = rightRef.current;

    leftEl.addEventListener('scroll', handleLeftScroll);
    rightEl.addEventListener('scroll', handleRightScroll);

    return () => {
      leftEl.removeEventListener('scroll', handleLeftScroll);
      rightEl.removeEventListener('scroll', handleRightScroll);
    };
  }, [syncScroll, leftRef, rightRef]);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Sync Scroll Toggle */}
      <div
        className="flex items-center justify-end gap-2 px-4 py-2 border-b"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <button
          onClick={() => setSyncScroll(!syncScroll)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: syncScroll
              ? theme === 'dark'
                ? '#3b82f6'
                : '#2563eb'
              : theme === 'dark'
                ? '#374151'
                : '#e5e7eb',
            color: syncScroll ? '#ffffff' : theme === 'dark' ? '#9ca3af' : '#6b7280',
          }}
          title={syncScroll ? 'Disable sync scrolling' : 'Enable sync scrolling'}
        >
          {syncScroll ? (
            <>
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Synced</span>
            </>
          ) : (
            <>
              <Unlink className="w-3.5 h-3.5" />
              <span>Unsynced</span>
            </>
          )}
        </button>
      </div>

      {/* Split Panels */}
      <div ref={containerRef} className="flex flex-1 relative overflow-hidden">
        {/* Left Panel */}
        <div
          ref={leftRef}
          className="overflow-auto h-full"
          style={{
            width: `${leftSize}%`,
            transition: isResizing ? 'none' : 'width 0.1s ease-out',
          }}
        >
          {leftPanel}
        </div>

        {/* Resize Handle */}
        <div
          className="relative w-1 flex-shrink-0 cursor-col-resize group hover:w-1.5 transition-all"
          style={{
            backgroundColor: isResizing
              ? theme === 'dark'
                ? '#3b82f6'
                : '#2563eb'
              : theme === 'dark'
                ? '#374151'
                : '#e5e7eb',
          }}
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none p-1 rounded"
            style={{
              backgroundColor:
                theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.2)',
              color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
            }}
          >
            <GripVertical className="w-4 h-4" />
          </div>
        </div>

        {/* Right Panel */}
        <div
          ref={rightRef}
          className="overflow-auto h-full"
          style={{
            width: `${rightSize}%`,
            transition: isResizing ? 'none' : 'width 0.1s ease-out',
          }}
        >
          {rightPanel}
        </div>
      </div>
    </div>
  );
}
