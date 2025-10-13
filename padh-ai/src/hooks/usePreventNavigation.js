import { useEffect } from 'react';

export const usePreventNavigation = (isEnabled = true) => {
  useEffect(() => {
    if (!isEnabled) return;

    // Store original history methods
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    const originalGo = window.history.go;
    const originalBack = window.history.back;
    const originalForward = window.history.forward;

    // Override history methods to prevent navigation
    window.history.pushState = function() {
      // Allow pushState but prevent back navigation
      originalPushState.apply(this, arguments);
      // Push another state to prevent back
      originalPushState.call(this, null, null, window.location.href);
    };

    window.history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
    };

    window.history.go = function() {
      // Prevent go method
      return false;
    };

    window.history.back = function() {
      // Prevent back method
      return false;
    };

    window.history.forward = function() {
      // Prevent forward method
      return false;
    };

    // Prevent popstate event
    const preventPopState = (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Push current state again
      originalPushState.call(window.history, null, null, window.location.href);
      return false;
    };

    // Prevent beforeunload
    const preventBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
      return 'Are you sure you want to leave? Your progress will be lost.';
    };

    // Prevent keyboard shortcuts
    const preventKeyboardNavigation = (e) => {
      if (e.key === 'Backspace' || e.key === 'Alt+Left' || e.key === 'ArrowLeft') {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    window.addEventListener('popstate', preventPopState);
    window.addEventListener('beforeunload', preventBeforeUnload);
    document.addEventListener('keydown', preventKeyboardNavigation);

    // Push initial state to prevent back navigation
    originalPushState.call(window.history, null, null, window.location.href);

    // Cleanup function
    return () => {
      // Restore original history methods
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.history.go = originalGo;
      window.history.back = originalBack;
      window.history.forward = originalForward;

      // Remove event listeners
      window.removeEventListener('popstate', preventPopState);
      window.removeEventListener('beforeunload', preventBeforeUnload);
      document.removeEventListener('keydown', preventKeyboardNavigation);
    };
  }, [isEnabled]);
};
