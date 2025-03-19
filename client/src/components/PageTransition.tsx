import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { memo, useMemo } from 'react';

// Define motion variants outside component to prevent recreation on each render
const pageVariants = {
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

// Detect if we're on a mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );
};

interface PageTransitionProps {
  children: React.ReactNode;
  /**
   * Optional key to force remounting/animation when it changes
   * Useful when URL params change but component stays the same
   */
  transitionKey?: string | number;
}

// Memoize the component to prevent unnecessary re-renders
export const PageTransition = memo(({ 
  children,
  transitionKey
}: PageTransitionProps) => {
  // Respect user's reduced motion preference for accessibility
  const prefersReducedMotion = useReducedMotion();
  
  // Conditionally select variants based on user preference
  const variants = useMemo(() => 
    prefersReducedMotion ? reducedMotionVariants : pageVariants, 
    [prefersReducedMotion]
  );

  // Select appropriate transition based on device for better performance
  const transition = useMemo(() => 
    isMobileDevice() ? mobileTransition : desktopTransition, 
    []
  );
  
  // Memoize styles to avoid object recreation on each render
  const motionStyles = useMemo(() => ({ 
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    // Reduce composite layers on mobile
    transform: 'translateZ(0)',
    // Hardware acceleration hint
    WebkitFontSmoothing: 'antialiased'
  }), []);

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
        style={motionStyles}
        // Improve performance by letting the browser know this element will animate
        layoutId={transitionKey?.toString()}
        // Improve browser paint performance  
        data-performance="accelerated"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
});

PageTransition.displayName = 'PageTransition';