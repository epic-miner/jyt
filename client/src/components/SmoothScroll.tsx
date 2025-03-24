import React, { useState, useEffect, ReactNode } from 'react';
import { cn } from '../utils/cn';

interface SmoothScrollProps {
  to: string; // ID of the element to scroll to
  duration?: number; // Duration of scroll animation in milliseconds
  offset?: number; // Offset from the top in pixels
  mobileOffset?: number; // Additional offset for mobile devices
  children: ReactNode;
  className?: string;
}

const SmoothScroll: React.FC<SmoothScrollProps> = ({
  to,
  duration = 800,
  offset = 0,
  mobileOffset = 20, // Mobile devices often need additional offset due to headers/UI elements
  children,
  className = '',
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if the device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    const targetElement = document.getElementById(to.replace('#', ''));

    if (!targetElement) return;

    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const finalOffset = isMobile ? offset + mobileOffset : offset;
    const distance = targetPosition - startPosition - finalOffset;

    let startTime: number | null = null;

    // Cubic easing function for a YouTube-like feel
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
        // Update URL hash after scrolling (optional)
        window.history.pushState(null, '', `#${to.replace('#', '')}`);
      }
    };

    requestAnimationFrame(animation);
  };

  return (
    <a 
      href={`#${to.replace('#', '')}`} 
      onClick={handleClick}
      className={cn('cursor-pointer transition-colors duration-200', className)}
    >
      {children}
    </a>
  );
};

export default SmoothScroll;