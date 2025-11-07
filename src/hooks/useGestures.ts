'use client';

import { useState, useCallback, useRef, TouchEvent, MouseEvent } from 'react';

export interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
  onMouseDown: (e: MouseEvent) => void;
}

export interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

/**
 * Hook for detecting swipe gestures on touch devices
 * Returns handlers to spread onto an element
 */
export function useSwipe(config: SwipeConfig): SwipeHandlers {
  const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50 } = config;
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches[0]) {
      setTouchEnd(null);
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches[0]) {
      setTouchEnd({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;

    // Determine if swipe was more horizontal or vertical
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

    if (isHorizontal) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (deltaX < 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && onSwipeUp) {
          onSwipeUp();
        } else if (deltaY < 0 && onSwipeDown) {
          onSwipeDown();
        }
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    // Support for desktop testing
    setTouchEnd(null);
    setTouchStart({
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
  };
}

/**
 * Hook for drag interactions with position tracking
 */
export interface DragState {
  isDragging: boolean;
  position: { x: number; y: number };
  offset: { x: number; y: number };
}

export function useDrag() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    position: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
  });

  const startDrag = useCallback((clientX: number, clientY: number) => {
    setDragState({
      isDragging: true,
      position: { x: clientX, y: clientY },
      offset: { x: 0, y: 0 },
    });
  }, []);

  const updateDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragState.isDragging) return;

      setDragState(prev => ({
        ...prev,
        offset: {
          x: clientX - prev.position.x,
          y: clientY - prev.position.y,
        },
      }));
    },
    [dragState.isDragging]
  );

  const endDrag = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      isDragging: false,
    }));
  }, []);

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
  };
}

/**
 * Hook for long press detection
 */
export interface LongPressConfig {
  onLongPress: () => void;
  delay?: number;
}

export function useLongPress(config: LongPressConfig) {
  const { onLongPress, delay = 500 } = config;
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsPressed(true);
    timerRef.current = setTimeout(() => {
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const cancel = useCallback(() => {
    setIsPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    isPressed,
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
  };
}
