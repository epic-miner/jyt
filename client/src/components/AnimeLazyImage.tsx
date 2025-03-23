import { useState, CSSProperties } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { cn } from '@/lib/utils';

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
}

const AnimeLazyImage = ({
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
}: AnimeLazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Determine rounded class based on the rounded prop
  const roundedClass = rounded === true 
    ? 'rounded-md' 
    : typeof rounded === 'string' 
      ? rounded 
      : '';
  
  // Determine hover effect class
  const hoverEffectClass = 
    hoverEffect === 'zoom' 
      ? 'transition-transform duration-500 hover:scale-110' 
      : hoverEffect === 'brighten' 
        ? 'transition-filter duration-300 hover:brightness-125' 
        : hoverEffect === 'darken' 
          ? 'transition-filter duration-300 hover:brightness-75' 
          : '';
  
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
  const imageSrc = isError ? fallbackSrc : src;
  
  return (
    <div 
      className={cn(
        'overflow-hidden', 
        roundedClass, 
        wrapperClassName
      )} 
      style={{ 
        position: 'relative',
        aspectRatio: aspectRatio,
        width: width,
        height: height 
      }}
    >
      <LazyLoadImage
        src={imageSrc}
        alt={alt}
        effect={effect}
        className={cn(
          'object-cover w-full h-full', 
          hoverEffectClass,
          className
        )}
        beforeLoad={() => setIsLoaded(false)}
        afterLoad={handleLoad}
        onError={handleError}
        threshold={100}
        visibleByDefault={eager}
        placeholder={
          <div style={placeholderStyles} className={roundedClass} />
        }
      />
    </div>
  );
};

export default AnimeLazyImage;