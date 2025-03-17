import { Link } from 'wouter';
import { Anime } from '@shared/types';

interface AnimeCardProps {
  anime: Anime;
  className?: string;
}

const AnimeCard = ({ anime, className }: AnimeCardProps) => {
  return (
    <Link href={`/anime/${anime.id}`} className={className}>
      <div className="relative group cursor-pointer anime-card">
        <div className="aspect-[2/3] rounded-lg overflow-hidden">
          <img 
            src={anime.thumbnail_url} 
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-2">
          <h3 className="text-sm font-medium line-clamp-2 text-white">{anime.title}</h3>
          <p className="text-xs text-gray-300 mt-1">{anime.genre}</p>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;