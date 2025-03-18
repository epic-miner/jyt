import { Link } from 'wouter';
import { Anime } from '@shared/types';
import { PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const isContinueWatching = className?.includes('continue-watching-card');

  return (
    <Link href={`/anime/${anime.id}`} className={cn("block", className)}>
      <div className={cn(
        "relative group cursor-pointer glass-effect transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 hover:ring-2 hover:ring-primary/30", // Added glow effect
        isContinueWatching && "border-primary/30" // Special border for continue watching
      )}>
        {/* Main Image Container with aspect ratio */}
        <div className={cn(
          "rounded-xl overflow-hidden relative", // Changed from rounded-lg to rounded-xl
          isContinueWatching ? "aspect-[3/4]" : "aspect-[2/3]" // Different aspect ratio for continue watching
        )}>
          <img 
            src={anime.thumbnail_url} 
            alt={anime.title}
            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/placeholder.jpg';
            }}
          />

          {/* Overlay on hover */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
            "opacity-0 group-hover:opacity-100 transition-all duration-300",
            isContinueWatching && "from-primary/40" // Special gradient for continue watching
          )}>
            {onQuickPlay && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    onQuickPlay();
                  }}
                  className={cn(
                    "bg-primary/90 hover:bg-primary text-white p-2.5 rounded-full",
                    "transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110",
                    isContinueWatching && "shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                  )}
                >
                  <PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            )}
          </div>

          {/* Episode count badge */}
          {episodeCount !== undefined && (
            <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
              {episodeCount} {episodeCount === 1 ? 'EP' : 'EPS'}
            </div>
          )}

          {/* Rating badge */}
          {rating && (
            <div className="absolute top-2 left-2 bg-primary/80 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full flex items-center">
              <i className="fas fa-star mr-1 text-yellow-400"></i>
              {rating.toFixed(1)}
            </div>
          )}

          {/* Progress bar with enhanced visual effects for continue watching */}
          {showProgress && progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/80 backdrop-blur-sm">
              <div 
                className={cn(
                  "h-full transition-all duration-700 ease-out",
                  isContinueWatching 
                    ? "bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
                    : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              >
                {isContinueWatching && (
                  <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-45 animate-shimmer"></div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Title and Genre - Compact for mobile and continue watching */}
        <div className={cn(
          "transform transition-all duration-300 group-hover:translate-x-1",
          isContinueWatching 
            ? "h-[2rem] p-1 md:p-1.5" 
            : "h-[2.5rem] md:h-[4.5rem] p-1.5 md:p-2"
        )}>
          <h3 className={cn(
            "font-medium line-clamp-1 text-white/90 group-hover:text-white",
            isContinueWatching ? "text-[10px] md:text-xs" : "text-xs md:text-sm md:line-clamp-2"
          )}>
            {anime.title}
          </h3>
          {!isContinueWatching && (
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1 truncate group-hover:text-gray-300">
              {anime.genre.split(',')[0]} {/* Show only the first genre to keep it clean */}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;