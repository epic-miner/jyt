import { useEffect, useState } from 'react';
import TextTransition, { presets } from 'react-text-transition';
import { TypeAnimation } from 'react-type-animation';
import { cn } from '@/lib/utils';

interface AnimatedTitleProps {
  text: string;
  className?: string;
  preset?: 'default' | 'typewriter' | 'gradient' | 'sliding';
  typeSpeed?: number;
  slideTexts?: string[];
  slideDuration?: number;
}

const AnimatedTitle = ({
  text,
  className,
  preset = 'default',
  typeSpeed = 50,
  slideTexts = [],
  slideDuration = 3000,
}: AnimatedTitleProps) => {
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    if (preset === 'sliding' && slideTexts.length > 0) {
      const intervalId = setInterval(
        () => setIndex((i) => (i + 1) % slideTexts.length),
        slideDuration
      );
      return () => clearInterval(intervalId);
    }
  }, [preset, slideTexts, slideDuration]);

  if (preset === 'typewriter') {
    return (
      <TypeAnimation
        sequence={[text]}
        wrapper="h2"
        speed={typeSpeed}
        className={className}
        cursor={false}
      />
    );
  }

  if (preset === 'sliding' && slideTexts.length > 0) {
    return (
      <h2 className={className}>
        <TextTransition springConfig={presets.wobbly}>
          {slideTexts[index]}
        </TextTransition>
      </h2>
    );
  }

  if (preset === 'gradient') {
    return (
      <h2 
        className={cn(
          'bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent bg-size-200 animate-gradient-x', 
          className
        )}
      >
        {text}
      </h2>
    );
  }

  // Default animation with subtle fade
  return (
    <h2 
      className={cn('animate-fadein', className)} 
      style={{ animationDuration: '0.8s' }}
    >
      {text}
    </h2>
  );
};

export default AnimatedTitle;