import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  type: 'star' | 'nebula' | 'dust';
}

export const BackgroundParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate random particles with galaxy theme
    const newParticles = Array.from({ length: 200 }, (_, i) => {
      const type = Math.random() > 0.9 ? 'nebula' : Math.random() > 0.2 ? 'star' : 'dust';
      const size = type === 'nebula' ? Math.random() * 400 + 200 : 
                  type === 'star' ? Math.random() * 6 + 2 :
                  Math.random() * 15 + 5;

      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        duration: Math.random() * 30 + (type === 'nebula' ? 50 : 20),
        delay: Math.random() * 8,
        color: type === 'nebula' ? 'primary' : 'white',
        type
      };
    });
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
      {/* Stars and dust particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${
            particle.type === 'star' 
              ? 'bg-white shadow-[0_0_30px_rgba(255,255,255,1)] animate-pulse' 
              : particle.type === 'nebula'
              ? 'bg-gradient-to-br from-primary/40 to-primary/5 backdrop-blur-sm'
              : 'bg-gradient-to-br from-primary/30 to-transparent'
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: particle.type === 'star' 
              ? [0.3, 1, 0.3] 
              : [0, 0.5, 0],
            scale: particle.type === 'nebula'
              ? [1, 1.3, 1]
              : [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}

      {/* Animated cosmic rays */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            style={{ 
              top: `${15 * (i + 1)}%`,
              transform: `rotate(${Math.random() * 40 - 20}deg)`
            }}
            animate={{
              x: ["-100%", "200%"],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Nebula effects */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/20 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/10 to-transparent animate-pulse delay-1000" />
      </div>
    </div>
  );
};