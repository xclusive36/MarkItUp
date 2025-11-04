import React, { useState, useRef, useEffect, useMemo, CSSProperties } from 'react';

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  emptyMessage?: string;
}

/**
 * VirtualScroll - A virtual scrolling component that only renders visible items
 * This dramatically improves performance when rendering large lists (100+ items)
 *
 * Key benefits:
 * - Only renders items that are visible in the viewport + overscan buffer
 * - Maintains smooth scrolling by reusing DOM nodes
 * - Reduces memory footprint for large datasets
 *
 * @param items - Array of items to render
 * @param itemHeight - Fixed height of each item in pixels
 * @param containerHeight - Height of the scroll container in pixels
 * @param overscan - Number of items to render outside viewport (default: 3)
 * @param renderItem - Function to render each item
 * @param keyExtractor - Function to extract unique key from each item
 * @param className - Optional CSS class for the container
 * @param emptyMessage - Message to show when items array is empty
 *
 * @example
 * <VirtualScroll
 *   items={notes}
 *   itemHeight={64}
 *   containerHeight={600}
 *   overscan={5}
 *   renderItem={(note) => <NoteCard note={note} />}
 *   keyExtractor={(note) => note.id}
 * />
 */
export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
  renderItem,
  keyExtractor,
  className = '',
  emptyMessage = 'No items to display',
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate which items should be visible
  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex).map((item, i) => ({
      item,
      index: startIndex + i,
    }));

    return {
      visibleItems,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Reset scroll position when items change dramatically
  useEffect(() => {
    if (containerRef.current && scrollTop > items.length * itemHeight) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length, itemHeight, scrollTop]);

  if (items.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-gray-500 ${className}`}
        style={{ height: containerHeight }}
      >
        {emptyMessage}
      </div>
    );
  }

  const containerStyle: CSSProperties = {
    height: containerHeight,
    overflow: 'auto',
    position: 'relative',
  };

  const innerStyle: CSSProperties = {
    height: totalHeight,
    position: 'relative',
  };

  const contentStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    transform: `translateY(${offsetY}px)`,
  };

  return (
    <div ref={containerRef} className={className} style={containerStyle} onScroll={handleScroll}>
      <div style={innerStyle}>
        <div style={contentStyle}>
          {visibleItems.map(({ item, index }) => (
            <div key={keyExtractor(item, index)} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing virtual scroll state
 * Useful when you need more control over the virtual scrolling behavior
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 3
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  return {
    scrollTop,
    setScrollTop,
    ...visibleRange,
  };
}
