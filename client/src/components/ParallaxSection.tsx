import { ReactNode } from 'react';
import { Parallax } from 'react-parallax';
import { cn } from '@/lib/utils';

interface ParallaxSectionProps {
  children: ReactNode;
  bgImage: string;
  strength?: number;
  blur?: number;
  className?: string;
  bgClassName?: string;
  overlay?: ReactNode;
}

const ParallaxSection = ({
  children,
  bgImage,
  strength = 300,
  blur = 0,
  className,
  bgClassName,
  overlay
}: ParallaxSectionProps) => {
  return (
    <Parallax
      bgImage={bgImage}
      strength={strength}
      bgImageStyle={{
        objectFit: 'cover',
        width: '100%',
        height: '100%',
        filter: blur ? `blur(${blur}px)` : 'none',
      }}
      className={cn('overflow-hidden', bgClassName)}
      renderLayer={(percentage) => (
        <div
          style={{
            position: 'absolute',
            background: `rgba(0, 0, 0, ${0.2 + percentage * 0.3})`,
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
          }}
        />
      )}
    >
      {overlay && (
        <div className="absolute inset-0 z-10">
          {overlay}
        </div>
      )}
      <div className={cn('relative z-20', className)}>
        {children}
      </div>
    </Parallax>
  );
};

export default ParallaxSection;