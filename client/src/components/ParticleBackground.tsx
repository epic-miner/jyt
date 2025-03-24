import { useCallback, useEffect, useState } from 'react';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import Particles from 'react-particles';
import { getDevicePerformanceTier, DevicePerformanceTier } from '../utils/deviceDetection';

// Define our own MoveDirection enum to avoid dependency on tsparticles-engine exports
enum MoveDirection {
  NONE = "none",
  TOP = "top",
  TOP_RIGHT = "top-right",
  RIGHT = "right",
  BOTTOM_RIGHT = "bottom-right",
  BOTTOM = "bottom",
  BOTTOM_LEFT = "bottom-left",
  LEFT = "left",
  TOP_LEFT = "top-left"
}

interface ParticleBackgroundProps {
  className?: string;
  color?: string;
  secondaryColor?: string;
  style?: React.CSSProperties;
  particleDensity?: 'none' | 'low' | 'medium' | 'high';
  backgroundColor?: string;
  disableOnMobile?: boolean;
}

/**
 * A performance-optimized background particle effect
 * Uses tsparticles-slim for better mobile performance and adapts to device capabilities
 */
const ParticleBackground = ({
  className = '',
  color = '#6d28d9',
  secondaryColor = '#8b5cf6',
  style,
  particleDensity = 'medium',
  backgroundColor = 'transparent',
  disableOnMobile = true
}: ParticleBackgroundProps) => {
  const [performanceTier, setPerformanceTier] = useState<DevicePerformanceTier>(
    DevicePerformanceTier.MEDIUM
  );
  const [isMounted, setIsMounted] = useState(false);
  
  // Get device performance on client-side only
  useEffect(() => {
    setPerformanceTier(getDevicePerformanceTier());
    setIsMounted(true);
  }, []);
  
  // Determine number of particles based on performance tier and specified density
  const getOptimalParticleCount = (): number => {
    // Return 0 if we want to disable on mobile for low-end devices
    if (disableOnMobile && performanceTier === DevicePerformanceTier.LOW) {
      return 0;
    }
    
    // Determine base count from the particleDensity prop
    let baseCount = 0;
    switch (particleDensity) {
      case 'none':
        return 0;
      case 'low':
        baseCount = 20;
        break;
      case 'medium':
        baseCount = 50;
        break;
      case 'high':
        baseCount = 100;
        break;
    }
    
    // Scale based on performance tier
    switch (performanceTier) {
      case DevicePerformanceTier.LOW:
        return Math.max(5, Math.floor(baseCount * 0.2));
      case DevicePerformanceTier.MEDIUM:
        return Math.floor(baseCount * 0.6);
      case DevicePerformanceTier.HIGH:
        return baseCount;
      default:
        return baseCount;
    }
  };
  
  // Initialize the tsparticles engine
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);
  
  // Don't render on server-side to avoid hydration mismatches
  if (!isMounted) {
    return <div 
      className={className} 
      style={{ 
        ...style,
        backgroundColor,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
      }} 
    />;
  }
  
  // No particles for very low-end devices when disableOnMobile is true
  const calculatedParticleCount = getOptimalParticleCount();
  if (calculatedParticleCount === 0) {
    return <div 
      className={className} 
      style={{ 
        ...style,
        backgroundColor,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
      }} 
    />;
  }

  // Optimize configuration based on device performance
  const useSimpleShape = performanceTier === DevicePerformanceTier.LOW;
  const disableInteractivity = performanceTier === DevicePerformanceTier.LOW;
  const reduceAnimationSpeed = performanceTier !== DevicePerformanceTier.HIGH;
  
  return (
    <Particles
      className={className}
      init={particlesInit}
      options={{
        fullScreen: false,
        background: {
          color: { value: backgroundColor },
        },
        fpsLimit: performanceTier === DevicePerformanceTier.LOW ? 30 : 60,
        interactivity: {
          events: {
            onClick: {
              enable: !disableInteractivity,
              mode: "push",
            },
            onHover: {
              enable: !disableInteractivity,
              mode: "repulse",
            },
            resize: true,
          },
          modes: {
            push: {
              quantity: performanceTier === DevicePerformanceTier.HIGH ? 4 : 2,
            },
            repulse: {
              distance: performanceTier === DevicePerformanceTier.HIGH ? 100 : 50,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: color,
          },
          links: {
            color: secondaryColor,
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
          },
          collisions: {
            enable: performanceTier === DevicePerformanceTier.HIGH,
          },
          move: {
            direction: MoveDirection.NONE,
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: reduceAnimationSpeed ? 1 : 2,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: calculatedParticleCount,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: useSimpleShape ? "circle" : ["circle", "triangle", "square"],
          },
          size: {
            value: { min: 1, max: 5 },
          },
        },
        detectRetina: performanceTier === DevicePerformanceTier.HIGH,
      }}
      style={style}
    />
  );
};

export default ParticleBackground;