/**
 * Device detection and performance optimization utilities
 */

/**
 * Detects if the current device is a mobile device
 */
export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detects if the current device might be low-end
 */
export const isLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // Check device memory (Chrome, Opera, Samsung Internet, etc.)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const deviceMemory = navigator.deviceMemory || 4; // 4GB is default if not supported
  
  // Check for devices with limited memory
  if (deviceMemory < 4) return true;
  
  // Check for older mobile devices or slower chipsets
  const isOlderMobile = /Android [1-7]\./.test(navigator.userAgent);
  if (isOlderMobile) return true;
  
  return false;
};

/**
 * Detects if user has enabled data saving mode
 */
export const isDataSavingEnabled = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Network Information API
  return navigator.connection?.saveData === true;
};

/**
 * Detects if device is on a slow connection
 */
export const isSlowConnection = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Network Information API
  const connection = navigator.connection;
  
  if (!connection) return false;
  
  // Check if using 2G or if effective type is slow-2g or 2g
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return connection.type === '2g' || 
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ['slow-2g', '2g'].includes(connection.effectiveType);
};

/**
 * Get recommended image quality based on device and network
 */
export const getRecommendedImageQuality = (): number => {
  if (isDataSavingEnabled()) return 60;
  if (isSlowConnection()) return 70;
  if (isLowEndDevice()) return 80;
  if (isMobileDevice()) return 85;
  return 90;
};

/**
 * Get recommended image width based on device and screen
 */
export const getRecommendedImageWidth = (): number => {
  if (typeof window === 'undefined') return 800;
  
  const screenWidth = window.innerWidth;
  
  if (isDataSavingEnabled() || isSlowConnection()) {
    return Math.min(screenWidth, 400);
  }
  
  if (isLowEndDevice() || isMobileDevice()) {
    return Math.min(screenWidth, 600);
  }
  
  return Math.min(screenWidth, 1200);
};

/**
 * Generate optimized image URL with quality and width parameters
 */
export const getOptimizedImageUrl = (url: string): string => {
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
  
  const quality = getRecommendedImageQuality();
  const width = getRecommendedImageWidth();
  
  // For URLs with query parameters
  if (url.includes('?')) {
    return `${url}&quality=${quality}&w=${width}`;
  }
  
  // For URLs without query parameters
  return `${url}?quality=${quality}&w=${width}`;
};

/**
 * Check if the browser supports various performance optimizations
 */
export const getSupportedOptimizations = () => {
  if (typeof window === 'undefined') {
    return {
      webp: false,
      avif: false,
      intersectionObserver: false,
      resizeObserver: false
    };
  }
  
  return {
    webp: Boolean(document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0),
    avif: false, // AVIF detection is complex, defaulting to false
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window
  };
};

/**
 * Determine if animations should be reduced/disabled on this device
 */
export const shouldReduceAnimations = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if user has requested reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return (
    prefersReducedMotion || 
    isLowEndDevice() || 
    isDataSavingEnabled() || 
    isSlowConnection()
  );
};

export default {
  isMobileDevice,
  isLowEndDevice,
  isDataSavingEnabled,
  isSlowConnection,
  getRecommendedImageQuality,
  getRecommendedImageWidth,
  getOptimizedImageUrl,
  getSupportedOptimizations,
  shouldReduceAnimations
};