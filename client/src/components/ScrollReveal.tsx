import { ReactNode, memo, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Detect if we're on a mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );
};

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'none';
  delay?: number;
  duration?: number;
  rootMargin?: string;
  // Optional prop to disable animations on mobile
  disableOnMobile?: boolean;
}

// Simplified variants for mobile
const mobileAnimationVariants = {
  'fade': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 15 }, // Reduced distance
    visible: { opacity: 1, y: 0 },
  },
  'slide-down': {
    hidden: { opacity: 0, y: -15 }, // Reduced distance
    visible: { opacity: 1, y: 0 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: 15 }, // Reduced distance
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: -15 }, // Reduced distance
    visible: { opacity: 1, x: 0 },
  },
  'zoom': {
    hidden: { opacity: 0, scale: 0.95 }, // Less dramatic scale
    visible: { opacity: 1, scale: 1 },
  },
  'none': {
    hidden: {},
    visible: {},
  },
};

// Full animations for desktop
const desktopAnimationVariants = {
  'fade': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-down': {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  'zoom': {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  'none': {
    hidden: {},
    visible: {},
  },
};

const ScrollReveal = memo(({
  children,
  className,
  threshold = 0.1,
  triggerOnce = true,
  animation = 'fade',
  delay = 0,
  duration = 0.5,
  rootMargin = '0px',
  disableOnMobile = false,
}: ScrollRevealProps) => {
  // Check if user prefers reduced motion
  const prefersReducedMotion = useReducedMotion();
  
  // Check for mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Set mobile state on client side
    setIsMobile(isMobileDevice());
  }, []);
  
  // Use simplified animation variants for mobile
  const animationVariants = isMobile ? mobileAnimationVariants : desktopAnimationVariants;
  
  // Adjust params for mobile
  const effectiveDuration = isMobile ? Math.min(0.3, duration) : duration;
  const effectiveDelay = isMobile ? Math.min(0.1, delay) : delay;
  
  // Set up intersection observer with appropriate threshold
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
    rootMargin,
  });

  // Skip animations for users who prefer reduced motion or on mobile if disabled
  if (prefersReducedMotion || (isMobile && disableOnMobile)) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={animationVariants[animation]}
      transition={{ 
        duration: effectiveDuration, 
        delay: effectiveDelay,
        ease: 'easeOut',
      }}
      className={cn(className, 'will-change-[opacity,transform]')}
    >
      {children}
    </motion.div>
  );
});

ScrollReveal.displayName = 'ScrollReveal';

export default ScrollReveal;