import { Link } from 'wouter';

interface GenrePillProps {
  genre: string;
  isActive?: boolean;
  asButton?: boolean;
  onClick?: () => void;
}

const GenrePill = ({ genre, isActive = false, asButton = false, onClick }: GenrePillProps) => {
  const baseClasses = `${isActive 
    ? 'bg-primary text-white' 
    : 'bg-dark-700 text-slate-300 hover:bg-dark-600'} 
    text-xs px-2.5 py-1 rounded transition`;
  
  if (asButton) {
    return (
      <button 
        className={baseClasses}
        onClick={onClick}
      >
        {genre}
      </button>
    );
  }
  
  return (
    <Link href={`/genre/${encodeURIComponent(genre)}`}>
      <span className={baseClasses}>
        {genre}
      </span>
    </Link>
  );
};

export default GenrePill;
