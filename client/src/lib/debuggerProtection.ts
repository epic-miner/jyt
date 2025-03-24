// This module provides protection against debugger dodging techniques

/**
 * Installs protection against debugger dodging techniques
 * 
 * Debugger dodging is a technique used to bypass developer tools detection
 * by preventing the execution of debugger statements through various means.
 */
export const installDebuggerProtection = (): (() => void) => {
  // Keep track of original function to restore later
  const originalSetTimeout = window.setTimeout;
  const originalDefineProperty = Object.defineProperty;
  
  // Counter to detect potential debugger evasion attempts
  let suspiciousActivityCount = 0;
  
  // Add debugger statements randomly throughout code execution
  const randomDebugger = () => {
    // Only occasionally add a debugger statement (1 in 5 chance)
    if (Math.random() < 0.2) {
      debugger;
    }
    originalSetTimeout(randomDebugger, Math.floor(Math.random() * 5000) + 1000);
  };
  
  // Start the random debugger
  const timeoutId = originalSetTimeout(randomDebugger, 2000);
  
  // Protect against overriding setTimeout
  try {
    // Make setTimeout harder to modify
    Object.defineProperty(window, 'setTimeout', {
      configurable: false,
      writable: false,
      value: originalSetTimeout
    });
  } catch (e) {
    // Ignore errors
  }
  
  // Protect against modifying Object.defineProperty itself
  try {
    // Save a reference to Object.defineProperty
    const secureDefineProperty = Object.defineProperty;
    
    // Make Object.defineProperty harder to modify
    secureDefineProperty(Object, 'defineProperty', {
      configurable: false,
      writable: false,
      value: function(obj: any, prop: string, descriptor: PropertyDescriptor) {
        // Check for suspicious activity
        if (obj === window && 
            (prop === 'setTimeout' || 
             prop === 'setInterval' || 
             prop === 'debugger' ||
             prop === 'console')) {
          suspiciousActivityCount++;
          
          // If too many suspicious activities, assume evasion attempt
          if (suspiciousActivityCount > 3) {
            // Force redirect on suspected evasion
            window.location.href = 'https://www.youtube.com';
          }
          
          // Block the modification
          return obj;
        }
        
        // Allow normal usage
        return originalDefineProperty.call(Object, obj, prop, descriptor);
      }
    });
  } catch (e) {
    // Ignore errors
  }
  
  // Return a cleanup function
  return () => {
    clearTimeout(timeoutId);
    
    // Note: We can't really "clean up" the defineProperty protections
    // since we made them non-configurable, but that's okay for our use case
  };
};

/**
 * Checks if someone is trying to evade the debugger
 * 
 * @returns boolean True if evasion detected
 */
export const checkForDebuggerEvasion = (): boolean => {
  try {
    // Method 1: Check if debugger statement executes properly
    let debuggerWorked = false;
    const testDebugger = () => {
      debuggerWorked = true;
    };
    
    // Set a flag before debugger
    const flag = { value: false };
    
    // This should trigger the debugger if dev tools are open
    // If someone is evading, this won't pause execution
    debugger;
    
    // If we get here immediately (no pause), someone might be evading
    flag.value = true;
    
    // Method 2: Check for function constructor modification
    // Some debugger evasion techniques modify Function.prototype.constructor
    const originalFunctionConstructor = Function.prototype.constructor;
    const functionToString = Function.prototype.toString;
    
    // If these have been modified, it might indicate evasion
    if (originalFunctionConstructor !== Function || 
        functionToString.toString().indexOf('[native code]') === -1) {
      return true;
    }
    
    return false;
  } catch (e) {
    // An error might indicate tampering
    return true;
  }
};