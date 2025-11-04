import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Announce message to screen readers using ARIA live regions
 * @param message - Message to announce
 * @param priority - Priority level ('polite' | 'assertive')
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  // Find or create live region
  let liveRegion = document.getElementById(`aria-live-${priority}`);

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = `aria-live-${priority}`;
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(liveRegion);
  }

  // Clear and set new message
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion!.textContent = message;
  }, 100);
}

/**
 * Hook to announce messages to screen readers
 * @param message - Message to announce (when it changes)
 * @param priority - Priority level
 */
export function useScreenReaderAnnouncement(
  message: string | null,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  useEffect(() => {
    if (message) {
      announceToScreenReader(message, priority);
    }
  }, [message, priority]);
}

/**
 * Hook for managing focus trap within a component
 * Useful for modals, dialogs, and dropdown menus
 * @param isActive - Whether the focus trap is active
 * @returns Ref to attach to the container element
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  isActive: boolean
): React.RefObject<T | null> {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus();
          e.preventDefault();
        }
      }
    };

    // Focus first element
    firstFocusable?.focus();

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for restoring focus when a component unmounts
 * Useful for modals and dialogs
 * @param isActive - Whether to track and restore focus
 */
export function useFocusRestore(isActive: boolean): void {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      return () => {
        // Restore focus when component unmounts
        if (previousActiveElement.current && previousActiveElement.current.focus) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isActive]);
}

/**
 * Hook for keyboard navigation in lists
 * Supports arrow keys, Home, End
 * @param itemCount - Number of items in the list
 * @param onSelect - Callback when item is selected (Enter/Space)
 * @returns Current index and keyboard event handler
 */
export function useKeyboardNavigation(
  itemCount: number,
  onSelect: (index: number) => void
): {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
} {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setCurrentIndex(prev => Math.min(prev + 1, itemCount - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setCurrentIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Home':
          e.preventDefault();
          setCurrentIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentIndex(itemCount - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect(currentIndex);
          break;
      }
    },
    [currentIndex, itemCount, onSelect]
  );

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
  };
}

/**
 * Hook to detect if user prefers reduced motion
 * @returns Whether user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to manage skip links for keyboard navigation
 * @param skipTargets - Array of {id, label} for skip link targets
 */
export function useSkipLinks(skipTargets: Array<{ id: string; label: string }>): {
  renderSkipLinks: () => React.ReactNode;
  skipTo: (id: string) => void;
} {
  const skipTo = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      announceToScreenReader(`Skipped to ${id}`);
    }
  }, []);

  const renderSkipLinks = useCallback(() => {
    return (
      <div className="sr-only focus-within:not-sr-only">
        {skipTargets.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => skipTo(id)}
            className="skip-link absolute top-0 left-0 bg-blue-600 text-white px-4 py-2 z-50 focus:relative"
          >
            Skip to {label}
          </button>
        ))}
      </div>
    );
  }, [skipTargets, skipTo]);

  return {
    renderSkipLinks,
    skipTo,
  };
}

/**
 * Generate unique IDs for ARIA relationships
 * @param prefix - Prefix for the ID
 * @returns A unique ID
 */
let idCounter = 0;
export function useAriaId(prefix: string = 'aria'): string {
  const [id] = useState(() => {
    idCounter++;
    return `${prefix}-${idCounter}`;
  });
  return id;
}

/**
 * Hook for announcing route changes to screen readers
 * @param routeName - Current route name
 */
export function useRouteAnnouncement(routeName: string): void {
  useEffect(() => {
    announceToScreenReader(`Navigated to ${routeName}`);
  }, [routeName]);
}

/**
 * Utility to check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false;

  const tagName = element.tagName.toLowerCase();
  const focusableTags = ['a', 'button', 'input', 'select', 'textarea'];

  if (focusableTags.includes(tagName)) {
    return !element.hasAttribute('disabled');
  }

  return element.hasAttribute('tabindex');
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));
  return elements.filter(el => isFocusable(el) && !el.hasAttribute('disabled'));
}
