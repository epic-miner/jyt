
// Security utilities for content protection

// Console protection
const disableConsole = () => {
  const noop = () => undefined;
  const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace'];

  // Save original console methods for our own use
  const originalConsole = {
    warn: console.warn,
    error: console.error
  };

  // Override all console methods
  methods.forEach(method => {
    console[method] = noop;
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
  
  // Method 1: Check window size difference
  const checkWindowSizeDiff = () => {
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
  
  // Method 2: Check console timing
  const checkConsoleTimingMethod = () => {
    const startTime = performance.now();
    
    // This will be super slow when dev tools is open with console tab
    console.debug('DevTools Detection');
    
    const endTime = performance.now();
    if (endTime - startTime > 100) {
      if (!isDevToolsOpen) {
        isDevToolsOpen = true;
        callback();
      }
    }
  };
  
  // Method 3: Element inspection detection
  const detectElementInspection = () => {
    const element = document.createElement('div');
    Object.defineProperty(element, 'id', {
      get: function() {
        if (!isDevToolsOpen) {
          isDevToolsOpen = true;
          callback();
        }
        return 'detected';
      }
    });
    console.debug(element);
  };
  
  // Initialize all detection methods
  window.addEventListener('resize', checkWindowSizeDiff);
  setInterval(checkWindowSizeDiff, 1000);
  setInterval(checkConsoleTimingMethod, 1000);
  setInterval(detectElementInspection, 1000);
  
  // Method 4: Debugger detection
  let isDebuggerPresent = false;
  const checkDebugger = () => {
    const startTime = performance.now();
    debugger;
    const endTime = performance.now();
    
    if (endTime - startTime > 100) {
      if (!isDebuggerPresent) {
        isDebuggerPresent = true;
        callback();
      }
    } else {
      isDebuggerPresent = false;
    }
  };
  
  setInterval(checkDebugger, 1000);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', checkWindowSizeDiff);
  };
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

// Keyboard shortcut prevention
export const preventKeyboardShortcuts = () => {
  document.addEventListener('keydown', function(e) {
    // Prevent F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    
    // Prevent Ctrl+Shift+I/J (Dev tools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
      e.preventDefault();
      return false;
    }
    
    // Prevent Ctrl+Shift+C (Element inspector)
    if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
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
    
    // Prevent Alt+F4 (Close browser)
    if (e.altKey && (e.key === 'F4' || e.keyCode === 115)) {
      e.preventDefault();
      return false;
    }
    
    // Prevent Ctrl+P (Print)
    if (e.ctrlKey && (e.key === 'P' || e.key === 'p')) {
      e.preventDefault();
      return false;
    }

    return true;
  }, { passive: false });
};

// Custom right-click menu
export const customRightClickMenu = () => {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    
    // Create custom menu only for videos
    const target = e.target as HTMLElement;
    if (target.tagName === 'VIDEO') {
      const menu = document.createElement('div');
      menu.className = 'custom-context-menu';
      menu.innerHTML = `
        <div class="menu-item">Play/Pause</div>
        <div class="menu-item">9Anime Settings</div>
        <div class="menu-item">Loop Video</div>
      `;
      
      menu.style.position = 'absolute';
      menu.style.top = `${e.pageY}px`;
      menu.style.left = `${e.pageX}px`;
      menu.style.backgroundColor = '#1a1a1a';
      menu.style.border = '1px solid #333';
      menu.style.borderRadius = '4px';
      menu.style.padding = '5px 0';
      menu.style.zIndex = '9999';
      
      const menuItems = menu.querySelectorAll('.menu-item');
      menuItems.forEach(item => {
        (item as HTMLElement).style.padding = '8px 12px';
        (item as HTMLElement).style.cursor = 'pointer';
        (item as HTMLElement).style.color = '#fff';
        (item as HTMLElement).style.fontSize = '14px';
        
        item.addEventListener('mouseenter', () => {
          (item as HTMLElement).style.backgroundColor = '#333';
        });
        
        item.addEventListener('mouseleave', () => {
          (item as HTMLElement).style.backgroundColor = 'transparent';
        });
        
        item.addEventListener('click', () => {
          document.body.removeChild(menu);
        });
      });
      
      document.body.appendChild(menu);
      
      // Remove menu when clicking elsewhere
      const removeMenu = () => {
        if (document.body.contains(menu)) {
          document.body.removeChild(menu);
        }
        document.removeEventListener('click', removeMenu);
      };
      
      setTimeout(() => {
        document.addEventListener('click', removeMenu);
      }, 100);
    }
    
    return false;
  }, { passive: false });
};

// Iframe protection
export const preventIframeEmbedding = () => {
  if (window.self !== window.top) {
    window.top!.location.href = window.self.location.href;
  }
  
  // Additional X-Frame-Options simulation in JS
  try {
    // Attempt to detect if in iframe
    if (window.top !== window.self) {
      throw new Error('This site cannot be displayed in frames');
    }
    
    // Add additional protection by constantly checking
    setInterval(() => {
      if (window.top !== window.self) {
        window.top!.location.href = window.self.location.href;
      }
    }, 1000);
  } catch (e) {
    // Fallback if access to parent is blocked (different origin)
    window.location.href = document.referrer || window.location.href;
  }
};

// Source code obfuscation hint
const protectSourceCode = () => {
  // This is just a hint - actual obfuscation should be done during the build process
  // with tools like javascript-obfuscator
  document.addEventListener('copy', function(e) {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 200) {
      e.clipboardData?.setData('text/plain', 'Content copying is restricted on 9Anime.');
      e.preventDefault();
    }
  });
};

// Video content protection
export const protectVideoContent = (videoElement: HTMLVideoElement) => {
  // Disable picture-in-picture
  videoElement.disablePictureInPicture = true;
  
  // Prevent download by blocking source access
  videoElement.addEventListener('contextmenu', e => e.preventDefault());
  
  // Add a div overlay to prevent easy capture
  const parentElement = videoElement.parentElement;
  if (parentElement) {
    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'video-overlay';
    overlayDiv.style.position = 'absolute';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.width = '100%';
    overlayDiv.style.height = '100%';
    overlayDiv.style.pointerEvents = 'none'; // Allow clicks to pass through
    
    // Ensure the parent has position relative for proper overlay positioning
    if (window.getComputedStyle(parentElement).position === 'static') {
      parentElement.style.position = 'relative';
    }
    
    parentElement.appendChild(overlayDiv);
    
    // Pass through video events to maintain functionality
    ['play', 'pause', 'timeupdate', 'seeking', 'seeked'].forEach(eventName => {
      videoElement.addEventListener(eventName, () => {
        overlayDiv.dispatchEvent(new Event(eventName));
      });
    });
  }
  
  // Hide the video URL by intercepting the src property
  const originalSrc = videoElement.src;
  Object.defineProperty(videoElement, 'src', {
    get: function() {
      return '';
    },
    set: function(value) {
      originalSrc = value;
      this.setAttribute('data-src', 'protected');
    }
  });
};

// Initialize all security measures for video player
export const initializeSecurity = (videoPlayerContainer: HTMLElement) => {
  try {
    preventTextSelection(videoPlayerContainer);
    
    videoPlayerContainer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
    
    const videoElements = videoPlayerContainer.querySelectorAll('video');
    videoElements.forEach(video => {
      protectVideoContent(video);
    });
  } catch (error) {
    console.warn('Some security features could not be initialized:', error);
  }
};

// Initialize global security measures
export const initializeGlobalSecurity = () => {
  try {
    // Apply browser-wide protections
    preventKeyboardShortcuts();
    customRightClickMenu();
    preventIframeEmbedding();
    protectSourceCode();
    
    // Apply page-wide contextmenu prevention
    document.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement;
      // Only prevent default context menu for non-video elements
      // Videos will use our custom menu
      if (target.tagName !== 'VIDEO') {
        e.preventDefault();
        return false;
      }
      return true;
    });
    
    // Initialize DevTools detection
    const devToolsCallback = () => {
      // Redirect or show warning when DevTools is detected
      document.body.innerHTML = `
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
          <h1 style="color: red;">Access Denied</h1>
          <p>Developer tools detected. This action has been logged.</p>
          <p>Please close developer tools to continue using 9Anime.</p>
          <button onclick="window.location.reload()">Reload Page</button>
        </div>
      `;
    };
    
    detectDevTools(devToolsCallback);
    
    // Document protection against drag and drop
    document.addEventListener('dragstart', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
        e.preventDefault();
        return false;
      }
      return true;
    });
  } catch (error) {
    console.warn('Some security features could not be initialized:', error);
  }
};

// Console protection hook for React
export const useConsoleProtection = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      disableConsole();
    }
    return () => {
      // Cleanup if needed
    };
  }, []);
};
