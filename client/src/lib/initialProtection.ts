/**
 * This module is designed to be the first line of defense against developer tools,
 * running checks as early as possible during page load
 */

// Run this as early as possible, even before React mounts
export const runEarlyDetection = () => {
  try {
    // Size detection method - quick and early
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    
    if (widthDiff > 200 || heightDiff > 200) {
      redirectToYoutube();
      return true;
    }
    
    // Second check - console timing
    const startTime = performance.now();
    console.log('%c ', 'padding: 1px; background: #fff; color: #fff');
    console.clear();
    const endTime = performance.now();
    
    // If console operations are slow, dev tools might be open
    if (endTime - startTime > 100) {
      redirectToYoutube();
      return true;
    }
    
    // Third check - debugger statement
    // This will pause execution if dev tools are open
    try {
      debugger;
      // If we've moved past the debugger without pausing, it might 
      // indicate that someone disabled debugger statements
    } catch (e) {
      // Ignore errors
    }
    
    return false;
  } catch (e) {
    // Default to safe behavior - don't block in case of error
    return false;
  }
};

// Display immediate warning and redirect
const redirectToYoutube = () => {
  // Block the entire page
  const blockerDiv = document.createElement('div');
  blockerDiv.style.position = 'fixed';
  blockerDiv.style.top = '0';
  blockerDiv.style.left = '0';
  blockerDiv.style.width = '100%';
  blockerDiv.style.height = '100%';
  blockerDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
  blockerDiv.style.zIndex = '2147483647'; // Max possible z-index
  blockerDiv.style.color = 'red';
  blockerDiv.style.fontSize = '22px';
  blockerDiv.style.fontFamily = 'Arial, sans-serif';
  blockerDiv.style.textAlign = 'center';
  blockerDiv.style.display = 'flex';
  blockerDiv.style.flexDirection = 'column';
  blockerDiv.style.alignItems = 'center';
  blockerDiv.style.justifyContent = 'center';
  blockerDiv.style.padding = '20px';
  
  // Warning icon
  const warningIcon = document.createElement('div');
  warningIcon.textContent = '⚠️';
  warningIcon.style.fontSize = '50px';
  warningIcon.style.marginBottom = '20px';
  blockerDiv.appendChild(warningIcon);
  
  // Main warning text
  const warningText = document.createElement('div');
  warningText.textContent = 'Access Denied - Developer Tools Detected';
  warningText.style.fontWeight = 'bold';
  warningText.style.marginBottom = '15px';
  blockerDiv.appendChild(warningText);
  
  // Explanation
  const explanation = document.createElement('div');
  explanation.textContent = 'This content is not accessible with developer tools open.';
  explanation.style.fontSize = '16px';
  explanation.style.marginBottom = '30px';
  explanation.style.color = '#ff8080';
  blockerDiv.appendChild(explanation);
  
  // Redirect message
  const redirectMessage = document.createElement('div');
  redirectMessage.textContent = 'Redirecting...';
  redirectMessage.style.fontSize = '14px'; 
  redirectMessage.style.color = '#aaa';
  blockerDiv.appendChild(redirectMessage);
  
  // Add to body if it exists, otherwise wait for it
  if (document.body) {
    document.body.appendChild(blockerDiv);
  } else {
    // If body doesn't exist yet, wait for it
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(blockerDiv);
    });
  }
  
  // Redirect after a short delay
  setTimeout(() => {
    window.location.href = 'https://www.youtube.com';
  }, 2000);
};

// Self-executing code that runs immediately when this module is imported
(() => {
  // Run detection immediately
  runEarlyDetection();
  
  // Also run it when the DOM is ready (in case it's imported before DOM is loaded)
  document.addEventListener('DOMContentLoaded', runEarlyDetection);
})();