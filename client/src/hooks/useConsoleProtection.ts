
import { useEffect } from 'react';
import { isDevToolsOpen, monitorDevTools } from '../lib/devToolsDetection';
import { 
  isBraveBrowser, 
  detectBraveDevTools, 
  installBraveKeyboardProtection,
  createBraveBlocker
} from '../lib/braveProtection';

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
      
      // Setup Brave-specific checks
      const braveInterval = setInterval(() => {
        if (detectBraveDevTools()) {
          handleDevToolsDetected();
        }
      }, 1000);
      
      cleanupFunctions.push(() => {
        clearInterval(braveInterval);
      });
    }
    
    // Setup special detection techniques
    setupIframeDetector();
    
    // Check immediately when page loads with standard method
    if (isDevToolsOpen()) {
      handleDevToolsDetected();
    }
    
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
