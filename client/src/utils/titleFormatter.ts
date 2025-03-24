/**
 * Utility function for cleaning anime titles
 * Removes category tags (T, LR, P) and numerical rankings from titles
 * 
 * Examples:
 * - "Naruto (T)" => "Naruto"
 * - "One Piece (P)-(1)" => "One Piece"
 * - "Attack on Titan (LR)-(5)" => "Attack on Titan"
 */

/**
 * Removes category tags and numerical rankings from anime titles
 * @param title The original anime title with possible tags
 * @returns The cleaned title without any tags
 */
export const cleanAnimeTitle = (title: string): string => {
  // Remove all category tags like (T), (P), (LR) with optional ranking like (T)-(1)
  return title.replace(/\(T\)(?:-\(\d+\))?|\(LR\)(?:-\(\d+\))?|\(P\)(?:-\(\d+\))?/g, '').trim();
};

/**
 * Extracts the category tag from an anime title
 * @param title The original anime title with possible tags
 * @returns The category tag (T, LR, P) or null if not found
 */
export const extractCategoryTag = (title: string): string | null => {
  const match = title.match(/\((T|LR|P)\)/);
  return match ? match[1] : null;
};

/**
 * Extracts the numerical ranking from an anime title if available
 * @param title The original anime title with possible tags
 * @returns The numerical ranking or null if not found
 */
export const extractRanking = (title: string): number | null => {
  const match = title.match(/\((T|LR|P)\)-\((\d+)\)/);
  return match ? parseInt(match[2]) : null;
};