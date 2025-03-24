/**
 * This module provides protection against right-click context menu access
 * which could expose developer options or source code viewing
 */

// Prevent right-click context menu
export const preventContextMenu = (): (() => void) => {
  // Function to handle and prevent right clicks
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Function to handle F12 key or other special keys
  const handleKeyPress = (e: KeyboardEvent) => {
    // F12 key
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I or Command+Option+I (Mac)
    if ((e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i'))) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+J or Command+Option+J (Mac)
    if ((e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) ||
        (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j'))) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+C or Command+Option+C (Mac)
    if ((e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) ||
        (e.metaKey && e.altKey && (e.key === 'C' || e.key === 'c'))) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      return false;
    }
  };

  // Add event listeners
  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('keydown', handleKeyPress);

  // Return a cleanup function
  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('keydown', handleKeyPress);
  };
};

// Prevents selection of text which could be inspected
export const preventTextSelection = (): (() => void) => {
  // Check if user-select CSS property is supported
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    * {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    input, textarea {
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }
  `;
  document.head.appendChild(style);

  // Prevent selection via mouse events
  const preventSelection = (e: Event) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      // Allow selection in input fields
      return true;
    }
    // Prevent default for all other elements
    e.preventDefault();
    return false;
  };

  // Add event listeners for mouse selections
  document.addEventListener('selectstart', preventSelection);
  document.addEventListener('mousedown', preventSelection);

  // Return a cleanup function
  return () => {
    document.removeEventListener('selectstart', preventSelection);
    document.removeEventListener('mousedown', preventSelection);
    if (document.head.contains(style)) {
      document.head.removeChild(style);
    }
  };
};

// Adds hidden traps for dev tools
export const addDevToolsTraps = (): (() => void) => {
  // Create hidden elements with traps
  const trapDiv = document.createElement('div');
  trapDiv.style.display = 'none';
  trapDiv.className = 'dev-tools-trap';
  
  // Add tricky properties that will trigger when inspected
  Object.defineProperty(trapDiv, 'id', {
    get: function() {
      // This could be used to detect when devtools is inspecting the element
      // We can then send a signal or take action
      const event = new CustomEvent('devtools-detected', { detail: { method: 'property-trap' } });
      document.dispatchEvent(event);
      return 'dev-tools-trap';
    }
  });
  
  document.body.appendChild(trapDiv);
  
  // Listen for our custom event
  const handleTrapTriggered = (e: Event) => {
    if (e instanceof CustomEvent) {
      console.log('Dev tools trap triggered:', e.detail);
      // Here we could redirect or take other action
    }
  };
  
  document.addEventListener('devtools-detected', handleTrapTriggered);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('devtools-detected', handleTrapTriggered);
    if (document.body.contains(trapDiv)) {
      document.body.removeChild(trapDiv);
    }
  };
};