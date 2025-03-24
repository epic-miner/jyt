
/**
 * Comprehensive scroll management utility
 * Handles smooth scrolling, scroll optimization, and scroll-based animations
 */

// Constants
const SCROLL_TIMEOUT = 150; // Time in ms to consider scrolling stopped
const SCROLL_DISTANCE_THRESHOLD = 100; // Minimum scroll distance to trigger events
const SCROLL_UP_CLASS = 'scrolling-up';
const SCROLL_DOWN_CLASS = 'scrolling-down';
const IS_SCROLLING_CLASS = 'is-scrolling';
const SCROLL_TOP_THRESHOLD = 100; // When to apply special styles for top of page

// State
let lastScrollY = 0;
let scrollTimer: number | null = null;
let scrollDirection: 'up' | 'down' | null = null;
let ticking = false;
let isScrollListenerActive = false;

/**
 * Initialize scroll detection and management
 */
export const initScrollManager = (): () => void => {
  if (isScrollListenerActive) {
    return () => {}; // Already initialized
  }

  isScrollListenerActive = true;
  lastScrollY = window.scrollY;

  const handleScroll = () => {
    if (!ticking) {
      // Use requestAnimationFrame for performance
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const documentElement = document.documentElement;
        
        // Add scrolling class
        documentElement.classList.add(IS_SCROLLING_CLASS);
        
        // Determine scroll direction if moved significantly
        if (Math.abs(currentScrollY - lastScrollY) > SCROLL_DISTANCE_THRESHOLD) {
          // Update direction classes
          if (currentScrollY > lastScrollY) {
            // Scrolling down
            if (scrollDirection !== 'down') {
              documentElement.classList.remove(SCROLL_UP_CLASS);
              documentElement.classList.add(SCROLL_DOWN_CLASS);
              scrollDirection = 'down';
            }
          } else {
            // Scrolling up
            if (scrollDirection !== 'up') {
              documentElement.classList.remove(SCROLL_DOWN_CLASS);
              documentElement.classList.add(SCROLL_UP_CLASS);
              scrollDirection = 'up';
            }
          }
        }
        
        // Set special class for top of page
        if (currentScrollY < SCROLL_TOP_THRESHOLD) {
          documentElement.classList.add('at-top');
        } else {
          documentElement.classList.remove('at-top');
        }
        
        // Update last scroll position
        lastScrollY = currentScrollY;
        ticking = false;
      });
      
      ticking = true;
    }
    
    // Clear the existing timer
    if (scrollTimer !== null) {
      window.clearTimeout(scrollTimer);
      scrollTimer = null;
    }
    
    // Set a timer to remove the scrolling class after scrolling stops
    scrollTimer = window.setTimeout(() => {
      document.documentElement.classList.remove(IS_SCROLLING_CLASS);
      scrollTimer = null;
    }, SCROLL_TIMEOUT);
  };
  
  // Add scroll event listener with passive flag for better performance
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Initial page load check
  handleScroll();
  
  // Clean up function
  return () => {
    window.removeEventListener('scroll', handleScroll);
    if (scrollTimer !== null) {
      window.clearTimeout(scrollTimer);
    }
    isScrollListenerActive = false;
  };
};

/**
 * Smooth scroll to target element with YouTube-like easing
 */
export const smoothScrollTo = (
  target: string | HTMLElement,
  options: {
    duration?: number;
    offset?: number;
    onComplete?: () => void;
  } = {}
): void => {
  const {
    duration = 800,
    offset = 0,
    onComplete = () => {},
  } = options;
  
  const targetElement = typeof target === 'string'
    ? document.querySelector(target)
    : target;
  
  if (!targetElement) {
    console.warn(`Target element not found: ${target}`);
    return;
  }
  
  // Get positions
  const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  
  let startTime: number | null = null;
  
  // YouTube-like cubic easing function
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  
  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easeProgress = easeOutCubic(progress);
    
    window.scrollTo(0, startPosition + distance * easeProgress);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      // Update URL hash after scrolling if it's an ID
      if (typeof target === 'string' && target.startsWith('#')) {
        window.history.pushState(null, '', target);
      }
      
      // Call complete callback
      onComplete();
    }
  };
  
  requestAnimationFrame(animation);
};

/**
 * Scroll to top with smooth animation
 */
export const scrollToTop = (duration = 800): void => {
  const startPosition = window.scrollY;
  if (startPosition === 0) return;
  
  let startTime: number | null = null;
  
  // YouTube-like cubic easing function for smooth deceleration
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  
  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easeProgress = easeOutCubic(progress);
    
    window.scrollTo(0, startPosition * (1 - easeProgress));
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };
  
  requestAnimationFrame(animation);
};

/**
 * Setup all scroll-related behaviors
 */
export const setupScrollBehaviors = (): () => void => {
  // Init scroll manager
  const cleanupScrollManager = initScrollManager();
  
  // Handle anchor links
  const handleLinkClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (!anchor) return;
    
    // Check if the link is an internal anchor link
    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    
    // Handle empty hash separately (scroll to top)
    if (href === '#') {
      event.preventDefault();
      scrollToTop();
      return;
    }
    
    // Prevent default behavior and scroll smoothly
    event.preventDefault();
    
    // Calculate offset based on viewport width (mobile vs desktop)
    const offset = window.innerWidth < 768 ? 80 : 60;
    
    // Smooth scroll to target
    smoothScrollTo(href, { offset });
  };
  
  // Add link click listener
  document.addEventListener('click', handleLinkClick);
  
  // Optimize page load scroll behavior
  if (window.location.hash) {
    // If page is loaded with a hash, scroll to it smoothly after a small delay
    setTimeout(() => {
      smoothScrollTo(window.location.hash, {
        offset: window.innerWidth < 768 ? 80 : 60,
      });
    }, 100);
  }
  
  // Clean up function
  return () => {
    cleanupScrollManager();
    document.removeEventListener('click', handleLinkClick);
  };
};

export default setupScrollBehaviors;
