import { ReactNode, useState } from 'react';
import { Tilt } from 'react-tilt';
import { cn } from '@/lib/utils';

interface TiltOptions {
  max?: number;
  scale?: number;
  speed?: number;
  glare?: boolean;
  maxGlare?: number;
  perspective?: number;
  easing?: string;
  reset?: boolean;
  transition?: boolean;
  axis?: 'x' | 'y' | null;
  gyroscope?: boolean;
  mouse?: boolean;
}

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltOptions?: TiltOptions;
  options?: TiltOptions; // Added for compatibility with ScrollableCard
  shadow?: boolean;
  hoverEffect?: 'lift' | 'glow' | 'none';
  glowColor?: string;
  wrapperClassName?: string;
  disabled?: boolean;
}

const TiltCard = ({
  children,
  className,
  tiltOptions = {},
  options: optionsProp = {}, // Support options prop for compatibility
  shadow = true,
  hoverEffect = 'none',
  glowColor = 'rgba(130, 87, 230, 0.4)', // Default purple glow
  wrapperClassName,
  disabled = false,
}: TiltCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Default tilt options
  const defaultOptions = {
    max: 10,
    scale: 1.05,
    speed: 1000,
    glare: false,
    maxGlare: 0.5,
    perspective: 1000,
    easing: 'cubic-bezier(.03,.98,.52,.99)',
    reset: true,
    transition: true,
    axis: null as 'x' | 'y' | null,
    gyroscope: true,
    mouse: true,
  };
  
  // Merge user options with defaults - use either tiltOptions or options prop
  const mergedOptions = { ...defaultOptions, ...tiltOptions, ...optionsProp };
  
  // Determine the shadow class based on hover state and shadow prop
  const shadowClass = shadow && isHovered
    ? 'shadow-lg shadow-primary/20 dark:shadow-primary/15'
    : shadow
      ? 'shadow-md'
      : '';
  
  // Determine hover effect style
  const hoverEffectStyle = isHovered ? 
    hoverEffect === 'glow' ? 
      { boxShadow: `0 0 20px ${glowColor}` } : 
      {} : 
    {};
  
  // Determine transition class based on options
  const transitionClass = mergedOptions.transition ? 'transition-all duration-300' : '';
  
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  
  // If disabled, just return the content without tilt effect
  if (disabled) {
    return (
      <div 
        className={cn('relative', wrapperClassName)} 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className={cn(
            transitionClass,
            shadowClass,
            'transform',
            { 'translate-y-[-5px]': isHovered && hoverEffect === 'lift' },
            className
          )}
          style={hoverEffectStyle}
        >
          {children}
        </div>
      </div>
    );
  }
  
  // With tilt effect
  return (
    <div 
      className={cn('relative', wrapperClassName)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Tilt
        options={mergedOptions}
        className={cn(
          transitionClass,
          shadowClass,
          'transform',
          { 'will-change-transform': mergedOptions.transition },
          { 'hover:translate-y-[-5px]': hoverEffect === 'lift' },
          className
        )}
        style={hoverEffectStyle}
      >
        {children}
      </Tilt>
    </div>
  );
};

export default TiltCard;