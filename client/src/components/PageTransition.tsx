import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { memo, useMemo, useEffect, useState } from 'react';

// Detect if we're on a mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );
};

// Further simplified variants for low-end mobile devices
const mobileLowEndVariants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1
  },
  exit: {
    opacity: 0
  }
};

// Simplified variants for mobile
const mobileVariants = {
  initial: {
    opacity: 0,
    y: 10 // Reduced distance
  },
  animate: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -10 // Reduced distance
  }
};

// Define motion variants outside component to prevent recreation on each render
const desktopVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98
  }
};

// Simplified variants for reduced motion preference
const reducedMotionVariants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1
  },
  exit: {
    opacity: 0
  }
};

// Transition options optimized for different devices
const desktopTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2
};

// Simpler, faster transition for mobile devices to avoid jank
const mobileTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.15
};

// Even faster transition for low-end mobile devices
const mobileLowEndTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.1
};

// Detect if device might be low-end based on user agent and memory
const isLowEndDevice = () => {
  if (typeof navigator === 'undefined') return false;
  
  // Check device memory (Chrome, Opera, Samsung Internet, etc.)
  // @ts-ignore
  const deviceMemory = navigator.deviceMemory || 4; // 4GB is default if not supported
  
  // Check for low-end devices or devices with limited memory
  if (deviceMemory < 4) return true;
  
  // Check for older mobile devices or slower chipsets
  const isOlderMobile = /Android [1-7]\./.test(navigator.userAgent);
  if (isOlderMobile) return true;
  
  return false;
};

interface PageTransitionProps {
  children: React.ReactNode;
  /**
   * Optional key to force remounting/animation when it changes
   * Useful when URL params change but component stays the same
   */
  transitionKey?: string | number;
  /**
   * Disable transitions completely for low-performance devices
   */
  disableOnLowEnd?: boolean;
}

// Memoize the component to prevent unnecessary re-renders
export const PageTransition = memo(({ 
  children,
  transitionKey,
  disableOnLowEnd = true
}: PageTransitionProps) => {
  // Respect user's reduced motion preference for accessibility
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  
  useEffect(() => {
    // Set values on client-side only
    setIsMobile(isMobileDevice());
    setIsLowEnd(isLowEndDevice());
  }, []);
  
  // Skip animations completely for very low-end devices
  const shouldSkipAnimation = disableOnLowEnd && isLowEnd;
  
  // Conditionally select variants based on device capabilities
  const variants = useMemo(() => {
    if (prefersReducedMotion) return reducedMotionVariants;
    if (isLowEnd) return mobileLowEndVariants;
    if (isMobile) return mobileVariants;
    return desktopVariants;
  }, [prefersReducedMotion, isLowEnd, isMobile]);

  // Select appropriate transition based on device for better performance
  const transition = useMemo(() => {
    if (isLowEnd) return mobileLowEndTransition;
    if (isMobile) return mobileTransition;
    return desktopTransition;
  }, [isLowEnd, isMobile]);
  
  // For very low-end devices, skip animations entirely
  if (shouldSkipAnimation) {
    return <div className="w-full">{children}</div>;
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        className="w-full"
        style={{
          // Apply performance optimizations with style to ensure they work
          willChange: 'opacity, transform',
          isolation: 'isolate', // Create a new stacking context
          contain: 'content' // Hint for browser optimization
        }}
        data-performance="accelerated"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
});

PageTransition.displayName = 'PageTransition';