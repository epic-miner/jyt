
import { useEffect } from 'react';
import { isDevToolsOpen, monitorDevTools } from '../lib/devToolsDetection';

export const useConsoleProtection = () => {
  useEffect(() => {
    let hasRedirected = false;
    let blockerDiv: HTMLDivElement | null = null;

    // Redirect to YouTube
    const redirectToYoutube = () => {
      if (!hasRedirected) {
        hasRedirected = true;
        window.location.href = 'https://www.youtube.com';
      }
    };

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

    // Check immediately when page loads
    if (isDevToolsOpen()) {
      handleDevToolsDetected();
    }
    
    // Add the continuous monitoring
    const cleanupMonitoring = monitorDevTools(handleDevToolsDetected);

    // Ensure we clean up properly
    return () => {
      cleanupMonitoring();
      removeBlocker();
    };
  }, []);
};
