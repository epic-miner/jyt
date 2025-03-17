import { Link } from 'wouter';

interface GenrePillProps {
  genre: string;
  isActive?: boolean;
  asButton?: boolean;
  onClick?: () => void;
}

const GenrePill = ({ genre, isActive = false, asButton = false, onClick }: GenrePillProps) => {
  const baseClasses = `
    ${isActive 
      ? 'bg-primary text-white shadow-md shadow-primary/20' 
      : 'bg-dark-800/80 text-slate-300 hover:bg-dark-700/90 hover:text-white border border-dark-700/50'} 
    text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200
    flex items-center justify-center whitespace-nowrap
  `;
  
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
