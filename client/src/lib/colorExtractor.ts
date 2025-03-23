import { getColorFromURL } from 'color-thief-node';

/**
 * Extracts dominant color from an image URL
 * @param imageUrl URL of the image to extract color from
 * @returns Promise resolving to a color in hex format (#RRGGBB)
 */
export async function extractDominantColor(imageUrl: string): Promise<string> {
  try {
    // Fetch the dominant RGB color - just take the first color from the palette
    const colorPalette = await getColorFromURL(imageUrl, 1);
    const dominantColor = colorPalette[0];
    
    // Convert RGB array to hex
    return rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]);
  } catch (error) {
    console.error('Error extracting color from image:', error);
    // Default fallback color if extraction fails
    return '#1a1a2e'; 
  }
}

/**
 * Extracts a palette of colors from an image URL
 * @param imageUrl URL of the image to extract colors from
 * @param colorCount Number of colors to extract
 * @returns Promise resolving to an array of colors in hex format
 */
export async function extractColorPalette(imageUrl: string, colorCount: number = 5): Promise<string[]> {
  try {
    // Get color palette (multiple colors)
    const palette = await getColorFromURL(imageUrl, colorCount);
    
    // Convert each RGB array to hex
    return palette.map((color: number[]) => rgbToHex(color[0], color[1], color[2]));
  } catch (error) {
    console.error('Error extracting color palette from image:', error);
    // Return default palette if extraction fails
    return ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483'];
  }
}

/**
 * Converts RGB values to hex color code
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Determines if a color is dark or light
 * @param hexColor Hex color code
 * @returns Boolean: true if color is dark, false if light
 */
export function isDarkColor(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate perceived brightness using the formula
  // (0.299*R + 0.587*G + 0.114*B)
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
  
  // If brightness is less than 128, color is considered dark
  return brightness < 128;
}

/**
 * Generates a contrasting text color (black or white) based on background color
 * @param bgColor Background color in hex format
 * @returns White (#ffffff) for dark backgrounds, Black (#000000) for light backgrounds
 */
export function getContrastingTextColor(bgColor: string): string {
  return isDarkColor(bgColor) ? '#ffffff' : '#000000';
}

/**
 * Creates an adjusted color by lightening or darkening the input color
 * @param color The base color in hex format
 * @param percent Positive values lighten, negative values darken
 * @returns The adjusted color in hex format
 */
export function adjustColor(color: string, percent: number): string {
  const hex = color.replace('#', '');
  
  // Convert hex to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust each component
  r = Math.min(255, Math.max(0, Math.round(r + (percent * 2.55))));
  g = Math.min(255, Math.max(0, Math.round(g + (percent * 2.55))));
  b = Math.min(255, Math.max(0, Math.round(b + (percent * 2.55))));
  
  // Convert back to hex
  return rgbToHex(r, g, b);
}

/**
 * Creates a color scheme based on a dominant color
 * @param dominantColor The main color to base the scheme on
 * @returns An object with various colors for different UI elements
 */
export function createColorScheme(dominantColor: string) {
  const isDark = isDarkColor(dominantColor);
  const textColor = getContrastingTextColor(dominantColor);
  
  return {
    primary: dominantColor,
    secondary: adjustColor(dominantColor, isDark ? 20 : -20),
    accent: adjustColor(dominantColor, isDark ? -30 : 30),
    text: textColor,
    background: adjustColor(dominantColor, isDark ? -40 : 40),
    buttonBackground: adjustColor(dominantColor, isDark ? 10 : -10),
    buttonHover: adjustColor(dominantColor, isDark ? 20 : -20),
    controlsBackground: `${dominantColor}80`, // 50% opacity
  };
}