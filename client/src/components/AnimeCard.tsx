import { Link } from 'wouter';
import { Anime } from '@shared/types';
import { PlayCircle } from 'lucide-react';

interface AnimeCardProps {
  anime: Anime;
  className?: string;
  episodeCount?: number;
  rating?: number;
  progress?: number;
  showProgress?: boolean;
  onQuickPlay?: () => void;
}

const AnimeCard = ({ 
  anime, 
  className,
  episodeCount,
  rating,
  progress,
  showProgress = false,
  onQuickPlay 
}: AnimeCardProps) => {
  return (
    <Link href={`/anime/${anime.id}`} className={className}>
      <div className="relative group cursor-pointer glass-effect transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20">
        {/* Main Image Container */}
        <div className="aspect-[2/3] rounded-lg overflow-hidden relative">
          <img 
            src={anime.thumbnail_url} 
            alt={anime.title}
            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            {onQuickPlay && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    onQuickPlay();
                  }}
                  className="bg-primary/90 hover:bg-primary text-white p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 button-hover"
                >
                  <PlayCircle className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {/* Episode count badge */}
          {episodeCount !== undefined && (
            <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full animate-float">
              {episodeCount} {episodeCount === 1 ? 'Episode' : 'Episodes'}
            </div>
          )}

          {/* Rating badge */}
          {rating && (
            <div className="absolute top-2 left-2 bg-primary/80 text-white text-xs px-2 py-1 rounded-full flex items-center group-hover:bg-primary transition-colors duration-300">
              <i className="fas fa-star mr-1 text-yellow-400"></i>
              {rating.toFixed(1)}
            </div>
          )}

          {/* Progress bar */}
          {showProgress && progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/80 backdrop-blur-sm">
              <div 
                className="h-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Title and Genre */}
        <div className="mt-2 p-2 transform transition-all duration-300 group-hover:translate-x-1">
          <h3 className="text-sm font-medium line-clamp-2 text-white/90 group-hover:text-white">
            {anime.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-300">
            {anime.genre.split(',')[0]} {/* Show only the first genre to keep it clean */}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;