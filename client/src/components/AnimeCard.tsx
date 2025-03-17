
import { Link } from 'wouter';
import { Anime } from '@shared/types';

interface AnimeCardProps {
  anime: Anime;
  showProgress?: boolean;
  progress?: number;
  episodeNumber?: string;
  showEpisodeLabel?: boolean;
}

const AnimeCard = ({ anime, showProgress, progress, episodeNumber, showEpisodeLabel }: AnimeCardProps) => {
  return (
    <Link href={`/anime/${anime.id}`} className="block">
      <div className="bg-dark-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
        <div className="relative">
          <img 
            src={anime.thumbnail_url} 
            alt={anime.title} 
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Image';
            }}
          />
          {showEpisodeLabel && episodeNumber && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
              EP {episodeNumber}
            </div>
          )}
          {showProgress && progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium truncate">{anime.title}</h3>
          {!showEpisodeLabel && (
            <p className="text-xs text-gray-400 mt-1">{anime.genre || 'Unknown genre'}</p>
          )}
          {showEpisodeLabel && episodeNumber && (
            <p className="text-xs text-gray-400 mt-1">Episode {episodeNumber}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
