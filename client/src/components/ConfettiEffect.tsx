import { useCallback, useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '../hooks/useWindowSize';

interface ConfettiEffectProps {
  run?: boolean;
  duration?: number;
  recycle?: boolean;
  numberOfPieces?: number;
  colors?: string[];
  gravity?: number;
}

const ConfettiEffect = ({
  run = true,
  duration = 5000,
  recycle = false,
  numberOfPieces = 200,
  colors,
  gravity = 0.3,
}: ConfettiEffectProps) => {
  const { width, height } = useWindowSize();
  const [isActive, setIsActive] = useState(run);

  // Default anime-theme colors if none provided
  const defaultColors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#FFE66D', // Yellow
    '#1A535C', // Dark Teal
    '#FF9A8B', // Salmon
    '#6A0572', // Purple
    '#AB83A1', // Mauve
    '#F15BB5', // Pink
  ];

  useEffect(() => {
    setIsActive(run);
    
    if (run && !recycle && duration) {
      const timer = setTimeout(() => {
        setIsActive(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [run, recycle, duration]);

  const handleConfettiComplete = useCallback(() => {
    if (!recycle) {
      setIsActive(false);
    }
  }, [recycle]);

  if (!isActive) return null;

  return (
    <Confetti
      width={width}
      height={height}
      numberOfPieces={numberOfPieces}
      recycle={recycle}
      colors={colors || defaultColors}
      gravity={gravity}
      onConfettiComplete={handleConfettiComplete}
    />
  );
};

export default ConfettiEffect;