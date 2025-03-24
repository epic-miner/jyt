/**
 * Advanced DevTools detection utility
 * Combines multiple detection techniques to identify if developer tools are open
 * with special handling for Brave and other Chromium-based browsers
 */

// Check if browser is Brave
const isBraveBrowser = (): boolean => {
  try {
    // @ts-ignore - Brave-specific property
    return navigator.brave?.isBrave || false;
  } catch (_) {
    return false;
  }
};

// Specialized detection approach for Brave browser
const braveDetection = (): boolean => {
  try {
    // Test 1: Regex-based detection of debugger 
    const regexMatch = /Chrome\/devtools/i.test(navigator.userAgent);
    if (regexMatch) return true;
    
    // Test 2: Brave-specific console timing test (adjusted threshold)
    const startTime = performance.now();
    console.log('');
    console.clear();
    const endTime = performance.now();
    // Brave requires a higher threshold
    return (endTime - startTime) > 30;
  } catch (_) {
    return false;
  }
};

// Elements test (works in most browsers including Brave)
const elementsTest = (): boolean => {
  try {
    const div = document.createElement('div');
    
    // This is a more reliable test for Brave
    let measureDevTools = false;
    Object.defineProperty(div, 'id', {
      get() {
        measureDevTools = true;
        return undefined;
      },
    });
    
    console.log(div);
    console.clear();
    
    return measureDevTools;
  } catch (_) {
    return false;
  }
};

// Chromium-based devtools detection (Chrome, Edge, Brave, etc.)
const chromiumDetection = (): boolean => {
  // Detects the __REACT_DEVTOOLS_GLOBAL_HOOK__ which is present in dev tools
  // @ts-ignore
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    return true;
  }
  
  // Detects Chrome DevTools protocol
  try {
    if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
      return (window as any).chrome && 
             (window as any).chrome.devtools !== undefined;
    }
  } catch (_) {
    // Ignore errors
  }
  
  return false;
};

// Main DevTools detection function - combines multiple methods
export const isDevToolsOpen = (): boolean => {
  try {
    // Method 1: Window size comparison
    // If dev tools are docked to the side, the window outerWidth will be greater than innerWidth
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    if (widthThreshold || heightThreshold) {
      return true;
    }

    // Method 2: Console timing detection
    // Dev tools slows down console.log significantly
    const consoleDetection = (): boolean => {
      const startTime = performance.now();
      console.log(''); // Empty log to avoid noise
      const endTime = performance.now();
      // In normal conditions, this operation takes less than 5ms
      // With dev tools open, it can take much longer (>20ms)
      const timeDifference = endTime - startTime;
      return timeDifference > 20;
    };

    // Method 3: Check for Firefox dev tools specific object
    //@ts-ignore
    if (window.devtools?.open) {
      return true;
    }

    // Method 4: Using debugger detection
    // When debugger is attached, some timing functions get affected
    let dbgDetected = false;
    const oldDate = Date;
    const debug = new Proxy(Date, {
      apply(target, thisArg, args) {
        dbgDetected = true;
        return Reflect.apply(target, thisArg, args);
      },
      construct(target, args) {
        dbgDetected = true;
        return Reflect.construct(target, args);
      }
    });

    // @ts-ignore - Temporarily replace Date constructor and restore it after a few milliseconds
    window.Date = debug;
    setTimeout(() => {
      // @ts-ignore
      window.Date = oldDate;
    }, 100);

    // Method 5: Test Firebug
    if (window.console && (window.console as any).firebug) {
      return true;
    }
    
    // Method 6: Browser-specific detection
    if (isBraveBrowser()) {
      return braveDetection() || elementsTest();
    }
    
    return consoleDetection() || dbgDetected || chromiumDetection() || elementsTest();
  } catch (e) {
    // If there's an error in our detection code, play it safe and return false
    return false;
  }
};

// Monitor for dev tools opening
export const monitorDevTools = (callback: () => void): () => void => {
  let devToolsStatus = isDevToolsOpen();
  let monitoringInterval: number;
  
  const checkStatus = () => {
    const currentStatus = isDevToolsOpen();
    
    // Only call callback when status changes from closed to open
    if (currentStatus && !devToolsStatus) {
      callback();
    }
    
    devToolsStatus = currentStatus;
  };
  
  // Initial check
  checkStatus();
  
  // Regular monitoring
  monitoringInterval = window.setInterval(checkStatus, 1000);
  
  // Return cleanup function
  return () => {
    window.clearInterval(monitoringInterval);
  };
};