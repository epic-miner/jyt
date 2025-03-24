
/**
 * Global security module to prevent developer tools usage
 */

let devToolsDetected = false;

// Create blocker overlay
function createBlocker() {
  if (document.getElementById('dev-tools-blocker')) {
    return; // Already created
  }
  
  const blocker = document.createElement('div');
  blocker.id = 'dev-tools-blocker';
  blocker.style.position = 'fixed';
  blocker.style.top = '0';
  blocker.style.left = '0';
  blocker.style.width = '100%';
  blocker.style.height = '100%';
  blocker.style.backgroundColor = 'black';
  blocker.style.color = 'white';
  blocker.style.textAlign = 'center';
  blocker.style.paddingTop = '20%';
  blocker.style.zIndex = '999999';
  blocker.style.fontSize = '24px';
  blocker.innerHTML = 'Developer Tools detected. Please close them to continue.';
  document.body.appendChild(blocker);
  
  // Force page reload after a delay
  setTimeout(() => window.location.reload(), 3000);
}

// Multiple detection techniques
export function initializeGlobalSecurity() {
  // Method 1: Size detection
  function checkDevToolsSize() {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if ((widthThreshold || heightThreshold) && !devToolsDetected) {
      devToolsDetected = true;
      createBlocker();
    }
  }
  
  // Method 2: Debug properties detection
  function checkDebuggerProperties() {
    let isOpen = false;
    
    // Custom property getter detection
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function() {
        isOpen = true;
        return '';
      }
    });
    
    // Console timing detection
    const start = performance.now();
    console.log(element);
    console.clear();
    const end = performance.now();
    
    // If dev tools are open, console operations take longer
    if (end - start > 100 || isOpen) {
      devToolsDetected = true;
      createBlocker();
    }
  }
  
  // Method 3: Function debugger trick
  function checkFunctionDebugger() {
    function containsDebugger() {
      debugger;
      return false;
    }
    
    // If DevTools are open, this will pause at the debugger statement
    if (containsDebugger()) {
      devToolsDetected = true;
      createBlocker();
    }
  }
  
  // Method 4: Prevent keyboard shortcuts
  function blockKeyboardShortcuts(e: KeyboardEvent) {
    // F12 key
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (
        e.key === 'I' || e.key === 'i' || 
        e.key === 'J' || e.key === 'j' || 
        e.key === 'C' || e.key === 'c' ||
        e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U (View source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }
  }
  
  // Run all detection methods periodically
  setInterval(checkDevToolsSize, 500);
  setInterval(checkDebuggerProperties, 1000);
  setInterval(checkFunctionDebugger, 1500);
  
  // Add keyboard shortcut prevention
  window.addEventListener('keydown', blockKeyboardShortcuts, true);
  
  // Prevent right-click context menu
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, true);
  
  // Override console methods - this tends to trigger in dev tools
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
    clear: console.clear
  };
  
  const handleConsoleCall = function() {
    checkDebuggerProperties();
    return originalConsole.log.apply(console, arguments);
  };
  
  console.log = handleConsoleCall;
  console.warn = handleConsoleCall;
  console.error = handleConsoleCall;
  console.info = handleConsoleCall;
  console.debug = handleConsoleCall;
  
  // Override toString methods to detect dev tools formatting
  const noop = Function.prototype.bind.call(Function.prototype.call, Object.prototype.toString);
  noop.toString = function() {
    checkDebuggerProperties();
    return '';
  };
}
