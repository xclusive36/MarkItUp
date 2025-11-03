'use client';

import { useEffect } from 'react';

/**
 * BrowserCompatibility Component
 *
 * Handles browser compatibility issues, particularly with mobile browsers
 * and browser extensions that try to inject global objects like window.ethereum
 */
export function BrowserCompatibility() {
  useEffect(() => {
    // Prevent errors from browser extensions trying to access undefined properties
    // This is common with crypto wallet extensions on mobile browsers
    if (typeof window !== 'undefined') {
      try {
        // Make window.ethereum readonly if it doesn't exist to prevent assignment errors
        const win = window as unknown as Record<string, unknown>;

        if (!win.ethereum) {
          Object.defineProperty(window, 'ethereum', {
            value: undefined,
            writable: false,
            configurable: false,
          });
        }
      } catch (error) {
        // Silently fail if we can't define the property
        console.debug('Browser compatibility: ethereum property already defined');
      }

      // Prevent other common browser extension errors
      try {
        // Some browsers/extensions try to access these
        const commonInjections = ['web3', 'solana', 'phantom', 'coinbase'];

        commonInjections.forEach(prop => {
          if (!(prop in window)) {
            try {
              Object.defineProperty(window, prop, {
                value: undefined,
                writable: false,
                configurable: false,
              });
            } catch (e) {
              // Property might already be defined
            }
          }
        });
      } catch (error) {
        // Silently fail
      }
    }
  }, []);

  return null; // This component doesn't render anything
}
