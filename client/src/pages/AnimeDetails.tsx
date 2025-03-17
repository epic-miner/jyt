import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import GenrePill from '../components/GenrePill';
import EpisodeCard from '../components/EpisodeCard';
import { fetchAnimeById, fetchEpisodesByAnimeId } from '../lib/api';
import { updateRecentlyWatchedAnime } from '../lib/cookies';

const AnimeDetails = () => {
  const [, params] = useRoute('/anime/:id');
  const animeId = params?.id || '';
  
  // Fetch anime details
  const { data: anime, isLoading: isLoadingAnime, isError: isAnimeError } = useQuery({
    queryKey: ['/api/anime', animeId],
    queryFn: () => fetchAnimeById(animeId),
    enabled: !!animeId,
  });
  
  // Fetch anime episodes
  const { data: episodes, isLoading: isLoadingEpisodes, isError: isEpisodesError } = useQuery({
    queryKey: ['/api/episodes', animeId],
    queryFn: () => fetchEpisodesByAnimeId(animeId),
    enabled: !!animeId,
  });
  
  // Update recently watched when visiting anime details
  useEffect(() => {
    if (anime) {
      updateRecentlyWatchedAnime({
        id: anime.id.toString(),
        title: anime.title,
        thumbnail_url: anime.thumbnail_url,
        genre: anime.genre,
        timestamp: new Date().getTime()
      });
    }
  }, [anime]);
  
  // Handle loading state
  if (isLoadingAnime) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-[300px] md:h-[400px] w-full rounded-lg mb-4" />
        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <Skeleton className="w-40 md:w-60 h-[300px] rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (isAnimeError || !anime) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Anime not found</h1>
        <p className="mb-4">We couldn't find the anime you're looking for.</p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }
  
  // Extract genres from comma-separated string
  const genres = anime.genre.split(',').map(g => g.trim());
  
  return (
    <div className="relative">
      {/* Hero section with anime banner */}
      <div className="relative h-[300px] md:h-[400px]">
        <img 
          src={anime.thumbnail_url} 
          alt={anime.title} 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-transparent"></div>
        <Link href="/">
          <button className="absolute top-4 left-4 bg-dark-800/80 hover:bg-dark-700 transition p-2 rounded-full text-white">
            <i className="fas fa-arrow-left"></i>
          </button>
        </Link>
      </div>
      
      {/* Anime info section */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Anime poster */}
          <div className="w-40 md:w-60 mx-auto md:mx-0 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={anime.thumbnail_url} 
              alt={anime.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Anime details */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{anime.title}</h1>
            <div className="flex flex-wrap gap-2 mb-3">
              {genres.map((genre) => (
                <GenrePill key={genre} genre={genre} />
              ))}
            </div>
            <p className="text-slate-300 mb-6">{anime.description}</p>
            
            {episodes && episodes.length > 0 && (
              <Link href={`/watch/${anime.id}/${episodes[0].id}`}>
                <button className="bg-primary hover:bg-primary/90 transition px-6 py-2 rounded-full flex items-center">
                  <i className="fas fa-play mr-2"></i> Watch First Episode
                </button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Episodes section */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Episodes</h2>
          
          {isLoadingEpisodes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          ) : isEpisodesError || !episodes ? (
            <p className="text-slate-400">Failed to load episodes.</p>
          ) : episodes.length === 0 ? (
            <p className="text-slate-400">No episodes available for this anime.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {episodes.map((episode) => (
                <EpisodeCard 
                  key={episode.id} 
                  episode={episode}
                  animeId={anime.id.toString()}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
