
import { useEffect } from 'react';
import { isDevToolsOpen, monitorDevTools } from '../lib/devToolsDetection';
import { 
  isBraveBrowser, 
  detectBraveDevTools,
  installBraveKeyboardProtection,
  createBraveBlocker
} from '../lib/braveProtection';
import { installDebuggerProtection, checkForDebuggerEvasion } from '../lib/debuggerProtection';
import { preventContextMenu, preventTextSelection, addDevToolsTraps } from '../lib/contextMenuProtection';

export const useConsoleProtection = () => {
  useEffect(() => {
    let hasRedirected = false;
    let blockerDiv: HTMLDivElement | null = null;
    let iframeDetector: HTMLIFrameElement | null = null;
    let cleanupFunctions: Array<() => void> = [];

    // Redirect to YouTube
    const redirectToYoutube = () => {
      if (!hasRedirected) {
        hasRedirected = true;
        window.location.href = 'https://www.youtube.com';
      }
    };

    const createBlocker = () => {
      if (!blockerDiv) {
        // Use Brave-specific blocker if in Brave browser
        if (isBraveBrowser()) {
          blockerDiv = createBraveBlocker(redirectToYoutube);
        } else {
          // Standard blocker for other browsers
          blockerDiv = document.createElement('div');
          blockerDiv.style.position = 'fixed';
          blockerDiv.style.top = '0';
          blockerDiv.style.left = '0';
          blockerDiv.style.width = '100%';
          blockerDiv.style.height = '100%';
          blockerDiv.style.backgroundColor = 'black';
          blockerDiv.style.zIndex = '999999';
          blockerDiv.style.display = 'flex';
          blockerDiv.style.flexDirection = 'column';
          blockerDiv.style.alignItems = 'center';
          blockerDiv.style.justifyContent = 'center';
          blockerDiv.style.color = 'white';
          blockerDiv.style.fontSize = '20px';
          blockerDiv.style.textAlign = 'center';
          blockerDiv.style.padding = '20px';
          
          const message = document.createElement('div');
          message.textContent = 'Website access restricted - Developer tools detected';
          blockerDiv.appendChild(message);
          
          const subMessage = document.createElement('div');
          subMessage.textContent = 'For security reasons, this site cannot be accessed with developer tools open';
          subMessage.style.fontSize = '16px';
          subMessage.style.marginTop = '10px';
          subMessage.style.color = '#999';
          blockerDiv.appendChild(subMessage);
          
          const redirectMessage = document.createElement('div');
          redirectMessage.textContent = 'Redirecting...';
          redirectMessage.style.fontSize = '14px';
          redirectMessage.style.marginTop = '20px';
          redirectMessage.style.color = '#666';
          blockerDiv.appendChild(redirectMessage);
          
          document.body.appendChild(blockerDiv);
          
          // Redirect after showing message
          setTimeout(redirectToYoutube, 2500);
        }
      }
    };

    const removeBlocker = () => {
      if (blockerDiv && document.body.contains(blockerDiv)) {
        document.body.removeChild(blockerDiv);
        blockerDiv = null;
      }
    };

    const handleDevToolsDetected = () => {
      createBlocker();
    };
    
    // This is a special Brave browser detection that uses an iframe technique
    const setupIframeDetector = () => {
      try {
        if (!iframeDetector) {
          // Create a hidden iframe
          iframeDetector = document.createElement('iframe');
          iframeDetector.style.display = 'none';
          document.body.appendChild(iframeDetector);
          
          if (iframeDetector.contentWindow) {
            // Access iframe's window object and set up detection
            const iframeWindow = iframeDetector.contentWindow;
            
            // Set up listener in the iframe
            const script = iframeWindow.document.createElement('script');
            script.textContent = `
              (function() {
                let devtools = false;
                
                // Create a special object with getter
                const div = document.createElement('div');
                Object.defineProperty(div, 'id', {
                  get: function() {
                    devtools = true;
                    return 'id';
                  }
                });
                
                // Check by calling console methods
                const checkDevTools = function() {
                  console.log(div);
                  console.clear();
                  
                  if (devtools) {
                    window.parent.postMessage('devtools-detected', '*');
                  }
                  setTimeout(checkDevTools, 1000);
                };
                
                checkDevTools();
              })();
            `;
            
            iframeWindow.document.body.appendChild(script);
          }
          
          // Message handler
          const messageHandler = (event: MessageEvent) => {
            if (event.data === 'devtools-detected') {
              handleDevToolsDetected();
            }
          };
          
          // Listen for messages from the iframe
          window.addEventListener('message', messageHandler);
          
          // Add cleanup function
          cleanupFunctions.push(() => {
            window.removeEventListener('message', messageHandler);
          });
        }
      } catch (e) {
        // Ignore errors
      }
    };

    // Check for Brave browser and apply special protection
    if (isBraveBrowser()) {
      console.log('Brave browser detected, applying special protection measures');
      
      // Apply Brave-specific keyboard protection
      const keyboardCleanup = installBraveKeyboardProtection();
      cleanupFunctions.push(keyboardCleanup);
      
      // Check immediately for Brave developer tools
      if (detectBraveDevTools()) {
        handleDevToolsDetected();
      }
      
      // Setup Brave-specific checks with progressive intervals
      let checkCount = 0;
      const maxChecks = 100; // Limit the number of aggressive checks
      
      // Start with frequent checks, then reduce frequency
      const braveInterval = setInterval(() => {
        if (detectBraveDevTools()) {
          handleDevToolsDetected();
          return;
        }
        
        // After a certain number of checks, reduce the frequency
        checkCount++;
        if (checkCount >= maxChecks) {
          clearInterval(braveInterval);
          
          // Switch to a less frequent interval for ongoing monitoring
          const longTermInterval = setInterval(() => {
            if (detectBraveDevTools()) {
              handleDevToolsDetected();
            }
          }, 2000);
          
          cleanupFunctions.push(() => {
            clearInterval(longTermInterval);
          });
        }
      }, 500); // Start with more frequent checks
      
      cleanupFunctions.push(() => {
        clearInterval(braveInterval);
      });
    }
    
    // Setup special detection techniques
    setupIframeDetector();
    
    // Install anti-debugger dodging protection
    const debuggerProtectionCleanup = installDebuggerProtection();
    cleanupFunctions.push(debuggerProtectionCleanup);
    
    // Check for debugger evasion techniques
    if (checkForDebuggerEvasion()) {
      console.log("Debugger evasion detected!");
      handleDevToolsDetected();
    }
    
    // Periodically check for debugger evasion
    const evasionCheckInterval = setInterval(() => {
      if (checkForDebuggerEvasion()) {
        handleDevToolsDetected();
        clearInterval(evasionCheckInterval);
      }
    }, 3000);
    cleanupFunctions.push(() => clearInterval(evasionCheckInterval));
    
    // Check immediately when page loads with standard method
    if (isDevToolsOpen()) {
      handleDevToolsDetected();
    }
    
    // Add context menu and right-click protection
    const contextMenuCleanup = preventContextMenu();
    cleanupFunctions.push(contextMenuCleanup);
    
    // Add text selection prevention to protect against inspecting content
    const textSelectionCleanup = preventTextSelection();
    cleanupFunctions.push(textSelectionCleanup);
    
    // Add hidden dev tools traps
    const trapsCleanup = addDevToolsTraps();
    cleanupFunctions.push(trapsCleanup);
    
    // Listen for trap events
    const trapHandler = (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.method) {
        console.log('Trap triggered:', e.detail.method);
        handleDevToolsDetected();
      }
    };
    document.addEventListener('devtools-detected', trapHandler);
    cleanupFunctions.push(() => {
      document.removeEventListener('devtools-detected', trapHandler);
    });
    
    // Add the continuous monitoring for all browsers
    const cleanupStandardMonitoring = monitorDevTools(handleDevToolsDetected);
    cleanupFunctions.push(cleanupStandardMonitoring);

    // Ensure we clean up properly
    return () => {
      // Run all cleanup functions
      cleanupFunctions.forEach(cleanup => cleanup());
      
      // Remove DOM elements
      removeBlocker();
      if (iframeDetector && document.body.contains(iframeDetector)) {
        document.body.removeChild(iframeDetector);
      }
    };
  }, []);
};
