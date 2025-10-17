'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseResizableSplitPanelOptions {
  minSize?: number;
  maxSize?: number;
  defaultSize?: number;
  storageKey?: string;
}

export function useResizableSplitPanel({
  minSize = 30,
  maxSize = 70,
  defaultSize = 50,
  storageKey = 'split-panel-size',
}: UseResizableSplitPanelOptions = {}) {
  const [leftSize, setLeftSize] = useState<number>(() => {
    if (typeof window !== 'undefined' && storageKey) {
      const saved = localStorage.getItem(storageKey);
      return saved ? parseFloat(saved) : defaultSize;
    }
    return defaultSize;
  });

  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newLeftSize = ((e.clientX - rect.left) / rect.width) * 100;

      if (newLeftSize >= minSize && newLeftSize <= maxSize) {
        setLeftSize(newLeftSize);
        if (storageKey) {
          localStorage.setItem(storageKey, newLeftSize.toString());
        }
      }
    },
    [isResizing, minSize, maxSize, storageKey]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return {
    leftSize,
    rightSize: 100 - leftSize,
    isResizing,
    handleMouseDown,
    containerRef,
  };
}
