import { useEffect, useRef, useState, ReactNode } from 'react';
import { isMobileDevice, getScrollOptimizationSettings } from '../utils/deviceDetection';

interface ScrollLazyLoaderProps {
  children: ReactNode;
  loadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
  className?: string;
  loadingIndicator?: ReactNode;
  endMessage?: ReactNode;
  scrollThrottleMs?: number;
  useSmartLoading?: boolean;
}

/**
 * A performance-optimized infinite scroll component
 * Detects device capabilities and adjusts loading behavior accordingly
 */
export const ScrollLazyLoader = ({
  children,
  loadMore,
  hasMore,
  loading,
  threshold = 200,
  className = '',
  loadingIndicator,
  endMessage,
  scrollThrottleMs,
  useSmartLoading = true
}: ScrollLazyLoaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastScrollTop = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Get scroll optimization settings for the device
  const [scrollSettings, setScrollSettings] = useState({
    throttleScroll: false,
    debounceDelay: 100,
    lazyLoadDistance: 300
  });
  
  // Initialize device-specific settings
  useEffect(() => {
    setIsMobile(isMobileDevice());
    
    if (useSmartLoading) {
      const settings = getScrollOptimizationSettings();
      setScrollSettings({
        throttleScroll: settings.throttleScroll,
        debounceDelay: settings.debounceDelay,
        lazyLoadDistance: settings.lazyLoadDistance
      });
    }
  }, [useSmartLoading]);
  
  // Throttle function for scroll events
  const throttle = (callback: Function, delay: number) => {
    let lastCall = 0;
    return function() {
      const now = new Date().getTime();
      if (now - lastCall < delay) {
        return;
      }
      lastCall = now;
      callback();
    };
  };
  
  // Check if we need to load more content
  const checkLoadMore = () => {
    if (!containerRef.current || loading || !hasMore) return;
    
    // Get scroll position and element height
    const { scrollTop, clientHeight, scrollHeight } = 
      containerRef.current === document.documentElement ? 
      document.documentElement : 
      containerRef.current;
    
    // For mobile devices, only load more when scrolling down
    // This improves performance by avoiding unnecessary loads
    if (isMobile) {
      const scrollDown = scrollTop > lastScrollTop.current;
      lastScrollTop.current = scrollTop;
      
      if (!scrollDown) return;
    }
    
    // Adjust threshold based on device capabilities
    const adaptiveThreshold = isMobile ? 
      threshold * 0.7 : // Smaller threshold for mobile to start loading earlier
      threshold;
      
    // Check if we're close to the bottom
    if (scrollHeight - scrollTop - clientHeight <= adaptiveThreshold) {
      loadMore();
    }
  };
  
  // Setup intersection observer as an alternative to scroll events
  // This is more performant, especially on mobile
  useEffect(() => {
    if (!hasMore || loading) return;
    
    // Cleanup existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    const options = {
      root: null,
      rootMargin: `0px 0px ${scrollSettings.lazyLoadDistance}px 0px`,
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        loadMore();
      }
    }, options);
    
    // Find the sentinel element (last child of the container)
    if (containerRef.current) {
      const children = containerRef.current.children;
      if (children.length > 0) {
        const sentinel = children[children.length - 1];
        observer.observe(sentinel);
      }
    }
    
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, children, scrollSettings.lazyLoadDistance]);
  
  // Setup scroll event listener as a fallback
  useEffect(() => {
    // We use window scroll for document scrolling
    const scrollContainer = containerRef.current === document.documentElement ? 
      window : containerRef.current;
    
    if (!scrollContainer) return;
      
    // Apply throttling based on device capabilities
    const handleScroll = scrollSettings.throttleScroll ? 
      throttle(checkLoadMore, scrollThrottleMs || scrollSettings.debounceDelay) : 
      checkLoadMore;
    
    scrollContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [loading, hasMore, threshold, scrollSettings, scrollThrottleMs]);
  
  return (
    <div ref={containerRef} className={className}>
      {children}
      
      {loading && (loadingIndicator || (
        <div className="flex justify-center items-center py-4">
          <div className="w-8 h-8 border-4 border-primary/60 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ))}
      
      {!hasMore && endMessage && (
        <div className="py-4">
          {endMessage}
        </div>
      )}
    </div>
  );
};

export default ScrollLazyLoader;