import React, { ReactNode } from 'react';

interface SmoothScrollProps {
  to: string; // ID of the element to scroll to
  duration?: number; // Duration of scroll animation in milliseconds
  offset?: number; // Offset from the top in pixels
  children: ReactNode;
  className?: string;
}

const SmoothScroll: React.FC<SmoothScrollProps> = ({
  to,
  duration = 800,
  offset = 0,
  children,
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    const targetElement = document.getElementById(to);
    
    if (!targetElement) {
      console.warn(`Element with id "${to}" not found`);
      return;
    }
    
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;
    
    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition + distance * ease);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };
    
    // Easing function for smooth acceleration and deceleration
    const easeInOutCubic = (t: number) => {
      return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    requestAnimationFrame(animation);
  };
  
  return (
    <a href={`#${to}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export default SmoothScroll;