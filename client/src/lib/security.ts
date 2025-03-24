// Security utilities for content protection

// Console protection
const disableConsole = () => {
  const noop = () => undefined;
  const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace'] as const;

  // Save original console methods for our own use
  const originalConsole = {
    warn: console.warn,
    error: console.error
  };

  // Override all console methods
  methods.forEach(method => {
    // Type-safe way to override console methods
    if (method === 'log') console.log = noop;
    if (method === 'debug') console.debug = noop;
    if (method === 'info') console.info = noop;
    if (method === 'warn') console.warn = noop;
    if (method === 'error') console.error = noop;
    if (method === 'table') console.table = noop;
    if (method === 'trace') console.trace = noop;
  });

  // Add warning for console access
  const showWarning = () => {
    originalConsole.warn(
      '%cStop!', 
      'color: red; font-size: 30px; font-weight: bold;'
    );
    originalConsole.warn(
      '%cThis is a security feature of our video player. Console access is restricted.',
      'color: red; font-size: 16px;'
    );
    originalConsole.warn(
      '%cAttempting to bypass security measures is prohibited.',
      'color: red; font-size: 16px;'
    );
  };

  // Periodically clear console and show warning
  setInterval(() => {
    console.clear();
    showWarning();
  }, 100);

  // Additional protection against console overrides
  Object.defineProperty(window, 'console', {
    get: function() {
      return {
        log: noop,
        info: noop,
        warn: noop,
        error: noop,
        debug: noop,
        trace: noop,
        clear: noop
      };
    },
    set: function() {
      return false;
    }
  });
};

// DevTools detection with enhanced monitoring
export const detectDevTools = (callback: () => void) => {
  const threshold = 160;
  let isDevToolsOpen = false;

  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      if (!isDevToolsOpen) {
        isDevToolsOpen = true;
        callback();
      }
    } else {
      isDevToolsOpen = false;
    }
  };

  // Multiple detection methods
  window.addEventListener('resize', checkDevTools);
  window.addEventListener('mousemove', checkDevTools);
  setInterval(checkDevTools, 1000);

  // Additional detection methods
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: function() {
      isDevToolsOpen = true;
      callback();
      return '';
    }
  });

  // Check for Firefox dev tools
  //@ts-ignore
  if (window.devtools?.open) {
    isDevToolsOpen = true;
    callback();
  }

  // Regular checking
  setInterval(() => {
    for (let i = 0; i < 100; i++) {
      console.debug(element);
    }
  }, 1000);
};

// Keep the rest of the file unchanged
export const preventKeyboardShortcuts = () => {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // Prevent F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // Prevent Ctrl+Shift+I/J/C/K (Dev tools variations)
    if (e.ctrlKey && e.shiftKey && (
      e.key === 'I' || e.key === 'i' || 
      e.key === 'J' || e.key === 'j' || 
      e.key === 'C' || e.key === 'c' ||
      e.key === 'K' || e.key === 'k'
    )) {
      e.preventDefault();
      return false;
    }
    
    // Prevent Cmd+Option+I/J/C/K (Mac dev tools)
    if (e.metaKey && e.altKey && (
      e.key === 'I' || e.key === 'i' || 
      e.key === 'J' || e.key === 'j' || 
      e.key === 'C' || e.key === 'c' ||
      e.key === 'K' || e.key === 'k'
    )) {
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

// Iframe protection - enhanced with more aggressive prevention
export const preventIframeEmbedding = () => {
  try {
    // Method 1: Standard frame busting
    if (window.self !== window.top) {
      window.top!.location.href = window.self.location.href;
    }
    
    // Method 2: Use X-Frame-Options header (this is set server-side, but we can check)
    if (window.self !== window.top) {
      // If we're in a frame, create a blocker
      const frameBlocker = document.createElement('div');
      frameBlocker.style.position = 'fixed';
      frameBlocker.style.top = '0';
      frameBlocker.style.left = '0';
      frameBlocker.style.width = '100%';
      frameBlocker.style.height = '100%';
      frameBlocker.style.backgroundColor = 'black';
      frameBlocker.style.zIndex = '999999';
      frameBlocker.style.display = 'flex';
      frameBlocker.style.alignItems = 'center';
      frameBlocker.style.justifyContent = 'center';
      frameBlocker.style.color = 'white';
      frameBlocker.style.fontSize = '20px';
      frameBlocker.textContent = 'This website cannot be displayed in frames';
      document.body.appendChild(frameBlocker);
      
      // Try to break out of the frame
      window.self.location = window.top!.location;
    }
    
    // Method 3: Continuous monitoring
    setInterval(() => {
      if (window.self !== window.top) {
        window.top!.location.href = window.self.location.href;
      }
    }, 1000);
  } catch (e) {
    // If we get a security error, it means we're in a cross-origin frame
    // In this case, we can't access the parent, but we can still show a block screen
    try {
      const frameBlocker = document.createElement('div');
      frameBlocker.style.position = 'fixed';
      frameBlocker.style.top = '0';
      frameBlocker.style.left = '0';
      frameBlocker.style.width = '100%';
      frameBlocker.style.height = '100%';
      frameBlocker.style.backgroundColor = 'black';
      frameBlocker.style.zIndex = '999999';
      frameBlocker.style.display = 'flex';
      frameBlocker.style.alignItems = 'center';
      frameBlocker.style.justifyContent = 'center';
      frameBlocker.style.color = 'white';
      frameBlocker.style.fontSize = '20px';
      frameBlocker.textContent = 'This website cannot be displayed in frames';
      document.body.appendChild(frameBlocker);
    } catch (innerError) {
      // Last resort, if we can't even add an element
      document.body.innerHTML = 'This website cannot be displayed in frames';
    }
  }
};

// Initialize all security measures for video player
export const initializeSecurity = (videoPlayerContainer: HTMLElement) => {
  try {
    preventTextSelection(videoPlayerContainer);
    
    videoPlayerContainer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  } catch (error) {
    console.warn('Some security features could not be initialized:', error);
  }
};

// Initialize global security measures
export const initializeGlobalSecurity = () => {
  try {
    // Apply keyboard shortcut prevention
    preventKeyboardShortcuts();
    
    // Prevent right-click
    initializeGlobalRightClickPrevention();
    
    // Prevent iframe embedding
    preventIframeEmbedding();
    
    // For additional protection, add a more comprehensive console protection
    disableConsole();
  } catch (error) {
    console.warn('Some security features could not be initialized:', error);
  }
};