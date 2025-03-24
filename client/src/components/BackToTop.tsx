import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackToTopProps {
  showAfterScrollY?: number;
  className?: string;
}

/**
 * A back to top button that appears after scrolling down a certain amount
 * Smoothly scrolls to the top when clicked
 */
const BackToTop = ({
  showAfterScrollY = 400,
  className = ''
}: BackToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Add scroll listener to check scroll position
    const checkScroll = () => {
      if (!isVisible && window.scrollY > showAfterScrollY) {
        setIsVisible(true);
      } else if (isVisible && window.scrollY <= showAfterScrollY) {
        setIsVisible(false);
      }
    };

    // Add event listener with passive flag for better performance
    window.addEventListener('scroll', checkScroll, { passive: true });
    
    // Check initial position
    checkScroll();
    
    // Clean up listener
    return () => window.removeEventListener('scroll', checkScroll);
  }, [isVisible, showAfterScrollY]);

  const handleClick = () => {
    // Scroll to top with smooth animation
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          onClick={handleClick}
          aria-label="Back to top"
          className={`fixed z-50 bottom-5 right-5 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 back-to-top-btn ${className}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 10l7-7m0 0l7 7m-7-7v18" 
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;