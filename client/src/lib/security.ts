// Security utilities for content protection

// Console protection
const disableConsole = () => {
  const noop = () => undefined;
  const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace'];

  methods.forEach(method => {
    console[method] = noop;
  });

  // Add warning for console access
  setInterval(() => {
    console.clear();
    console.warn('Console access is restricted for security purposes.');
  }, 100);
};

// DevTools detection
export const detectDevTools = (callback: () => void) => {
  const threshold = 160;

  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      callback();
    }
  };

  window.addEventListener('resize', checkDevTools);
  setInterval(checkDevTools, 1000);
};

// Key combination prevention
export const preventKeyboardShortcuts = () => {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // Prevent F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // Prevent Ctrl+Shift+I/J (Dev tools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
      e.preventDefault();
      return false;
    }

    // Prevent Ctrl+U (View source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      return false;
    }

    // Only prevent copy/paste in video player
    if (e.ctrlKey && (e.key === 'C' || e.key === 'c' || e.key === 'V' || e.key === 'v' || e.key === 'X' || e.key === 'x')) {
      const isVideoPlayer = (e.target as HTMLElement)?.closest('.video-player-container');
      if (isVideoPlayer) {
        e.preventDefault();
        return false;
      }
    }

    return true;
  });
};

// Right-click prevention
export const preventRightClick = (element: HTMLElement) => {
  element.addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault();
    return false;
  });
};

// Text selection prevention
export const preventTextSelection = (element: HTMLElement) => {
  element.style.userSelect = 'none';
  element.style.webkitUserSelect = 'none';
  element.style.msUserSelect = 'none';
  element.style.mozUserSelect = 'none';

  element.addEventListener('selectstart', (e: Event) => {
    e.preventDefault();
    return false;
  });
};

// Iframe protection
export const preventIframeEmbedding = () => {
  if (window.self !== window.top) {
    window.top.location.href = window.self.location.href;
  }
};

// Initialize all security measures
export const initializeSecurity = (videoPlayerContainer: HTMLElement) => {
  disableConsole();
  preventKeyboardShortcuts();
  preventRightClick(videoPlayerContainer);
  preventTextSelection(videoPlayerContainer);
  preventIframeEmbedding();

  detectDevTools(() => {
    // Handle DevTools detection
    console.warn('Developer tools detected. Some features may be restricted.');
  });
};