import { motion } from "framer-motion";
import { memo, useEffect, useRef, useState } from 'react';

const PARTICLE_COUNT = 50;
const MAX_OPACITY = 0.5;
const MIN_SIZE = 1;
const MAX_SIZE = 3;

// Optimized with React.memo to prevent unnecessary re-renders
export const BackgroundParticles = memo(() => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate optimized particles with improved animation performance
  useEffect(() => {
    if (!containerRef.current) return;
    setMounted(true);

    // Cleanup function
    return () => {
      setMounted(false);
    };
  }, []);

  // Only continue rendering particles when component is mounted
  // This prevents unnecessary calculations when the component is not visible
  if (!mounted) {
    return (
      <div 
        ref={containerRef}
        className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden" 
        style={{ position: 'fixed', zIndex: -1 }}
      >
        <div className="absolute inset-0 bg-dark-950"></div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden" 
      style={{ position: 'fixed', zIndex: -1 }}
    >
      <div className="absolute inset-0 bg-dark-950"></div>
      
      {/* Optimized particle rendering using hardware-accelerated properties */}
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const size = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1)) + MIN_SIZE;
        const opacity = Math.random() * MAX_OPACITY;
        const initialX = Math.random() * 100;
        const initialY = Math.random() * 100;
        const duration = 25 + Math.random() * 50;
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            initial={{ 
              x: `${initialX}vw`, 
              y: `${initialY}vh`, 
              opacity: 0
            }}
            animate={{ 
              x: [`${initialX}vw`, `${(initialX + 20) % 100}vw`, `${(initialX - 10 + 100) % 100}vw`],
              y: [`${initialY}vh`, `${(initialY - 30 + 100) % 100}vh`, `${(initialY + 5) % 100}vh`],
              opacity: [0, opacity, 0]
            }}
            transition={{ 
              repeat: Infinity,
              duration,
              ease: "linear",
              times: [0, 0.5, 1],
              repeatType: "reverse" 
            }}
            style={{ 
              width: `${size}px`, 
              height: `${size}px`,
              willChange: 'transform, opacity'
            }}
          />
        );
      })}
    </div>
  );
});