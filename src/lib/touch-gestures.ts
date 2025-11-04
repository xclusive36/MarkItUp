/**
 * Mobile Touch Optimization Utilities for Graph Components
 * Provides pinch-to-zoom, pan gestures, and touch-friendly interactions
 */

export interface TouchState {
  isPinching: boolean;
  isPanning: boolean;
  initialDistance: number;
  initialScale: number;
  touches: TouchEvent['touches'];
}

export interface GestureCallbacks {
  onPinchStart?: (scale: number) => void;
  onPinch?: (scale: number, delta: number) => void;
  onPinchEnd?: () => void;
  onPanStart?: (x: number, y: number) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  onPanEnd?: () => void;
  onDoubleTap?: (x: number, y: number) => void;
  onLongPress?: (x: number, y: number) => void;
}

export class TouchGestureHandler {
  private element: HTMLElement;
  private callbacks: GestureCallbacks;
  private touchState: TouchState = {
    isPinching: false,
    isPanning: false,
    initialDistance: 0,
    initialScale: 1,
    touches: {} as TouchEvent['touches'],
  };
  private lastTap: number = 0;
  private longPressTimer: NodeJS.Timeout | null = null;
  private initialTouchPos: { x: number; y: number } | null = null;

  constructor(element: HTMLElement, callbacks: GestureCallbacks) {
    this.element = element;
    this.callbacks = callbacks;
    this.attachListeners();
  }

  private attachListeners(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
  }

  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();

    const touches = e.touches;

    // Two finger pinch/zoom
    if (touches.length === 2) {
      const touch0 = touches[0];
      const touch1 = touches[1];
      if (!touch0 || !touch1) return;

      this.touchState.isPinching = true;
      this.touchState.initialDistance = this.getDistance(touch0, touch1);

      if (this.callbacks.onPinchStart) {
        this.callbacks.onPinchStart(1);
      }

      // Clear long press timer
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    }
    // Single finger pan
    else if (touches.length === 1) {
      const touch = touches[0];
      if (!touch) return;

      this.initialTouchPos = { x: touch.clientX, y: touch.clientY };

      // Double tap detection
      const now = Date.now();
      const timeSinceLastTap = now - this.lastTap;

      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Double tap detected
        if (this.callbacks.onDoubleTap) {
          this.callbacks.onDoubleTap(touch.clientX, touch.clientY);
        }
        this.lastTap = 0;
      } else {
        this.lastTap = now;

        // Start long press detection
        this.longPressTimer = setTimeout(() => {
          if (this.callbacks.onLongPress && this.initialTouchPos) {
            this.callbacks.onLongPress(this.initialTouchPos.x, this.initialTouchPos.y);
          }
        }, 500);
      }

      // Start pan
      this.touchState.isPanning = true;
      if (this.callbacks.onPanStart) {
        this.callbacks.onPanStart(touch.clientX, touch.clientY);
      }
    }

    this.touchState.touches = touches;
  };

  private handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();

    const touches = e.touches;

    // Pinch zoom
    if (this.touchState.isPinching && touches.length === 2) {
      const touch0 = touches[0];
      const touch1 = touches[1];
      if (!touch0 || !touch1) return;

      const currentDistance = this.getDistance(touch0, touch1);
      const scale = currentDistance / this.touchState.initialDistance;
      const delta = scale - this.touchState.initialScale;

      if (this.callbacks.onPinch) {
        this.callbacks.onPinch(scale, delta);
      }

      this.touchState.initialScale = scale;

      // Cancel long press if pinching
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    }
    // Pan
    else if (this.touchState.isPanning && touches.length === 1 && this.initialTouchPos) {
      const touch = touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - this.initialTouchPos.x;
      const deltaY = touch.clientY - this.initialTouchPos.y;

      if (this.callbacks.onPan) {
        this.callbacks.onPan(deltaX, deltaY);
      }

      this.initialTouchPos = { x: touch.clientX, y: touch.clientY };

      // Cancel long press if moved significantly
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        if (this.longPressTimer) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }
      }
    }
  };

  private handleTouchEnd = (): void => {
    if (this.touchState.isPinching && this.callbacks.onPinchEnd) {
      this.callbacks.onPinchEnd();
    }

    if (this.touchState.isPanning && this.callbacks.onPanEnd) {
      this.callbacks.onPanEnd();
    }

    // Clear long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // Reset state
    this.touchState.isPinching = false;
    this.touchState.isPanning = false;
    this.touchState.initialScale = 1;
    this.initialTouchPos = null;
  };

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchEnd);

    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }
}

/**
 * React Hook for touch gesture handling
 */
export const useTouchGestures = (
  ref: React.RefObject<HTMLElement>,
  callbacks: GestureCallbacks
): void => {
  React.useEffect(() => {
    if (!ref.current) return;

    const handler = new TouchGestureHandler(ref.current, callbacks);

    return () => {
      handler.destroy();
    };
  }, [ref, callbacks]);
};

/**
 * Detect if device supports touch
 */
export const isTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * Get optimal touch target size
 */
export const getTouchTargetSize = (): number => {
  // iOS/Android recommend minimum 44px x 44px touch targets
  return isTouchDevice() ? 44 : 32;
};

/**
 * Apply mobile-friendly styles
 */
export const getMobileGraphStyles = (): React.CSSProperties => {
  if (!isTouchDevice()) {
    return {};
  }

  return {
    touchAction: 'none',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  };
};

// Add React import for the hook
import React from 'react';
