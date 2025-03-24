import { useCallback, useEffect, useState, useRef, memo } from 'react';

interface ParticleOptions {
  particles?: {
    number?: { value?: number };
    color?: { value?: string };
    opacity?: { value?: number };
    size?: { value?: number };
    move?: { speed?: number };
  };
}

interface ParticleBackgroundProps {
  options?: ParticleOptions;
}

// Detect if we're on a mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );
};

const ParticleBackground = memo(({ options }: ParticleBackgroundProps) => {
  // Using a simpler implementation with vanilla JS for particles
  const [particlesInitialized, setParticlesInitialized] = useState(false);
  const animationFrameId = useRef<number | null>(null);
  const isFirstRender = useRef(true);
  const lastFrameTime = useRef(0);
  const FPS_THROTTLE = 30; // Limit to 30 FPS
  const frameInterval = 1000 / FPS_THROTTLE;

  useEffect(() => {
    // Only run this effect once
    if (particlesInitialized || !isFirstRender.current) return;
    isFirstRender.current = false;
    
    // Determine if we're on mobile
    const isMobile = isMobileDevice();
    
    // Reduce particle count and effects for mobile
    const mobileMultiplier = isMobile ? 0.3 : 1.0;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.classList.add('fixed', 'inset-0', '-z-10', 'particles-container');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    
    // Configure particles
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const particles: Array<{
      x: number;
      y: number;
      dirX: number;
      dirY: number;
      size: number;
      color: string;
      opacity: number;
    }> = [];
    
    // Apply custom options or defaults
    const baseParticleCount = options?.particles?.number?.value || 50;
    const particleCount = Math.floor(baseParticleCount * mobileMultiplier);
    const particleColor = options?.particles?.color?.value || '#ffffff';
    const particleOpacity = (options?.particles?.opacity?.value || 0.2) * mobileMultiplier;
    const particleSize = options?.particles?.size?.value || 2;
    const moveSpeed = (options?.particles?.move?.speed || 0.5) * mobileMultiplier;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dirX: (Math.random() - 0.5) * moveSpeed,
        dirY: (Math.random() - 0.5) * moveSpeed,
        size: Math.random() * particleSize + 1,
        color: particleColor,
        opacity: particleOpacity,
      });
    }
    
    // Don't draw connection lines on mobile (significant performance impact)
    const shouldDrawLines = !isMobile;
    
    // Animation function with FPS limiting
    const animate = (timestamp: number) => {
      // Request next frame first to ensure smooth animation
      animationFrameId.current = requestAnimationFrame(animate);
      
      // Throttle FPS for better performance
      const elapsed = timestamp - lastFrameTime.current;
      if (elapsed < frameInterval) return;
      
      // Update last frame time, accounting for the extra elapsed time
      lastFrameTime.current = timestamp - (elapsed % frameInterval);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Move particle
        p.x += p.dirX;
        p.y += p.dirY;
        
        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.dirX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dirY *= -1;
        
        // Draw lines between close particles - skip on mobile
        if (shouldDrawLines) {
          // Only check a subset of particles for connections to improve performance
          const checkEvery = Math.max(1, Math.floor(particles.length / 20));
          
          for (let i = 0; i < particles.length; i += checkEvery) {
            const p2 = particles[i];
            if (p === p2) continue;
            
            const distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
            const maxDistance = isMobile ? 100 : 150;
            
            if (distance < maxDistance) {
              ctx.beginPath();
              // Extract color values from hex
              const hex = p.color.replace('#', '');
              const r = parseInt(hex.substring(0, 2), 16);
              const g = parseInt(hex.substring(2, 4), 16);
              const b = parseInt(hex.substring(4, 6), 16);
              
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.3 * (1 - distance / maxDistance)})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      });
    };
    
    // Throttled resize handler
    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }, 250); // Wait 250ms after resize ends
    };
    
    window.addEventListener('resize', handleResize);
    animationFrameId.current = requestAnimationFrame(animate);
    setParticlesInitialized(true);
    
    // Cleanup
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    };
  }, [particlesInitialized, options]);

  return null; // Canvas is appended to body directly
});

ParticleBackground.displayName = 'ParticleBackground';

export default ParticleBackground;