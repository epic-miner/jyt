export interface Anime {
  id: number;
  title: string;
  thumbnail_url: string;
  genre: string;
  description: string;
  episode_count?: number; // Adding episode count field
}

export interface Episode {
  id: number;
  anime_id: number;
  title: string;
  episode_number: number;
  thumbnail_url: string;
  video_url_max_quality: string;
  video_url_1080p?: string;
  video_url_720p?: string;
  video_url_480p?: string;
  description?: string;
  anime_title?: string;
}

export interface WatchHistoryItem {
  animeId: string;
  episodeId: string;
  title: string;
  episodeNumber: number;
  animeThumbnail: string;
  animeTitle: string;
  progress: number;
  timestamp: number;
}

export interface RecentlyWatchedAnime {
  id: string;
  title: string;
  thumbnail_url: string;
  genre: string;
  timestamp: number;
}