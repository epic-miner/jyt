import { useCallback, useEffect, useState } from 'react';

const ParticleBackground = () => {
  // Using a simpler implementation with vanilla JS for particles
  const [particlesInitialized, setParticlesInitialized] = useState(false);

  useEffect(() => {
    // Only run this effect once
    if (particlesInitialized) return;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.classList.add('fixed', 'inset-0', '-z-10', 'opacity-20');
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
    }> = [];
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dirX: (Math.random() - 0.5) * 0.5,
        dirY: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        color: '#ffffff',
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
        ctx.fill();
        
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
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 150)})`;
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