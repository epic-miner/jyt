import { ReactNode } from 'react';
import { Tilt } from 'react-tilt';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltOptions?: {
    scale?: number;
    max?: number;
    speed?: number;
    glare?: boolean;
    maxGlare?: number;
  };
}

const defaultTiltOptions = {
  scale: 1.05,
  max: 15,
  speed: 1000,
  glare: true,
  maxGlare: 0.2,
};

const TiltCard = ({
  children,
  className,
  tiltOptions = defaultTiltOptions,
}: TiltCardProps) => {
  return (
    <Tilt
      options={{
        scale: tiltOptions.scale,
        max: tiltOptions.max,
        speed: tiltOptions.speed,
        glare: tiltOptions.glare,
        maxGlare: tiltOptions.maxGlare,
      }}
      className={cn('h-full w-full transform-gpu', className)}
    >
      {children}
    </Tilt>
  );
};

export default TiltCard;