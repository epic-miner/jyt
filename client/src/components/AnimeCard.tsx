import { Link } from 'wouter';
import { Anime } from '@shared/types';

interface AnimeCardProps {
  anime: Anime;
  showProgress?: boolean;
  progress?: number;
  episodeNumber?: number;
}

const AnimeCard = ({ anime, showProgress = false, progress = 0, episodeNumber }: AnimeCardProps) => {
  // Function to extract the first genre for the badge
  const primaryGenre = anime.genre.split(',')[0].trim();
  
  return (
    <Link href={`/anime/${anime.id}`}>
      <div className="group rounded-xl overflow-hidden bg-dark-800/70 hover:bg-dark-800 transition-all duration-300 shadow hover:shadow-lg hover:shadow-dark-900/10 cursor-pointer h-full border border-dark-700/30 hover:border-primary/20">
        {/* Image container */}
        <div className={`${showProgress ? "relative aspect-video" : "aspect-[2/3]"} overflow-hidden bg-dark-700`}>
          <img 
            src={anime.thumbnail_url} 
            alt={anime.title} 
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Image';
            }}
          />
          
          {/* Progress bar */}
          {showProgress && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-white font-medium">
                  {Math.round(progress)}% completed
                </div>
                {episodeNumber && (
                  <div className="text-xs text-gray-300">Episode {episodeNumber}</div>
                )}
              </div>
              <div className="w-full bg-gray-700/60 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full shadow-sm transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Episode badge */}
          {episodeNumber && !showProgress && (
            <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
              EP {episodeNumber}
            </div>
          )}
          
          {/* Genre badge */}
          <div className="absolute top-2 left-2">
            <div className="bg-black/70 backdrop-blur-sm text-xs px-2.5 py-1 rounded-full text-white font-medium shadow-sm">
              {primaryGenre}
            </div>
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-primary/90 rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
              <i className="fas fa-play text-white text-lg"></i>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 h-10 mb-1.5 group-hover:text-white transition-colors duration-300">
            {anime.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-xs text-primary/90 group-hover:text-primary font-medium transition-colors duration-300">
              {anime.genre.split(',').length > 1 ? `${anime.genre.split(',').length} genres` : primaryGenre}
            </div>
            <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
              <i className="fas fa-play-circle mr-1"></i> Watch now
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
