import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AnimeCard from '../components/AnimeCard';
import GenrePill from '../components/GenrePill';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAllAnime } from '../lib/api';
import { getRecentlyWatchedAnime, getWatchHistory } from '../lib/cookies';
import { Anime, RecentlyWatchedAnime, WatchHistoryItem } from '@shared/types';

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
    
    setContinueWatching(history);
    setRecentlyWatched(recents);
  }, []);
  
  // Extract unique genres from the anime list
  const allGenres = animeList ? [...new Set(animeList.map(anime => anime.genre))] : [];
  
  // Get popular anime (for now, just use the full list - in a real app we might have a popularity metric)
  const popularAnime = animeList || [];
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Featured anime section */}
      <section className="mb-10">
        {isLoadingAnime ? (
          <Skeleton className="relative rounded-xl overflow-hidden h-[300px] md:h-[400px] lg:h-[500px]" />
        ) : (
          animeList && animeList.length > 0 && (
            <div className="relative rounded-xl overflow-hidden h-[300px] md:h-[400px] lg:h-[500px] bg-gradient-to-r from-dark-800 to-dark-900">
              <img 
                src={animeList[0].thumbnail_url} 
                alt={animeList[0].title} 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-2/3">
                <span className="bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-md mb-3 inline-block">FEATURED</span>
                <h1 className="text-2xl md:text-4xl font-bold mb-2 text-white">{animeList[0].title}</h1>
                <p className="text-sm md:text-base text-slate-300 mb-4 line-clamp-2 md:line-clamp-3">
                  {animeList[0].description}
                </p>
                <div className="flex space-x-4">
                  <a href={`/anime/${animeList[0].id}`} className="bg-primary hover:bg-primary/90 transition px-6 py-2 rounded-full flex items-center">
                    <i className="fas fa-play mr-2"></i> Watch Now
                  </a>
                  <a href={`/anime/${animeList[0].id}`} className="bg-dark-700 hover:bg-dark-700/90 transition px-6 py-2 rounded-full">
                    <i className="fas fa-info-circle mr-2"></i> Details
                  </a>
                </div>
              </div>
            </div>
          )
        )}
      </section>
      
      {/* Continue watching section - only show if there are items */}
      {continueWatching.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <i className="fas fa-history mr-2 text-primary"></i> Continue Watching
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {continueWatching.map((item) => (
              <a href={`/watch/${item.animeId}/${item.episodeId}`} key={`${item.animeId}-${item.episodeId}`} className="block">
                <div className="rounded-lg overflow-hidden bg-dark-800 transition hover:scale-105 cursor-pointer">
                  <div className="relative h-40">
                    <img 
                      src={item.animeThumbnail} 
                      alt={item.animeTitle} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                      EP {item.episodeNumber}
                    </div>
                  </div>
                  <div className="p-2">
                    <h3 className="font-medium text-sm">{item.animeTitle}</h3>
                    <p className="text-xs text-slate-400">Episode {item.episodeNumber}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
      
      {/* Popular anime section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <i className="fas fa-fire mr-2 text-primary"></i> Popular Now
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoadingAnime ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-2">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : (
            popularAnime.slice(0, 12).map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))
          )}
        </div>
      </section>
      
      {/* Genre section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <i className="fas fa-tags mr-2 text-primary"></i> Browse by Genre
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {isLoadingAnime ? (
            Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))
          ) : (
            allGenres.map((genre) => (
              <a 
                key={genre} 
                href={`/genre/${encodeURIComponent(genre)}`}
                className="bg-dark-800 hover:bg-dark-700 transition text-center py-3 rounded-lg"
              >
                <span className="text-sm font-medium">{genre}</span>
              </a>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
