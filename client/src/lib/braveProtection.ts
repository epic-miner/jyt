/**
 * Special protection techniques for Brave browser
 * Since Brave has unique behavior with respect to developer tools detection
 */

// Detect if running in Brave browser
export const isBraveBrowser = (): boolean => {
  try {
    // Method 1: Check for brave property in navigator (newer versions)
    // @ts-ignore - Proprietary property
    if (navigator.brave && navigator.brave.isBrave) {
      return true;
    }
    
    // Method 2: Check for specific user agent patterns
    const ua = navigator.userAgent;
    if (
      /Chrome/.test(ua) && 
      /Brave/.test(ua)
    ) {
      return true;
    }
    
    // Method 3: Check for Brave Shield feature
    // @ts-ignore - Proprietary Chrome API
    return typeof window.chrome !== 'undefined' && 
           // @ts-ignore
           typeof window.chrome.runtime !== 'undefined' && 
           // @ts-ignore
           typeof window.chrome.braveShields !== 'undefined';
  } catch (e) {
    return false;
  }
};

// Special brave devtools detection
export const detectBraveDevTools = (): boolean => {
  try {
    // Method 1: Function.toString behavior in Brave's DevTools
    const originalFunc = Function.prototype.toString;
    let devToolsOpen = false;
    
    // Temporarily override toString method
    Object.defineProperty(Function.prototype, 'toString', {
      value: function() {
        devToolsOpen = true;
        return originalFunc.apply(this, arguments);
      },
      configurable: true
    });
    
    // Call console methods that trigger toString inspection in DevTools
    console.profile();
    console.profileEnd();
    
    // Restore original toString
    Object.defineProperty(Function.prototype, 'toString', {
      value: originalFunc,
      configurable: true
    });
    
    if (devToolsOpen) {
      return true;
    }
    
    // Method 2: Advanced timing detection for Brave
    const startTime = performance.now();
    
    const div = document.createElement('div');
    Object.defineProperty(div, 'id', {
      get() {
        return div;
      }
    });
    
    // Calling these in sequence takes longer with DevTools open
    console.log(div);
    console.clear();
    
    const endTime = performance.now();
    const timeDiff = endTime - startTime;
    
    return timeDiff > 50; // Higher threshold for Brave
  } catch (e) {
    return false;
  }
};

// Install Brave-specific keyboard listeners
export const installBraveKeyboardProtection = (): (() => void) => {
  // Brave uses different keyboard shortcuts in some cases
  const handleKeyDown = (e: KeyboardEvent) => {
    // Brave's inspector shortcut (might be Ctrl+Shift+I or Cmd+Opt+I on Mac)
    if (
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
      (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) ||
      (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) ||
      (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j')) ||
      // Brave's console shortcut
      (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k')) ||
      (e.metaKey && e.altKey && (e.key === 'K' || e.key === 'k')) ||
      // Brave's view source
      (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
      // F12 key for dev tools
      (e.key === 'F12')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // Add the event listener
  window.addEventListener('keydown', handleKeyDown, true);
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown, true);
  };
};

// Create a blocking overlay with Brave-specific message
export const createBraveBlocker = (redirectCallback: () => void): HTMLDivElement => {
  const blockerDiv = document.createElement('div');
  blockerDiv.style.position = 'fixed';
  blockerDiv.style.top = '0';
  blockerDiv.style.left = '0';
  blockerDiv.style.width = '100%';
  blockerDiv.style.height = '100%';
  blockerDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.97)';
  blockerDiv.style.zIndex = '2147483647'; // Max possible z-index
  blockerDiv.style.display = 'flex';
  blockerDiv.style.flexDirection = 'column';
  blockerDiv.style.alignItems = 'center';
  blockerDiv.style.justifyContent = 'center';
  blockerDiv.style.color = 'white';
  blockerDiv.style.fontSize = '22px';
  blockerDiv.style.textAlign = 'center';
  blockerDiv.style.padding = '20px';
  
  // Main warning message
  const warningIcon = document.createElement('div');
  warningIcon.textContent = '⚠️';
  warningIcon.style.fontSize = '48px';
  warningIcon.style.marginBottom = '20px';
  blockerDiv.appendChild(warningIcon);
  
  const message = document.createElement('div');
  message.textContent = 'Access Denied - Developer Tools Detected';
  message.style.fontWeight = 'bold';
  blockerDiv.appendChild(message);
  
  // Brave-specific message
  const braveMessage = document.createElement('div');
  braveMessage.textContent = 'Brave browser developer tools must be closed to access this content';
  braveMessage.style.fontSize = '16px';
  braveMessage.style.marginTop = '15px';
  braveMessage.style.color = '#ff9c9c';
  blockerDiv.appendChild(braveMessage);
  
  // Instructions
  const instructions = document.createElement('div');
  instructions.textContent = 'Please close developer tools (F12 or Ctrl+Shift+I) and reload the page';
  instructions.style.fontSize = '14px';
  instructions.style.marginTop = '25px';
  instructions.style.maxWidth = '500px';
  instructions.style.color = '#aaa';
  blockerDiv.appendChild(instructions);
  
  // Redirecting message
  const redirectMessage = document.createElement('div');
  redirectMessage.textContent = 'Redirecting for security reasons...';
  redirectMessage.style.fontSize = '14px';
  redirectMessage.style.marginTop = '30px';
  redirectMessage.style.color = '#666';
  blockerDiv.appendChild(redirectMessage);
  
  document.body.appendChild(blockerDiv);
  
  // Redirect after 3 seconds
  setTimeout(redirectCallback, 3000);
  
  return blockerDiv;
};