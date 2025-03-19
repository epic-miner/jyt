import { Link } from 'wouter';
import { Episode } from '@shared/types';
import { getWatchProgressForEpisode } from '../lib/cookies';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface EpisodeCardProps {
  episode: Episode;
  animeId: string;
}

// Using memo to prevent unnecessary re-renders
const EpisodeCard = memo(({ episode, animeId }: EpisodeCardProps) => {
  // Get watch progress for this episode from cookies
  const progress = useMemo(() => 
    getWatchProgressForEpisode(animeId, episode.id.toString()), 
    [animeId, episode.id]
  );

  // Memoize derivations from props to avoid recalculating on every render
  const episodeTitle = useMemo(() => episode.title, [episode.title]);
  
  const episodeDescription = useMemo(() => 
    episode.description || `Episode ${episode.episode_number} of the anime series`,
    [episode.description, episode.episode_number]
  );
  
  const episodeAlt = useMemo(() => 
    `Episode ${episode.episode_number}: ${episode.title}`,
    [episode.episode_number, episode.title]
  );

  const episodeUrl = useMemo(() => 
    `/watch/${animeId}/${episode.id}`,
    [animeId, episode.id]
  );

  // Memoize styles that depend on progress to avoid rebuilding on every render
  const progressBarStyle = useMemo(() => ({ width: `${progress}%` }), [progress]);

  // Handle image error with useMemo to prevent recreating the function on each render
  const handleImageError = useMemo(() => (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/images/placeholder.jpg';
  }, []);

  return (
    <Link href={episodeUrl}>
      <div className="bg-dark-800/60 rounded-lg overflow-hidden hover:bg-dark-700/60 transition-all duration-300 cursor-pointer group border border-dark-700/30 hover:border-primary/20 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <img 
              src={episode.thumbnail_url} 
              alt={episodeAlt} 
              className="w-full h-full object-cover transform transition-all duration-700 ease-out group-hover:scale-105 group-hover:filter group-hover:brightness-110"
              loading="lazy"
              onError={handleImageError}
              width="640"  // Add explicit dimensions to reduce Cumulative Layout Shift
              height="360"
            />
          </AspectRatio>

          {/* Enhanced overlay with stronger gradient - GPU accelerated */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-90 transition-all duration-500 ease-out will-change-transform">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out will-change-opacity"></div>
          </div>

          {/* Play button with enhanced neon effect - GPU accelerated */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-primary rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.8)] hover:scale-110 will-change-transform">
              <i className="fas fa-play text-white group-hover:animate-pulse"></i>
            </div>
          </div>

          {/* Episode number badge with neon effect */}
          <div className="absolute top-2 left-2 bg-dark-900/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm border border-white/10 group-hover:border-primary/30 transition-all duration-300 group-hover:shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]">
            EP {episode.episode_number}
          </div>

          {/* Progress bar with enhanced visual effects - GPU accelerated */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
              <div className="w-full bg-gray-700/50 rounded-full h-1 overflow-hidden backdrop-blur-sm">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)] group-hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.7)] will-change-transform" 
                  style={progressBarStyle}
                >
                  {/* Animated glow effect */}
                  <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-45 animate-shimmer"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Episode info with enhanced hover effects */}
        <div className="p-4 backdrop-blur-sm">
          <h3 className="font-medium text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-white group-hover:bg-clip-text group-hover:text-transparent">
            {episodeTitle}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 group-hover:text-slate-300 transition-colors duration-300">
            {episodeDescription}
          </p>
        </div>
      </div>
    </Link>
  );
});

// Add display name for debugging purposes
EpisodeCard.displayName = 'EpisodeCard';

export default EpisodeCard;