import { useCallback, useEffect, useState } from 'react';

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

const ParticleBackground = ({ options }: ParticleBackgroundProps) => {
  // Using a simpler implementation with vanilla JS for particles
  const [particlesInitialized, setParticlesInitialized] = useState(false);

  useEffect(() => {
    // Only run this effect once
    if (particlesInitialized) return;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.classList.add('fixed', 'inset-0', '-z-10');
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
    const particleCount = options?.particles?.number?.value || 50;
    const particleColor = options?.particles?.color?.value || '#ffffff';
    const particleOpacity = options?.particles?.opacity?.value || 0.2;
    const particleSize = options?.particles?.size?.value || 2;
    const moveSpeed = options?.particles?.move?.speed || 0.5;
    
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
    
    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
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
        
        // Draw lines between close particles
        particles.forEach((p2) => {
          const distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
          if (distance < 150) {
            ctx.beginPath();
            // Extract color values from hex
            const hex = p.color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.5 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
    };
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    animate();
    setParticlesInitialized(true);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.removeChild(canvas);
    };
  }, [particlesInitialized]);

  return null; // Canvas is appended to body directly
};

export default ParticleBackground;