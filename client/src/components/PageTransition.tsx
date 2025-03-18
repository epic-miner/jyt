import { motion } from 'framer-motion';

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

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2
};

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};