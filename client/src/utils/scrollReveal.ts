
/**
 * YouTube-like scroll reveal animations
 * This utility adds animation to elements as they scroll into view
 */

interface ScrollRevealOptions {
  threshold?: number; // How much of the element needs to be visible (0-1)
  rootMargin?: string; // Margin around the root
  delay?: number; // Delay before animation in ms
  once?: boolean; // Whether to only animate once
}

export const initScrollReveal = (
  selector: string = '.scroll-reveal',
  options: ScrollRevealOptions = {}
): () => void => {
  const {
    threshold = 0.15,
    rootMargin = '0px',
    delay = 0,
    once = false
  } = options;

  // Create the intersection observer instance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // If element is in view
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        
        // Add delay if specified
        if (delay > 0) {
          setTimeout(() => {
            element.classList.add('visible');
          }, delay);
        } else {
          element.classList.add('visible');
        }
        
        // Stop observing if once option is true
        if (once) {
          observer.unobserve(element);
        }
      } else if (!once) {
        // Remove visible class if scrolled out of view and not once
        const element = entry.target as HTMLElement;
        element.classList.remove('visible');
      }
    });
  }, {
    root: null, // Use viewport as root
    rootMargin,
    threshold
  });
  
  // Get all elements that match the selector
  const elements = document.querySelectorAll(selector);
  
  // Start observing all elements
  elements.forEach((element) => {
    observer.observe(element);
  });
  
  // Return a cleanup function
  return () => {
    elements.forEach((element) => {
      observer.unobserve(element);
    });
  };
};

export default initScrollReveal;
