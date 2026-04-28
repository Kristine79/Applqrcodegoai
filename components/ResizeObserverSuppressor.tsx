'use client';

import { useEffect } from 'react';

/**
 * Suppresses ResizeObserver loop warnings which are benign in React/Chrome.
 * This is a common warning that doesn't affect functionality.
 */
export default function ResizeObserverSuppressor() {
  useEffect(() => {
    const originalError = window.console.error;
    
    window.console.error = (...args: unknown[]) => {
      const message = args[0]?.toString() || '';
      
      // Filter out ResizeObserver warnings
      if (
        message.includes('ResizeObserver loop') ||
        message.includes('ResizeObserver Loop')
      ) {
        // Silently ignore
        return;
      }
      
      // Pass through other errors
      originalError.apply(window.console, args);
    };

    // Also suppress via error event for unhandled cases
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('ResizeObserver loop')) {
        event.stopImmediatePropagation();
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError, { capture: true });

    return () => {
      window.console.error = originalError;
      window.removeEventListener('error', handleError, { capture: true });
    };
  }, []);

  return null;
}
