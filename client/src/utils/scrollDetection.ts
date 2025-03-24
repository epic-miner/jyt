/**
 * Utility to detect when the user is actively scrolling
 * and add an 'is-scrolling' class to the HTML element.
 * This allows us to optimize performance by pausing animations
 * and reducing complexity during scrolling.
 */

let scrollTimer: number | null = null;
const SCROLL_TIMEOUT = 150; // Time in ms to consider scrolling stopped

export const initScrollDetection = (): void => {
  const handleScroll = () => {
    // Add class while scrolling
    document.documentElement.classList.add('is-scrolling');
    
    // Clear the existing timer
    if (scrollTimer !== null) {
      window.clearTimeout(scrollTimer);
      scrollTimer = null;
    }
    
    // Set a timer to remove the class after scrolling stops
    scrollTimer = window.setTimeout(() => {
      document.documentElement.classList.remove('is-scrolling');
      scrollTimer = null;
    }, SCROLL_TIMEOUT);
  };
  
  // Add scroll event listener with passive flag for better performance
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Clean up when component unmounts
  return () => {
    window.removeEventListener('scroll', handleScroll);
    if (scrollTimer !== null) {
      window.clearTimeout(scrollTimer);
    }
  };
};

export default initScrollDetection;