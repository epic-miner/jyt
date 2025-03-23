import { ReactNode } from 'react';
import { Parallax } from 'react-parallax';
import { cn } from '@/lib/utils';

interface ParallaxSectionProps {
  bgImage?: string;
  strength?: number;
  className?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  height?: string;
  children: ReactNode;
  blur?: boolean | number;
  disabled?: boolean;
  contentClassName?: string;
  speed?: number; // Added for scrolling speed control
}

const ParallaxSection = ({
  bgImage,
  strength = 300,
  className,
  overlayColor = 'rgba(0, 0, 0, 0.6)',
  overlayOpacity = 0.6,
  height = '500px',
  children,
  blur = false,
  disabled = false,
  contentClassName,
  speed = 0.5,
}: ParallaxSectionProps) => {
  // Calculate blur amount
  const blurAmount = typeof blur === 'number' ? `${blur}px` : blur ? '4px' : '0';
  
  // Create overlay style with specified color and opacity
  const overlayStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: overlayColor,
    opacity: overlayOpacity,
    zIndex: 1,
  };
  
  // Create content style for positioning
  const contentStyle = {
    position: 'relative' as const,
    height: '100%',
    width: '100%',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
  };

  // If parallax is disabled or no background image, render a simpler version
  if (disabled || !bgImage) {
    return (
      <div 
        className={cn('relative', className)}
        style={{ 
          backgroundImage: bgImage ? `url(${bgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height,
          filter: bgImage ? `blur(${blurAmount})` : 'none',
        }}
      >
        {bgImage && <div style={overlayStyle} />}
        <div 
          style={contentStyle}
          className={cn(contentClassName)}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <Parallax
      bgImage={bgImage}
      strength={strength}
      className={cn('', className)}
      bgImageStyle={{ 
        objectFit: 'cover', 
        filter: `blur(${blurAmount})`,
      }}
      renderLayer={percentage => (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transform: `translateY(${percentage * speed * 100}px)`,
          }}
        />
      )}
    >
      <div style={{ height }}>
        <div style={overlayStyle} />
        <div 
          style={contentStyle}
          className={cn(contentClassName)}
        >
          {children}
        </div>
      </div>
    </Parallax>
  );
};

export default ParallaxSection;