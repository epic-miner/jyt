import { motion, useReducedMotion } from 'framer-motion';

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

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2
};

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  // Respect user's reduced motion preference for accessibility
  const prefersReducedMotion = useReducedMotion();
  
  // Choose appropriate animation based on user preference
  const variants = prefersReducedMotion ? reducedMotionVariants : pageVariants;
  
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={pageTransition}
      className="w-full"
      // Hardware acceleration for better performance
      style={{ 
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden'
      }}
    >
      {children}
    </motion.div>
  );
};