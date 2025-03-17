import { Link } from 'wouter';
import { Episode } from '@shared/types';
import { getWatchProgressForEpisode } from '../lib/cookies';

interface EpisodeCardProps {
  episode: Episode;
  animeId: string;
}

const EpisodeCard = ({ episode, animeId }: EpisodeCardProps) => {
  // Get watch progress for this episode from cookies
  const progress = getWatchProgressForEpisode(animeId, episode.id.toString());
  
  return (
    <Link href={`/watch/${animeId}/${episode.id}`}>
      <div className="bg-dark-800 rounded-lg overflow-hidden hover:bg-dark-700 transition cursor-pointer">
        <div className="relative h-32">
          <img 
            src={episode.thumbnail_url} 
            alt={`Episode ${episode.episode_number}: ${episode.title}`} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition">
            <div className="bg-primary/80 rounded-full p-3">
              <i className="fas fa-play text-white"></i>
            </div>
          </div>
          <div className="absolute top-2 left-2 bg-dark-900/70 text-white text-xs px-2 py-1 rounded">
            EP {episode.episode_number}
          </div>
          
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm mb-1">{episode.title}</h3>
          <p className="text-xs text-slate-400 line-clamp-2">{episode.description || `Episode ${episode.episode_number} of the anime series`}</p>
        </div>
      </div>
    </Link>
  );
};

export default EpisodeCard;
