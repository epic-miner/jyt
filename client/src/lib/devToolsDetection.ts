/**
 * Advanced DevTools detection utility
 * Combines multiple detection techniques to identify if developer tools are open
 */

// Firebug and Chrome/Firefox dev tools detection
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
    }, 500);

    // Method 5: Test Firebug
    if (window.console && (window.console as any).firebug) {
      return true;
    }

    return consoleDetection() || dbgDetected;
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