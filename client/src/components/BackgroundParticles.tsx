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
    const newParticles = Array.from({ length: 50 }, (_, i) => {
      const type = Math.random() > 0.7 ? 'nebula' : Math.random() > 0.5 ? 'star' : 'dust';
      const size = type === 'nebula' ? Math.random() * 100 + 50 : 
                  type === 'star' ? Math.random() * 4 + 2 :
                  Math.random() * 10 + 5;

      const color = type === 'nebula' ? 'primary' :
                   type === 'star' ? 'white' : 'primary';

      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        duration: Math.random() * 20 + (type === 'nebula' ? 30 : 10),
        delay: Math.random() * 5,
        color,
        type
      };
    });
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Stars and dust particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${
            particle.type === 'star' 
              ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
              : particle.type === 'nebula'
              ? 'bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm'
              : 'bg-gradient-to-br from-primary/10 to-transparent'
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
              ? [0.2, 1, 0.2] 
              : [0, 0.3, 0],
            scale: particle.type === 'nebula'
              ? [1, 1.2, 1]
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
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            style={{ 
              top: `${20 * (i + 1)}%`,
              transform: `rotate(${Math.random() * 30 - 15}deg)`
            }}
            animate={{
              x: ["-100%", "200%"],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 3,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Nebula effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent animate-pulse delay-1000" />
      </div>
    </div>
  );
};