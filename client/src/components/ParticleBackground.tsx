import { useCallback, useEffect, useState } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim'; // Using slim package for better performance
import type { Engine, ISourceOptions } from 'tsparticles-engine';
import { getDevicePerformanceTier, DevicePerformanceTier, isMobileDevice, getOptimalParticleCount } from '../utils/deviceDetection';

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
  disableForLowPerformance = true
}: ParticleBackgroundProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [performanceTier, setPerformanceTier] = useState<DevicePerformanceTier>(DevicePerformanceTier.MEDIUM);
  
  // Initialize device detection
  useEffect(() => {
    setIsMobile(isMobileDevice());
    setPerformanceTier(getDevicePerformanceTier());
    setIsInitialized(true);
  }, []);
  
  // Skip rendering if this should be disabled on mobile
  const shouldDisable = !enableOnMobile && isMobile;
  
  // Skip rendering for low-performance devices if requested
  const isLowPerformance = performanceTier === DevicePerformanceTier.LOW;
  const disableForPerformance = disableForLowPerformance && isLowPerformance;
  
  // Calculate optimal particle count based on device performance
  const particleCount = getOptimalParticleCount();
  
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
          value: Math.floor(particleCount * 0.5), // Use 50% fewer particles on mobile
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
          value: particleCount,
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
  
  // Optimize options based on device detection
  const optimizedOptions: ISourceOptions = isMobile 
    ? getMobileOptimizedOptions() as ISourceOptions
    : getStandardOptions() as ISourceOptions;
    
  return (
    <Particles
      id="tsparticles"
      className={`absolute inset-0 ${className}`}
      options={optimizedOptions as any}
      init={particlesInit}
    />
  );
};

export default ParticleBackground;