/**
 * Utility to handle smooth scrolling for anchor links.
 * This adds click event listeners to anchor links that point to sections
 * within the same page, and smoothly scrolls to them.
 */

export const initSmoothScrollLinks = (): void => {
  // Add event listener to handle anchor link clicks
  document.addEventListener('click', (event) => {
    // Check if the click target is an anchor link
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (!anchor) return;
    
    // Check if the link is an internal anchor link (starts with #)
    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    
    // Handle empty hash separately (scroll to top)
    if (href === '#') {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    
    // Find the target element
    const targetElement = document.querySelector(href);
    if (!targetElement) return;
    
    // Prevent default behavior and scroll smoothly
    event.preventDefault();
    
    // Scroll to the element
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    
    // Update URL without scroll (optional)
    // window.history.pushState(null, '', href);
  });
};

export default initSmoothScrollLinks;