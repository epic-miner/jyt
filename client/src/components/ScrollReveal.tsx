import { useEffect, useRef, ReactNode } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { isMobileDevice, shouldReduceAnimations } from '../utils/deviceDetection';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variant?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'none';
  delay?: number;
  duration?: number;
  threshold?: number;
  margin?: string;
  once?: boolean;
  disabled?: boolean;
  skipInMobile?: boolean;
}

// Use type assertion for framer-motion
interface AnimationVariants {
  hidden: any;
  visible: any;
}

/**
 * A performance-optimized component that animates its children when they enter the viewport.
 * Designed to be lightweight on mobile devices and respect user preferences for reduced motion.
 */
const ScrollReveal = ({
  children,
  className = '',
  variant = 'fade',
  delay = 0,
  duration = 0.5,
  threshold = 0.2,
  margin = '0px',
  once = true,
  disabled = false,
  skipInMobile = false
}: ScrollRevealProps) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once, 
    // Cast to any because framer-motion types are incompatible
    threshold: threshold as any,
    margin: margin as any
  });
  
  // Check for reduced motion preference and mobile device
  const isReducedMotion = useRef(false);
  const isMobile = useRef(false);
  
  // Initialize client-side only values
  useEffect(() => {
    isReducedMotion.current = shouldReduceAnimations();
    isMobile.current = isMobileDevice();
  }, []);
  
  // Determine if we should skip animations
  const shouldSkipAnimation = 
    disabled || 
    (skipInMobile && isMobile.current) || 
    isReducedMotion.current;
    
  useEffect(() => {
    // Skip animation if required
    if (shouldSkipAnimation) {
      controls.set('visible');
      return;
    }
    
    // Start animation when in view
    if (inView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [controls, inView, once, shouldSkipAnimation]);

  // Define animations based on variant
  const getAnimationVariants = (): AnimationVariants => {
    // If should skip animation, use minimal variant that just changes opacity slightly
    if (shouldSkipAnimation) {
      return {
        hidden: { opacity: 0.9 },
        visible: { opacity: 1 }
      };
    }
    
    // Use simpler animations on mobile for better performance
    const mobileFriendly = isMobile.current;
    
    // Adjust duration for mobile (faster animations)
    const adjustedDuration = mobileFriendly ? Math.max(0.2, duration * 0.7) : duration;
    
    // Default animation (fade)
    let variants: AnimationVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: {
          duration: adjustedDuration,
          delay,
          ease: 'easeOut'
        }
      }
    };
    
    // Adjust animation based on variant
    switch (variant) {
      case 'slide-up':
        variants = {
          hidden: { opacity: 0, y: mobileFriendly ? 20 : 50 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: {
              duration: adjustedDuration,
              delay,
              ease: 'easeOut'
            }
          }
        };
        break;
        
      case 'slide-down':
        variants = {
          hidden: { opacity: 0, y: mobileFriendly ? -20 : -50 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: {
              duration: adjustedDuration,
              delay,
              ease: 'easeOut'
            }
          }
        };
        break;
        
      case 'slide-left':
        variants = {
          hidden: { opacity: 0, x: mobileFriendly ? 20 : 50 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: {
              duration: adjustedDuration,
              delay,
              ease: 'easeOut'
            }
          }
        };
        break;
        
      case 'slide-right':
        variants = {
          hidden: { opacity: 0, x: mobileFriendly ? -20 : -50 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: {
              duration: adjustedDuration,
              delay,
              ease: 'easeOut'
            }
          }
        };
        break;
        
      case 'zoom':
        variants = {
          hidden: { opacity: 0, scale: mobileFriendly ? 0.9 : 0.8 },
          visible: { 
            opacity: 1, 
            scale: 1,
            transition: {
              duration: adjustedDuration,
              delay,
              ease: 'easeOut'
            }
          }
        };
        break;
        
      case 'none':
        variants = {
          hidden: { opacity: 1 },
          visible: { opacity: 1 }
        };
        break;
    }
    
    return variants;
  };
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={getAnimationVariants() as any}
      className={className}
      // Use hardware acceleration for smoother animations
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;