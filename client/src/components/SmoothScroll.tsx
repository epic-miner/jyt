import React, { ReactNode, useEffect, useState } from 'react';

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

  // Detect if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Check on resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    const targetElement = document.getElementById(to);
    
    if (!targetElement) {
      console.warn(`Element with id "${to}" not found`);
      return;
    }
    
    // Calculate appropriate offset based on device
    const totalOffset = isMobile ? offset + mobileOffset : offset;
    
    // Use native smooth scrolling on modern mobile browsers that support it well
    if (isMobile && 'scrollBehavior' in document.documentElement.style) {
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - totalOffset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      return;
    }
    
    // For older browsers or desktop, use our custom animation
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - totalOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;
    
    // Adjust duration for mobile devices for a faster feel
    const adjustedDuration = isMobile ? duration * 0.8 : duration;
    
    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / adjustedDuration, 1);
      
      // Different easing for mobile vs desktop for better feel
      const ease = isMobile ? easeOutQuint(progress) : easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition + distance * ease);
      
      if (timeElapsed < adjustedDuration) {
        requestAnimationFrame(animation);
      }
    };
    
    // Easing function for smooth acceleration and deceleration
    const easeInOutCubic = (t: number) => {
      return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    // Quicker easing for mobile - feels more responsive
    const easeOutQuint = (t: number) => {
      return 1 - Math.pow(1 - t, 5);
    };
    
    requestAnimationFrame(animation);
  };
  
  return (
    <a 
      href={`#${to}`} 
      onClick={handleClick} 
      className={className}
      aria-label={`Scroll to ${to} section`}
    >
      {children}
    </a>
  );
};

export default SmoothScroll;