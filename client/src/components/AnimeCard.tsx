import { Link } from 'wouter';
import { Anime } from '@shared/types';

interface AnimeCardProps {
  anime: Anime;
  showProgress?: boolean;
  progress?: number;
  episodeNumber?: number;
}

const AnimeCard = ({ anime, showProgress = false, progress = 0, episodeNumber }: AnimeCardProps) => {
  return (
    <Link href={`/anime/${anime.id}`}>
      <div className="rounded-xl overflow-hidden bg-dark-800 transition hover:scale-105 cursor-pointer shadow-md h-full">
        <div className={`${showProgress ? "relative aspect-video" : "aspect-[2/3]"} overflow-hidden`}>
          <img 
            src={anime.thumbnail_url} 
            alt={anime.title} 
            className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
            loading="lazy"
          />
          
          {showProgress && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="w-full bg-gray-700/60 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {episodeNumber && (
            <div className="absolute top-2 right-2 bg-primary/80 text-white text-xs px-2 py-1 rounded-full font-medium">
              EP {episodeNumber}
            </div>
          )}
          
          <div className="absolute top-2 left-2">
            <div className="bg-black/60 text-xs px-2 py-1 rounded-full text-white">
              {anime.genre}
            </div>
          </div>
        </div>
        
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 h-10 mb-1">
            {anime.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-xs text-primary font-medium">{anime.genre}</div>
            <div className="text-xs text-slate-400">
              <i className="fas fa-play-circle mr-1"></i> Watch now
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
