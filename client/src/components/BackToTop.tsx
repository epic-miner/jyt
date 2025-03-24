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
import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';

interface BackToTopProps {
  showAtHeight?: number;
  className?: string;
}

const BackToTop: React.FC<BackToTopProps> = ({
  showAtHeight = 300,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkScrollPosition = () => {
      setIsVisible(window.scrollY > showAtHeight);
    };
    
    // Initial check
    checkScrollPosition();
    
    // Use passive listener for performance
    window.addEventListener('scroll', checkScrollPosition, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, [showAtHeight]);
  
  const scrollToTop = () => {
    // Get the current scroll position
    const startPosition = window.scrollY;
    const duration = 800; // ms
    let startTime: number | null = null;
    
    // Custom easing function similar to YouTube
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
  
  if (!isVisible) return null;
  
  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'back-to-top-btn fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground',
        'shadow-lg opacity-0 transition-all duration-300',
        'flex items-center justify-center',
        isVisible ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-10',
        className
      )}
      aria-label="Back to top"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  );
};

export default BackToTop;
