import { Anime, Episode } from '@shared/types';
import { api } from './axiosConfig';

// Cache management with timeout for efficiency
const apiCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * A cached version of the API get method to improve performance
 * @param url The API endpoint URL
 * @param bypassCache Force a fresh API call, bypassing cache
 * @returns Promise with the data response
 */
const cachedApiGet = async (url: string, bypassCache = false): Promise<any> => {
  try {
    const cacheKey = url;
    const now = Date.now();
    
    // Check if we have a valid cached response
    if (!bypassCache && apiCache.has(cacheKey)) {
      const cachedData = apiCache.get(cacheKey)!;
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log(`Using cached data for ${url}`);
        return cachedData.data;
      } else {
        // Cache expired, remove it
        apiCache.delete(cacheKey);
      }
    }
    
    // Fetch fresh data
    const response = await api.get(url);
    
    // Cache the response
    apiCache.set(cacheKey, {
      data: response.data,
      timestamp: now
    });
    
    return response.data;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

/**
 * Fetch all anime with optional cache control
 */
export const fetchAllAnime = async (bypassCache = false): Promise<Anime[]> => {
  try {
    return await cachedApiGet('/anime', bypassCache);
  } catch (error) {
    console.error('Error fetching anime:', error);
    throw error;
  }
};

/**
 * Fetch a specific anime by ID with optional cache control
 */
export const fetchAnimeById = async (id: string, bypassCache = false): Promise<Anime> => {
  try {
    return await cachedApiGet(`/anime/${id}`, bypassCache);
  } catch (error) {
    console.error(`Error fetching anime with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch episodes for an anime with optional cache control
 */
export const fetchEpisodesByAnimeId = async (animeId: string, bypassCache = false): Promise<Episode[]> => {
  try {
    return await cachedApiGet(`/episodes?anime_id=${animeId}`, bypassCache);
  } catch (error) {
    console.error(`Error fetching episodes for anime ID ${animeId}:`, error);
    throw error;
  }
};

/**
 * Fetch a specific episode by ID with optional cache control
 */
export const fetchEpisodeById = async (id: string, bypassCache = false): Promise<Episode> => {
  try {
    return await cachedApiGet(`/episodes/${id}`, bypassCache);
  } catch (error) {
    console.error(`Error fetching episode with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Search for anime with optional cache control
 */
export const searchAnime = async (query: string, type: string = 'all', bypassCache = false): Promise<Anime[]> => {
  try {
    const data = await cachedApiGet(`/search?q=${query}&type=${type}`, bypassCache);
    
    // Check if response has the expected structure
    if (data && data.results && data.results.anime) {
      return data.results.anime;
    } else if (Array.isArray(data)) {
      return data;
    }
    
    console.warn('Search API response format unexpected:', data);
    return [];
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
};

/**
 * Fetch anime by genre with optional cache control
 */
export const fetchAnimeByGenre = async (genre: string, bypassCache = false): Promise<Anime[]> => {
  try {
    const data = await cachedApiGet(`/search?genre=${genre}&type=anime`, bypassCache);
    
    // Check if response has the expected structure
    if (data && data.results && data.results.anime) {
      return data.results.anime;
    } else if (Array.isArray(data)) {
      // Handle case where API returns a direct array
      return data;
    }
    
    // Fallback to empty array if data structure doesn't match
    console.warn('Genre search API response format unexpected:', data);
    return [];
  } catch (error) {
    console.error('Error fetching anime by genre:', error);
    throw error;
  }
};

/**
 * Clear the API cache (useful on logout or when refreshing data)
 */
export const clearApiCache = (): void => {
  apiCache.clear();
  console.log('API cache cleared');
};

export default {
  fetchAllAnime,
  fetchAnimeById,
  fetchEpisodesByAnimeId,
  fetchEpisodeById,
  searchAnime,
  fetchAnimeByGenre,
  clearApiCache,
};