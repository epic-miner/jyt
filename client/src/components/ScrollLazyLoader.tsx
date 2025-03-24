import { ReactNode, useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

// Detect if we're on a mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );
};

interface ScrollLazyLoaderProps {
  children: ReactNode;
  className?: string;
  placeholderClassName?: string;
  height?: number | string;
  placeholder?: ReactNode;
  rootMargin?: string; // IntersectionObserver rootMargin
  threshold?: number; // IntersectionObserver threshold
  enabled?: boolean; // Allow disabling
  fallbackHeight?: number | string; // Height to use if children are not visible
}

/**
 * ScrollLazyLoader - Defers rendering of children until they're near the viewport
 * Helps improve scrolling performance by rendering only what's needed
 */
const ScrollLazyLoader = memo(({
  children,
  className,
  placeholderClassName,
  height,
  placeholder,
  rootMargin = '200px 0px',
  threshold = 0.1,
  enabled = true,
  fallbackHeight = 'auto'
}: ScrollLazyLoaderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    // If disabled or already visible, no need to observe
    if (!enabled || isVisible) return;

    const currentRef = ref.current;
    if (!currentRef) return;

    // Configure observer with more aggressive loading on desktop
    // and more conservative loading on mobile
    const observerOptions = {
      rootMargin: isMobile ? '100px 0px' : rootMargin,
      threshold: isMobile ? Math.min(0.05, threshold) : threshold
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Stop observing once visible
        observer.disconnect();
      }
    }, observerOptions);

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [enabled, isVisible, rootMargin, threshold, isMobile]);

  // If component is disabled, render children immediately
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        height: isVisible ? height : fallbackHeight,
        minHeight: isVisible ? undefined : fallbackHeight
      }}
    >
      {isVisible ? (
        children
      ) : (
        placeholder || (
          <div 
            className={cn(
              "w-full h-full bg-dark-800/60 animate-pulse rounded-md",
              placeholderClassName
            )}
            style={{ height: fallbackHeight }}
          />
        )
      )}
    </div>
  );
});

ScrollLazyLoader.displayName = 'ScrollLazyLoader';

export default ScrollLazyLoader;