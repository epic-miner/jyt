export interface Anime {
  id: number;
  title: string;
  thumbnail_url: string;
  genre: string;
  description: string;
}

export interface Episode {
  id: number;
  anime_id: number;
  title: string;
  episode_number: number;
  thumbnail_url: string;
  video_url_max_quality: string;
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
