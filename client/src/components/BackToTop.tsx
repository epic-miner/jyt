
import { useState, useEffect } from 'react';
import { cn } from "../lib/utils";

interface BackToTopProps {
  showAfterScrollY?: number;
  className?: string;
}

/**
 * A back to top button that appears after scrolling down a certain amount
 * Smoothly scrolls to the top when clicked with YouTube-like smoothness
 */
const BackToTop = ({
  showAfterScrollY = 400,
  className = ''
}: BackToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkScrollPosition = () => {
      setIsVisible(window.scrollY > showAfterScrollY);
    };

    // Initial check
    checkScrollPosition();

    // Use passive listener for performance
    window.addEventListener('scroll', checkScrollPosition, { passive: true });

    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, [showAfterScrollY]);

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
      style={{ touchAction: 'manipulation' }} // Improves touch response
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  );
};

export default BackToTop;
