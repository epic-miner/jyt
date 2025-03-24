import { useCallback, useEffect, useState, useRef } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim'; // Using slim package for better performance
import type { Engine, ISourceOptions } from 'tsparticles-engine';
import { 
  getDevicePerformanceTier, 
  DevicePerformanceTier, 
  isMobileDevice, 
  getOptimalParticleCount,
  isLowPowerDevice
} from '../utils/deviceDetection';

interface ParticleBackgroundProps {
  className?: string;
  particleColor?: string;
  particleOpacity?: number;
  linkColor?: string;
  linkOpacity?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  minDistance?: number;
  maxDistance?: number;
  enableOnMobile?: boolean;
  densityArea?: number;
  particleShape?: 'circle' | 'square' | 'triangle' | 'star' | 'polygon';
  particleSize?: number;
  moveSpeed?: number;
  hoverEffect?: boolean;
  clickEffect?: boolean;
  disableForLowPerformance?: boolean;
  particleCount?: number;
}

/**
 * A performance-optimized particle background component
 * Automatically adjusts particle density and effects based on device capabilities
 */
const ParticleBackground = ({
  className = '',
  particleColor = '#8b5cf6',
  particleOpacity = 0.5,
  linkColor = '#8b5cf6',
  linkOpacity = 0.3,
  backgroundColor = '#121212',
  backgroundOpacity = 1,
  minDistance = 100,
  maxDistance = 200,
  enableOnMobile = true,
  densityArea = 800,
  particleShape = 'circle',
  particleSize = 3,
  moveSpeed = 3,
  hoverEffect = true,
  clickEffect = true,
  disableForLowPerformance = true,
  particleCount
}: ParticleBackgroundProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [performanceTier, setPerformanceTier] = useState<DevicePerformanceTier>(DevicePerformanceTier.MEDIUM);
  const [isScrolling, setIsScrolling] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize device detection
  useEffect(() => {
    setIsMobile(isMobileDevice());
    setPerformanceTier(getDevicePerformanceTier());
    setIsInitialized(true);
    
    // Check if reduced motion is preferred
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    
    // Add scroll listener to reduce particle animation during scrolling
    const handleScroll = () => {
      if (!isLowPowerDevice()) return; // Only apply to low-power devices
      
      setIsScrolling(true);
      
      // Clear previous timeout
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set a timeout to stop "isScrolling" state 100ms after scrolling stops
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
        scrollTimeoutRef.current = null;
      }, 100);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  
  // Skip rendering if this should be disabled on mobile
  const shouldDisable = !enableOnMobile && isMobile;
  
  // Skip rendering for low-performance devices if requested
  const isLowPerformance = performanceTier === DevicePerformanceTier.LOW;
  const disableForPerformance = disableForLowPerformance && isLowPerformance;
  
  // Calculate optimal particle count or use provided value
  const actualParticleCount = particleCount || getOptimalParticleCount();
  
  // Initialize particles with performance optimizations
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);
  
  // Skip rendering entirely if disabled
  if (!isInitialized || shouldDisable || disableForPerformance) {
    return null;
  }
  
  // Simple background for low-power devices
  if (isLowPerformance && !disableForPerformance) {
    return (
      <div 
        className={`absolute inset-0 ${className}`}
        style={{
          backgroundColor,
          opacity: backgroundOpacity,
          pointerEvents: 'none',
          zIndex: -1
        }}
      />
    );
  }
  
  // Performance-optimized options based on device capability
  const getMobileOptimizedOptions = (): ISourceOptions => {
    return {
      particles: {
        number: {
          value: Math.floor(actualParticleCount * 0.5), // Use 50% fewer particles on mobile
          density: {
            enable: true,
            value_area: densityArea * 1.5 // Spread them out more
          }
        },
        size: {
          value: particleSize * 0.8 // Slightly smaller particles
        },
        move: {
          enable: true,
          speed: moveSpeed * 0.5, // Slower movement for better performance
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false,
        },
        // Disable more advanced effects on mobile
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: false
            },
            onclick: {
              enable: false
            },
            resize: true
          }
        }
      }
    };
  };
  
  // Get standard options for desktop
  const getStandardOptions = (): ISourceOptions => {
    return {
      particles: {
        number: {
          value: actualParticleCount,
          density: {
            enable: true,
            value_area: densityArea
          }
        },
        color: {
          value: particleColor
        },
        opacity: {
          value: particleOpacity,
          random: true,
          anim: {
            enable: true,
            speed: 0.5,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: particleSize,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: linkColor,
          opacity: linkOpacity,
          width: 1
        },
        move: {
          enable: true,
          speed: moveSpeed,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: hoverEffect,
            mode: "grab"
          },
          onclick: {
            enable: clickEffect,
            mode: "push"
          },
          resize: true
        },
        modes: {
          grab: {
            distance: minDistance,
            line_linked: {
              opacity: 0.7
            }
          },
          bubble: {
            distance: maxDistance,
            size: 10,
            duration: 2,
            opacity: 0.8,
            speed: 3
          },
          repulse: {
            distance: 200,
            duration: 0.4
          },
          push: {
            particles_nb: 4
          },
          remove: {
            particles_nb: 2
          }
        }
      },
      retina_detect: true,
      background: {
        color: {
          value: backgroundColor
        },
        opacity: backgroundOpacity,
        position: "50% 50%",
        repeat: "no-repeat",
        size: "cover"
      }
    };
  };
  
  // Get base options based on device detection
  let baseOptions: ISourceOptions = isMobile 
    ? getMobileOptimizedOptions() as ISourceOptions
    : getStandardOptions() as ISourceOptions;
  
  // Apply further optimizations if scrolling or reduced motion is preferred
  if (isScrolling || reducedMotion) {
    // Create a nearly frozen state during scroll on mobile
    const frozenOptions: ISourceOptions = {
      ...baseOptions,
      particles: {
        ...baseOptions.particles,
        number: {
          ...(baseOptions.particles?.number || {}),
          value: Math.floor((baseOptions.particles?.number?.value || actualParticleCount) * (isMobile ? 0.3 : 0.7)), // Reduce particles drastically during scroll
        },
        move: {
          ...(baseOptions.particles?.move || {}),
          enable: !isMobile, // Completely stop movement on mobile during scroll
          speed: ((baseOptions.particles?.move?.speed || moveSpeed) * 0.2), // Much slower movement during scroll
        },
        opacity: {
          ...(baseOptions.particles?.opacity || {}),
          value: ((baseOptions.particles?.opacity?.value || particleOpacity) * 0.5), // Fade particles during scroll
          anim: {
            enable: false // Disable opacity animation during scroll
          }
        }
      }
    };
    
    // Use frozen state during scrolling
    baseOptions = frozenOptions;
  }
    
  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`} style={{ pointerEvents: 'none', zIndex: -1 }}>
      <Particles
        id="tsparticles"
        className="absolute inset-0"
        options={baseOptions as any}
        init={particlesInit}
      />
    </div>
  );
};

export default ParticleBackground;