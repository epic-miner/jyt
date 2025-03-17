import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import AnimeCard from '../components/AnimeCard';
import GenrePill from '../components/GenrePill';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAllAnime } from '../lib/api';
import { getRecentlyWatchedAnime, getWatchHistory } from '../lib/cookies';
import { Anime, RecentlyWatchedAnime, WatchHistoryItem } from '@shared/types';

// Section title component for consistent styling
const SectionTitle = ({ icon, title, viewAllLink, viewAllText = 'View All' }: { 
  icon: string, 
  title: string, 
  viewAllLink?: string,
  viewAllText?: string 
}) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold flex items-center">
      <i className={`fas fa-${icon} mr-2.5 text-primary`}></i> {title}
    </h2>
    {viewAllLink && (
      <Link href={viewAllLink}>
        <span className="text-sm text-primary hover:text-primary/80 transition-colors duration-200 font-medium flex items-center cursor-pointer">
          {viewAllText} <i className="fas fa-chevron-right ml-1 text-xs"></i>
        </span>
      </Link>
    )}
  </div>
);

const Home = () => {
  const [continueWatching, setContinueWatching] = useState<WatchHistoryItem[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<RecentlyWatchedAnime[]>([]);
  
  const { data: animeList, isLoading: isLoadingAnime } = useQuery({
    queryKey: ['/api/anime'],
    queryFn: fetchAllAnime,
  });
  
  useEffect(() => {
    // Get watch history and recently watched from cookies
    const history = getWatchHistory();
    const recents = getRecentlyWatchedAnime();
    
    // Filter out duplicate anime titles by keeping only one entry per anime
    // We'll show only the most recent episode for each anime
    const uniqueAnimeMap = new Map<string, WatchHistoryItem>();
    
    history.forEach(item => {
      if (!uniqueAnimeMap.has(item.animeId) || 
          uniqueAnimeMap.get(item.animeId)!.timestamp < item.timestamp) {
        uniqueAnimeMap.set(item.animeId, item);
      }
    });
    
    // Convert map back to array and sort by timestamp (most recent first)
    const uniqueHistory = Array.from(uniqueAnimeMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);
    
    setContinueWatching(uniqueHistory);
    setRecentlyWatched(recents);
  }, []);
  
  // Extract and process unique genres from the anime list
  const extractGenres = () => {
    if (!animeList) return [];
    
    // Extract all genres and flatten the array
    const genreArrays = animeList.map(anime => 
      anime.genre.split(',').map(g => g.trim())
    );
    
    // Create a Set to get unique genres and convert back to array
    const uniqueGenresSet = new Set(genreArrays.flat());
    return Array.from(uniqueGenresSet).sort((a, b) => a.localeCompare(b));
  };

  const genres = extractGenres();
  
  // Get popular anime (for now, just use the full list)
  const popularAnime = animeList || [];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 pb-24 md:pb-8">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Featured anime section */}
        <section className="mb-12">
          {isLoadingAnime ? (
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Skeleton className="h-[300px] md:h-[450px] w-full rounded-2xl" />
            </div>
          ) : (
            animeList && animeList.length > 0 && (
              <div className="relative rounded-2xl overflow-hidden h-[300px] md:h-[450px] bg-gradient-to-r from-dark-800 to-dark-900 shadow-xl border border-dark-700/40 group">
                <img 
                  src={animeList[0].thumbnail_url} 
                  alt={animeList[0].title} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-all duration-700 scale-105 group-hover:scale-100"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://via.placeholder.com/1200x600?text=Featured+Anime';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:max-w-[600px]">
                  {/* Featured Badge */}
                  <div className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4 inline-block shadow-lg">
                    FEATURED
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-2xl md:text-4xl font-bold mb-3 text-white">
                    {animeList[0].title}
                  </h1>
                  
                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {animeList[0].genre.split(',').map((genre, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-dark-800/60 backdrop-blur-sm text-slate-300 px-2.5 py-1 rounded-full"
                      >
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm md:text-base text-slate-200 mb-6 line-clamp-2 md:line-clamp-3">
                    {animeList[0].description || "Experience the adventure in this featured anime series."}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/anime/${animeList[0].id}`}>
                      <span className="bg-primary hover:bg-primary/90 transition-all duration-300 px-6 py-2.5 rounded-full flex items-center shadow-lg text-sm md:text-base font-medium cursor-pointer">
                        <i className="fas fa-play mr-2"></i> Watch Now
                      </span>
                    </Link>
                    <Link href={`/anime/${animeList[0].id}`}>
                      <span className="bg-dark-800/80 hover:bg-dark-800 transition-all duration-300 px-6 py-2.5 rounded-full shadow-lg text-sm md:text-base font-medium backdrop-blur-sm border border-dark-700/50 hover:border-primary/30 cursor-pointer">
                        <i className="fas fa-info-circle mr-2"></i> Details
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            )
          )}
        </section>
        
        {/* Continue watching section - only show if there are items */}
        {continueWatching.length > 0 && (
          <section className="mb-12">
            <SectionTitle 
              icon="history" 
              title="Continue Watching" 
              viewAllLink="/recently-watched" 
            />
            
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6">
              {continueWatching.slice(0, 6).map((item) => (
                <Link href={`/watch/${item.animeId}/${item.episodeId}`} key={`${item.animeId}-${item.episodeId}`}>
                  <AnimeCard
                    anime={{
                      id: parseInt(item.animeId),
                      title: item.animeTitle,
                      thumbnail_url: item.animeThumbnail,
                      genre: "",
                      description: ""
                    }}
                    showProgress={true}
                    progress={item.progress}
                    episodeNumber={item.episodeNumber}
                    showEpisodeLabel={true}
                  />
                </Link>
              ))}
            </div>
          </section>
        )}
        
        {/* Popular anime section */}
        <section className="mb-12">
          <SectionTitle 
            icon="fire" 
            title="Popular Now" 
            viewAllLink="/search?sort=popular" 
          />
          
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6">
            {isLoadingAnime ? (
              Array(12).fill(0).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-dark-800/60 shadow-md border border-dark-700/30">
                  <Skeleton className="aspect-[2/3] w-full rounded-t-xl" />
                  <div className="p-3">
                    <Skeleton className="h-4 w-3/4 mb-2 rounded-md" />
                    <Skeleton className="h-3 w-1/2 rounded-md" />
                  </div>
                </div>
              ))
            ) : (
              popularAnime.slice(0, 12).map((anime) => (
                <Link href={`/anime/${anime.id}`} key={anime.id}>
                  <AnimeCard anime={anime} />
                </Link>
              ))
            )}
          </div>
        </section>
        
        {/* Genre section */}
        <section className="mb-12">
          <SectionTitle 
            icon="tags" 
            title="Browse by Genre" 
            viewAllLink="/genre/all" 
            viewAllText="All Genres"
          />
          
          <div className="mb-4 overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex flex-nowrap gap-2 min-w-max">
              {isLoadingAnime ? (
                Array(10).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-24 rounded-full" />
                ))
              ) : (
                genres.slice(0, 20).map((genre) => (
                  <GenrePill 
                    key={genre} 
                    genre={genre}
                  />
                ))
              )}
            </div>
          </div>
          
          {/* Genre Grid for larger screens */}
          <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
            {isLoadingAnime ? (
              Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))
            ) : (
              genres.slice(0, 12).map((genre) => (
                <Link 
                  key={genre} 
                  href={`/genre/${encodeURIComponent(genre)}`}
                >
                  <span className="bg-dark-800/70 hover:bg-dark-800 transition-all duration-300 py-4 px-2 rounded-xl shadow-md border border-dark-700/50 hover:border-primary/20 flex items-center justify-center group cursor-pointer">
                    <i className="fas fa-tag mr-2 text-primary/70 group-hover:text-primary transition-colors duration-300"></i>
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors duration-300">{genre}</span>
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
