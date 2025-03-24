
import { useEffect } from 'react';

export const useConsoleProtection = () => {
  useEffect(() => {
    const threshold = 160;
    let isDevToolsOpen = false;
    let blockerDiv: HTMLDivElement | null = null;
    let reloadCount = 0;

    const createBlocker = () => {
      if (!blockerDiv) {
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
        
        const warningText = document.createElement('div');
        warningText.textContent = 'Website access restricted - Developer tools detected';
        warningText.style.marginBottom = '20px';
        
        const reloadButton = document.createElement('button');
        reloadButton.textContent = 'Close DevTools and Reload Page';
        reloadButton.style.padding = '10px 20px';
        reloadButton.style.backgroundColor = '#ff0000';
        reloadButton.style.border = 'none';
        reloadButton.style.borderRadius = '5px';
        reloadButton.style.color = 'white';
        reloadButton.style.cursor = 'pointer';
        reloadButton.style.fontSize = '16px';
        reloadButton.onclick = () => {
          window.location.reload();
        };
        
        blockerDiv.appendChild(warningText);
        blockerDiv.appendChild(reloadButton);
        
        document.body.appendChild(blockerDiv);
      }
    };

    const removeBlocker = () => {
      if (blockerDiv) {
        document.body.removeChild(blockerDiv);
        blockerDiv = null;
      }
    };

    // Check if debugger is attached (blocks website immediately)
    const debuggerCheck = () => {
      let startTime = performance.now();
      
      function debuggerTrigger() {
        if (performance.now() - startTime > 100) {
          // Debugger was triggered and paused execution
          createBlocker();
          isDevToolsOpen = true;
        }
      }
      
      // Include multiple detection methods
      startTime = performance.now();
      debugger; // This will pause if dev tools is open
      debuggerTrigger();
    };

    // Multiple methods of dev tools detection
    const checkDevTools = () => {
      // Method 1: Size difference detection (most reliable for side panel dev tools)
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      // Method 2: Check for dev tools objects in Firefox
      const firefoxDevTools = 
        //@ts-ignore
        window.devtools?.open || 
        //@ts-ignore
        window.Firebug?.chrome?.isInitialized;
      
      // Method 3: Check console timing
      let isConsoleOpen = false;
      const checkConsole = () => {
        const before = performance.now();
        console.log("🔒"); // This special character can be changed to anything
        console.clear(); // Clear the console to hide our check
        const after = performance.now();
        const diff = after - before;
        return diff > 20; // Threshold in milliseconds, adjust if needed
      };
      
      // Close page functionality for persistent dev tools
      const forceReload = () => {
        reloadCount++;
        if (reloadCount > 3) {
          // If multiple reloads didn't help, use more drastic measures
          window.open('about:blank', '_self');
          window.close();
        } else {
          setTimeout(() => window.location.reload(), 500);
        }
      };
      
      // Combine detection methods
      if (
        widthThreshold || 
        heightThreshold || 
        firefoxDevTools || 
        checkConsole()
      ) {
        if (!isDevToolsOpen) {
          isDevToolsOpen = true;
          createBlocker();
        }
      } else {
        isDevToolsOpen = false;
        removeBlocker();
      }
    };

    // Run initial check for already open dev tools
    checkDevTools();
    debuggerCheck();
    
    // Continue monitoring
    window.addEventListener('resize', checkDevTools);
    const intervalId = setInterval(checkDevTools, 1000);

    return () => {
      window.removeEventListener('resize', checkDevTools);
      clearInterval(intervalId);
      removeBlocker();
    };
  }, []);
};
