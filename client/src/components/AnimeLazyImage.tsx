import { useState, useEffect, useRef } from 'react';
import { getAdaptiveImageQuality } from '../utils/deviceDetection';

interface AnimeLazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  blur?: boolean;
  fallbackSrc?: string;
  lazy?: boolean;
  threshold?: number;
  loadingIndicator?: boolean;
  optimizeForMobile?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onClick?: () => void;
}

/**
 * An optimized lazy-loading image component for anime thumbnails
 * Includes smart loading strategies for mobile devices
 */
export const AnimeLazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  objectFit = 'cover',
  blur = true,
  fallbackSrc = '/images/placeholder.webp',
  lazy = true,
  threshold = 0.1,
  loadingIndicator = true,
  optimizeForMobile = true,
  priority = false,
  onLoad,
  onClick
}: AnimeLazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(priority ? src : '');
  const imageRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // On mobile devices, optimize image loading if requested
  const [qualityLevel, setQualityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  
  useEffect(() => {
    // Determine image quality based on device capabilities
    if (optimizeForMobile) {
      setQualityLevel(getAdaptiveImageQuality());
    }
  }, [optimizeForMobile]);
  
  // Get optimized image URL if needed
  const getOptimizedImageUrl = (url: string): string => {
    if (!optimizeForMobile) return url;
    
    // If URL already contains optimization params, don't modify
    if (url.includes('?quality=') || url.includes('&quality=')) {
      return url;
    }
    
    // For low-end devices, use a lower quality image
    if (qualityLevel === 'low') {
      return appendQualityParam(url, 60);
    } else if (qualityLevel === 'medium') {
      return appendQualityParam(url, 80);
    }
    
    return url;
  };
  
  // Helper to append quality parameter to URL
  const appendQualityParam = (url: string, quality: number): string => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}quality=${quality}`;
  };
  
  // Setup intersection observer for lazy loading
  useEffect(() => {
    // Skip if image should load immediately or is already loaded
    if (priority || !lazy || isLoaded) return;
    
    // Cleanup existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    if (!imageRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setImageSrc(getOptimizedImageUrl(src));
          observer.disconnect();
          observerRef.current = null;
        }
      },
      {
        root: null,
        rootMargin: '200px', // Start loading before visible
        threshold
      }
    );
    
    observer.observe(imageRef.current);
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, lazy, priority, threshold, isLoaded, qualityLevel]);
  
  // If priority is true, load immediately
  useEffect(() => {
    if (priority && src) {
      setImageSrc(getOptimizedImageUrl(src));
    }
  }, [src, priority, qualityLevel]);
  
  // Handle image load events
  const handleLoad = () => {
    setIsLoaded(true);
    setError(false);
    if (onLoad) {
      onLoad();
    }
  };
  
  // Handle errors
  const handleError = () => {
    setError(true);
    if (fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };
  
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%' 
      }}
      onClick={onClick}
    >
      {/* Loading indicator */}
      {!isLoaded && loadingIndicator && (
        <div 
          className="absolute inset-0 bg-gray-800/20 flex items-center justify-center animate-pulse"
          style={{ zIndex: 1 }}
        >
          <div className="w-8 h-8 border-2 border-primary/60 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Blur placeholder effect */}
      {!isLoaded && blur && (
        <div 
          className="absolute inset-0 bg-gray-800/40 backdrop-blur-sm"
          style={{ zIndex: 0 }}
        />
      )}
      
      {/* Main image */}
      <img 
        ref={imageRef}
        src={imageSrc} 
        alt={alt}
        loading={lazy && !priority ? "lazy" : undefined}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit,
          visibility: isLoaded ? 'visible' : 'hidden',
          width: '100%',
          height: '100%',
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
};

export default AnimeLazyImage;