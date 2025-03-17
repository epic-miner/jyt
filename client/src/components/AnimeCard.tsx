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
      <div className="rounded-lg overflow-hidden bg-dark-800 transition hover:scale-105 cursor-pointer">
        <div className={`${showProgress ? "relative h-40" : "aspect-w-2 aspect-h-3 h-48"}`}>
          <img 
            src={anime.thumbnail_url} 
            alt={anime.title} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {showProgress && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {episodeNumber && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
              EP {episodeNumber}
            </div>
          )}
        </div>
        
        <div className="p-2">
          <h3 className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
            {anime.title}
          </h3>
          <p className="text-xs text-slate-400">{anime.genre}</p>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
