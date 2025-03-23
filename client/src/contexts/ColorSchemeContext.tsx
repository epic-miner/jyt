import { createContext, useContext, useEffect, useState } from 'react';
import { createColorScheme, extractDominantColor } from '../lib/colorExtractor';

// Define the color scheme type
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  buttonBackground: string;
  buttonHover: string;
  controlsBackground: string;
}

// Default color scheme
const defaultColorScheme: ColorScheme = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#e94560',
  text: '#ffffff',
  background: '#0f3460',
  buttonBackground: '#202040',
  buttonHover: '#2a2a5a',
  controlsBackground: '#1a1a2e80',
};

// Context type definition
interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  updateColorScheme: (imageUrl: string) => Promise<void>;
  isLoading: boolean;
}

// Create the context
const ColorSchemeContext = createContext<ColorSchemeContextType>({
  colorScheme: defaultColorScheme,
  updateColorScheme: async () => {},
  isLoading: false,
});

// Hook for using the color scheme context
export function useColorScheme() {
  return useContext(ColorSchemeContext);
}

// Provider component
export const ColorSchemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(defaultColorScheme);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateColorScheme = async (imageUrl: string) => {
    if (!imageUrl) return;
    
    setIsLoading(true);
    try {
      const dominantColor = await extractDominantColor(imageUrl);
      const newColorScheme = createColorScheme(dominantColor);
      setColorScheme(newColorScheme);
    } catch (error) {
      console.error('Error updating color scheme:', error);
      // Fallback to default if extraction fails
      setColorScheme(defaultColorScheme);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, updateColorScheme, isLoading }}>
      {children}
    </ColorSchemeContext.Provider>
  );
};

export default ColorSchemeProvider;