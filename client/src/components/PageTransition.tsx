import { useState, useEffect, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { isMobileDevice, DevicePerformanceTier, getDevicePerformanceTier } from '../utils/deviceDetection';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: ReactNode;
  location?: string; // Made optional since we can get it from useLocation
  className?: string;
  transitionType?: 'fade' | 'slide' | 'zoom' | 'none';
}

/**
 * A performance-optimized component for smooth page transitions
 * Renders different animations based on device performance
 */
export const PageTransition = ({
  children,
  location: propLocation,
  className = '',
  transitionType = 'fade'
}: PageTransitionProps) => {
  // Get current location if not provided as prop
  const [currentLocation] = useLocation();
  const location = propLocation || currentLocation;
  
  // Check device capabilities for optimal animation
  const [performanceTier, setPerformanceTier] = useState<DevicePerformanceTier>(
    DevicePerformanceTier.MEDIUM
  );
  const [isMounted, setIsMounted] = useState(false);
  
  // Determine if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  // Initialize performance tier on client side
  useEffect(() => {
    setPerformanceTier(getDevicePerformanceTier());
    setIsMobile(isMobileDevice());
    setIsMounted(true);
  }, []);
  
  // Don't animate on low-end devices
  const shouldSkipAnimation = performanceTier === DevicePerformanceTier.LOW;
  
  if (!isMounted) {
    // Initial SSR render with no animation
    return <div className={className}>{children}</div>;
  }
  
  // Simple animations for mobile
  const simpleMobileAnimations = isMobile && performanceTier !== DevicePerformanceTier.HIGH;
  
  // Define the type for variants to fix framer-motion type issues
  interface AnimationVariants {
    initial: any;
    animate: any;
    exit: any;
  }
  
  // Determine animation variants based on type and device capabilities
  let variants: AnimationVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
  
  // Only apply more complex animations if we shouldn't skip them
  if (!shouldSkipAnimation) {
    switch (transitionType) {
      case 'slide':
        variants = {
          initial: { opacity: 0, x: simpleMobileAnimations ? 10 : 30 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: simpleMobileAnimations ? -10 : -30 },
        };
        break;
      case 'zoom':
        variants = {
          initial: { opacity: 0, scale: simpleMobileAnimations ? 0.95 : 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: simpleMobileAnimations ? 1.05 : 1.1 },
        };
        break;
      case 'none':
        variants = {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
        };
        break;
    }
  }
  
  // Adjust animation duration based on performance tier
  const duration = shouldSkipAnimation ? 0.1 : 
                   performanceTier === DevicePerformanceTier.HIGH ? 0.3 : 0.2;
  
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants as any}
          transition={{
            duration,
            ease: "easeInOut",
          }}
          style={{ 
            width: '100%',
            height: '100%',
            willChange: shouldSkipAnimation ? 'auto' : 'opacity, transform' 
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PageTransition;