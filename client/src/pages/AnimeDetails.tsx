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
import ParticleBackground from '../components/ParticleBackground';
import AnimatedTitle from '../components/AnimatedTitle';
import ScrollReveal from '../components/ScrollReveal';
import AnimeLazyImage from '../components/AnimeLazyImage';
import ParallaxSection from '../components/ParallaxSection';
import TiltCard from '../components/TiltCard';

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
        title: anime.title.replace(/\(T\)|\(LR\)|\(P\)/g, ''), // Remove tags from title
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
    <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-800">
      <ParticleBackground 
        options={{
          particles: {
            number: { value: 30 },
            color: { value: "#4a3aff" },
            opacity: { value: 0.2 },
            size: { value: 2 },
            move: { speed: 0.3 }
          }
        }}
      />
      {/* Hero section with enhanced parallax banner */}
      <ParallaxSection
        speed={0.5}
        className="relative h-[300px] md:h-[400px] overflow-hidden group"
      >
        <AnimeLazyImage
          src={bannerImage}
          alt={anime.title}
          className="w-full h-full object-cover object-center opacity-75 transform-gpu will-change-transform transition-all duration-700 ease-in-out group-hover:scale-105 group-hover:opacity-85"
          effect="blur"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent/30">
          {/* Animated neon lines */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse"></div>
          <div className="absolute -bottom-4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse delay-75"></div>
        </div>
        <Link href="/">
          <button className="absolute top-4 left-4 bg-dark-800/80 hover:bg-dark-700 transition-all duration-300 p-2 rounded-full text-white hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] hover:text-primary transform hover:scale-110">
            <i className="fas fa-arrow-left"></i>
          </button>
        </Link>
      </ParallaxSection>

      {/* Anime info section */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-6"
        >
          {/* Anime poster */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-40 md:w-60 mx-auto md:mx-0 rounded-lg overflow-hidden shadow-lg ring-1 ring-white/10 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all duration-300 group"
          >
            <img
              src={anime.thumbnail_url}
              alt={anime.title}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
            />
          </motion.div>

          {/* Anime details */}
          <div className="flex-1 backdrop-blur-sm bg-dark-900/30 p-6 rounded-2xl border border-white/5">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent hover:scale-[1.01] transition-transform duration-300"
            >
              {anime.title.replace(/\(T\)|\(LR\)|\(P\)/g, '')}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2 mb-3"
            >
              {genres.map((genre, index) => (
                <motion.div
                  key={genre}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GenrePill genre={genre} />
                </motion.div>
              ))}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-300 mb-6 leading-relaxed"
            >
              {anime.description}
            </motion.p>

            {episodes && episodes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link href={`/watch/${anime.id}/${episodes[0].id}`}>
                  <button className="bg-primary hover:bg-primary/90 transition-all duration-300 px-8 py-3 rounded-full flex items-center hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] transform hover:scale-105 group">
                    <i className="fas fa-play mr-2 group-hover:animate-pulse"></i>
                    <span className="font-medium">Watch First Episode</span>
                  </button>
                </Link>
              </motion.div>
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
          <h2 className="text-xl font-bold mb-6 relative inline-block">
            <span className="bg-gradient-to-r from-primary to-white bg-clip-text text-transparent">
              Episodes
            </span>
            <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
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