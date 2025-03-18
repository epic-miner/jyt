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

    // Prevent Ctrl+S (Save page)
    if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      return false;
    }

    // Prevent copy/paste/cut operations globally
    if (e.ctrlKey && (
      e.key === 'C' || e.key === 'c' ||
      e.key === 'V' || e.key === 'v' ||
      e.key === 'X' || e.key === 'x'
    )) {
      const target = e.target as HTMLElement;
      // Allow copy/paste in form elements only
      if (!(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        e.preventDefault();
        return false;
      }
    }

    return true;
  });

  // Additional clipboard protection
  document.addEventListener('copy', (e: ClipboardEvent) => {
    const target = e.target as HTMLElement;
    if (!(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      e.preventDefault();
      return false;
    }
  });

  document.addEventListener('cut', (e: ClipboardEvent) => {
    const target = e.target as HTMLElement;
    if (!(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      e.preventDefault();
      return false;
    }
  });

  document.addEventListener('paste', (e: ClipboardEvent) => {
    const target = e.target as HTMLElement;
    if (!(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      e.preventDefault();
      return false;
    }
  });
};

// Right-click prevention for specific element
export const preventRightClick = (element: HTMLElement) => {
  element.addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault();
    return false;
  });
};

// Global right-click prevention
export const initializeGlobalRightClickPrevention = () => {
  document.addEventListener('contextmenu', (e: MouseEvent) => {
    // Allow right-click on form elements
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return true;
    }

    // Prevent right-click on everything else
    e.preventDefault();
    return false;
  });

  // Additional mouse event prevention
  document.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.button === 2) { // Right mouse button
      e.preventDefault();
      return false;
    }
  });

  // Prevent dragging of elements
  document.addEventListener('dragstart', (e: DragEvent) => {
    const target = e.target as HTMLElement;
    if (!target.matches('input, textarea')) {
      e.preventDefault();
      return false;
    }
  });
};

// Text selection prevention
export const preventTextSelection = (element: HTMLElement) => {
  element.style.userSelect = 'none';
  element.style.webkitUserSelect = 'none';

  element.addEventListener('selectstart', (e: Event) => {
    e.preventDefault();
    return false;
  });
};

// Iframe protection
export const preventIframeEmbedding = () => {
  if (window.self !== window.top) {
    window.top!.location.href = window.self.location.href;
  }
};

// Initialize all security measures for video player
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

// Initialize global security measures
export const initializeGlobalSecurity = () => {
  preventKeyboardShortcuts();
  initializeGlobalRightClickPrevention();
  preventIframeEmbedding();
  disableConsole();

  detectDevTools(() => {
    console.warn('Developer tools detected. Some features may be restricted.');
  });
};