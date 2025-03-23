declare module 'color-thief-node' {
  export function getColorFromURL(imageUrl: string, colorCount?: number): Promise<number[][]>;
  export function getColor(imageData: Buffer): number[];
  export function getPalette(imageData: Buffer, colorCount?: number): number[][];
}