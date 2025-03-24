import { useState, CSSProperties, useEffect, memo } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { cn } from '@/lib/utils';

// Detect if we're on a mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );
};

// Helper function to generate lower quality image URL for mobile
const getMobileOptimizedImageUrl = (url: string): string => {
  if (!url) return url;
  
  // If already using a compressed format like webp, return as is
  if (url.includes('.webp')) return url;
  
  // If it's a relative URL without extension, don't modify
  if (url.startsWith('/') && !url.includes('.')) return url;
  
  // If the URL already has a query parameter for quality or size, don't modify
  if (url.includes('quality=') || url.includes('size=') || 
      url.includes('w=') || url.includes('width=')) {
    return url;
  }
  
  // For URLs with query parameters
  if (url.includes('?')) {
    return `${url}&quality=70&w=400`;
  }
  
  // For URLs without query parameters
  return `${url}?quality=70&w=400`;
};

// Type definitions for the LazyLoadImage props
interface LazyLoadImageProps {
  alt?: string;
  height?: number | string;
  src: string;
  width?: number | string;
  className?: string;
  placeholderSrc?: string;
  effect?: 'blur' | 'opacity' | 'black-and-white';
  afterLoad?: () => void;
  beforeLoad?: () => void;
  delayMethod?: 'debounce' | 'throttle';
  delayTime?: number;
  placeholder?: React.ReactNode;
  threshold?: number;
  useIntersectionObserver?: boolean;
  visibleByDefault?: boolean;
  wrapperClassName?: string;
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
  style?: CSSProperties;
  onError?: () => void;
}

interface AnimeLazyImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  width?: number | string;
  height?: number | string;
  placeholderColor?: string;
  effect?: 'blur' | 'opacity' | 'black-and-white';
  aspectRatio?: string;
  rounded?: boolean | string;
  eager?: boolean; // For important above-the-fold images
  onLoad?: () => void;
  onError?: () => void;
  hoverEffect?: 'zoom' | 'brighten' | 'darken' | 'none';
  fallbackSrc?: string;
  disableEffectsOnMobile?: boolean; // New prop to disable effects on mobile
  optimizeForMobile?: boolean; // New prop to control mobile optimization
}

const AnimeLazyImage = memo(({
  src,
  alt,
  className,
  wrapperClassName,
  width,
  height,
  placeholderColor = '#18181b', // Dark default
  effect = 'blur',
  aspectRatio = '16/9',
  rounded = false,
  eager = false,
  onLoad,
  onError,
  hoverEffect = 'none',
  fallbackSrc = '/images/placeholder.webp', // Fallback image if src fails
  disableEffectsOnMobile = true, // Default to disable effects on mobile
  optimizeForMobile = true, // Default to optimize for mobile
}: AnimeLazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Set mobile state on client side
    setIsMobile(isMobileDevice());
  }, []);
  
  // Determine rounded class based on the rounded prop
  const roundedClass = rounded === true 
    ? 'rounded-md' 
    : typeof rounded === 'string' 
      ? rounded 
      : '';
  
  // Determine hover effect class - disable on mobile if requested
  const hoverEffectClass = (!isMobile || !disableEffectsOnMobile) ? (
    hoverEffect === 'zoom' 
      ? 'transition-transform duration-500 hover:scale-110' 
      : hoverEffect === 'brighten' 
        ? 'transition-filter duration-300 hover:brightness-125' 
        : hoverEffect === 'darken' 
          ? 'transition-filter duration-300 hover:brightness-75' 
          : ''
  ) : '';
  
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };
  
  const handleError = () => {
    setIsError(true);
    onError?.();
  };
  
  // Create the placeholder component with the specified color
  const placeholderStyles: CSSProperties = {
    backgroundColor: placeholderColor,
    width: '100%',
    height: '100%',
  };
  
  // If there's an error and fallbackSrc is provided, use the fallback
  let imageSrc = isError ? fallbackSrc : src;
  
  // Use optimized image for mobile if enabled
  if (isMobile && optimizeForMobile) {
    imageSrc = getMobileOptimizedImageUrl(imageSrc);
  }
  
  // Simplified effect for mobile
  const effectiveEffect = isMobile && disableEffectsOnMobile ? 'opacity' : effect;
  
  // Optimize loading threshold for mobile (load when closer to viewport)
  const loadingThreshold = isMobile ? 200 : 100;
  
  return (
    <div 
      className={cn(
        'overflow-hidden', 
        roundedClass, 
        wrapperClassName,
        'will-change-transform' // Improve performance by hinting browser
      )} 
      style={{ 
        position: 'relative',
        aspectRatio: aspectRatio,
        width: width,
        height: height,
        contain: 'paint' // Optimize paint containment
      }}
    >
      <LazyLoadImage
        src={imageSrc}
        alt={alt}
        effect={effectiveEffect}
        className={cn(
          'object-cover w-full h-full', 
          hoverEffectClass,
          className,
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        beforeLoad={() => setIsLoaded(false)}
        afterLoad={handleLoad}
        onError={handleError}
        threshold={loadingThreshold}
        visibleByDefault={eager}
        delayMethod="throttle"
        delayTime={isMobile ? 300 : 100} // Higher throttle on mobile
        placeholder={
          <div style={placeholderStyles} className={roundedClass} />
        }
      />
    </div>
  );
});

AnimeLazyImage.displayName = 'AnimeLazyImage';

export default AnimeLazyImage;