import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ScrollLazyLoaderProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  onVisible?: () => void;
  withAnimation?: boolean;
  animationDelay?: number;
}

const ScrollLazyLoader: React.FC<ScrollLazyLoaderProps> = ({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '100px',
  onVisible,
  withAnimation = true,
  animationDelay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = ref.current;
    if (!current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          if (withAnimation) {
            // Add a delay if specified before starting animation
            if (animationDelay > 0) {
              setTimeout(() => {
                setIsAnimated(true);
              }, animationDelay);
            } else {
              setIsAnimated(true);
            }
          }

          if (onVisible) {
            onVisible();
          }

          // Unobserve after becoming visible
          observer.unobserve(current);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(current);

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [threshold, rootMargin, onVisible, withAnimation, animationDelay]);

  // YouTube-like reveal animation classes
  const animationClass = withAnimation
    ? cn(
        'transition-all duration-700',
        !isAnimated && 'opacity-0 translate-y-8',
        isAnimated && 'opacity-100 translate-y-0'
      )
    : '';

  return (
    <div
      ref={ref}
      className={cn(animationClass, className)}
    >
      {isVisible ? children : <div style={{ height: '100px' }} className="animate-pulse bg-gray-800/20 rounded-lg" />}
    </div>
  );
};

export default ScrollLazyLoader;