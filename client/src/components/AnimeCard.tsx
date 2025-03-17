import { Link } from 'wouter';
import { Anime } from '@shared/types';

interface AnimeCardProps {
  anime: Anime;
}

const AnimeCard = ({ anime }: AnimeCardProps) => {
  return (
    <Link to={`/anime/${anime.id}`} className="block">
      <div className="bg-dark-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
        <img 
          src={anime.coverImage} 
          alt={anime.title} 
          className="w-full h-48 object-cover"
        />
        <div className="p-3">
          <h3 className="text-sm font-medium truncate">{anime.title}</h3>
          <p className="text-xs text-gray-400 mt-1">{anime.year || 'Unknown'}</p>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;