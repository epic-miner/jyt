import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
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
  if (isLoadingAnime || isLoadingEpisodes) {
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

  // Get first episode thumbnail for banner
  const bannerImage = episodes && episodes.length > 0 
    ? episodes[0].thumbnail_url 
    : anime.thumbnail_url;

  return (
    <div className="relative min-h-screen bg-dark-950">
      {/* Hero section with episode banner */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[300px] md:h-[400px] overflow-hidden"
      >
        <img 
          src={bannerImage} 
          alt={anime.title} 
          className="w-full h-full object-cover opacity-40 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-transparent">
          {/* Add animated neon lines */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse"></div>
        </div>
        <Link href="/">
          <button className="absolute top-4 left-4 bg-dark-800/80 hover:bg-dark-700 transition p-2 rounded-full text-white hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] hover:text-primary">
            <i className="fas fa-arrow-left"></i>
          </button>
        </Link>
      </motion.div>

      {/* Anime info section */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-6"
        >
          {/* Anime poster */}
          <div className="w-40 md:w-60 mx-auto md:mx-0 rounded-lg overflow-hidden shadow-lg ring-1 ring-white/10 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-shadow duration-300">
            <img 
              src={anime.thumbnail_url} 
              alt={anime.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Anime details */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent">
              {anime.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-3">
              {genres.map((genre) => (
                <GenrePill key={genre} genre={genre} />
              ))}
            </div>
            <p className="text-slate-300 mb-6">{anime.description}</p>

            {episodes && episodes.length > 0 && (
              <Link href={`/watch/${anime.id}/${episodes[0].id}`}>
                <button className="bg-primary hover:bg-primary/90 transition px-6 py-2 rounded-full flex items-center hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] transform hover:scale-105 duration-300">
                  <i className="fas fa-play mr-2"></i> Watch First Episode
                </button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Episodes section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 backdrop-blur-sm bg-dark-900/30 p-6 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all duration-300"
        >
          <h2 className="text-xl font-bold mb-4 relative inline-block">
            Episodes
            <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </h2>

          {isLoadingEpisodes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          ) : isEpisodesError || !episodes ? (
            <p className="text-slate-400">Failed to load episodes.</p>
          ) : !Array.isArray(episodes) ? (
            <p className="text-slate-400">Episode data is not in the expected format.</p>
          ) : episodes.length === 0 ? (
            <p className="text-slate-400">No episodes available for this anime.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {episodes.map((episode, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  key={episode.id}
                >
                  <EpisodeCard 
                    episode={episode}
                    animeId={anime.id.toString()}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AnimeDetails;