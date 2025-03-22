import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import FluidVideoPlayer from '../components/FluidVideoPlayer';
import TestFluidPlayer from '../components/TestFluidPlayer';
import { fetchAnimeById, fetchEpisodeById, fetchEpisodesByAnimeId } from '../lib/api';
import { updateWatchHistory, updateRecentlyWatchedAnime } from '../lib/cookies';
import { Episode } from '@shared/types';

const VideoPlayerPage = () => {
  const [, params] = useRoute('/watch/:animeId/:episodeId');
  const [, setLocation] = useLocation();

  const animeId = params?.animeId || '';
  const episodeId = params?.episodeId || '';

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number>(-1);

  // Fetch anime details
  const { data: anime, isLoading: isLoadingAnime } = useQuery({
    queryKey: ['/api/anime', animeId],
    queryFn: () => fetchAnimeById(animeId),
    enabled: !!animeId,
  });

  // Fetch current episode
  const { data: currentEpisode, isLoading: isLoadingEpisode } = useQuery({
    queryKey: ['/api/episodes', episodeId],
    queryFn: () => fetchEpisodeById(episodeId),
    enabled: !!episodeId,
  });

  // Fetch all episodes for the anime
  const { data: allEpisodes } = useQuery({
    queryKey: ['/api/episodes', animeId, 'all'],
    queryFn: () => fetchEpisodesByAnimeId(animeId),
    enabled: !!animeId,
  });

  useEffect(() => {
    if (allEpisodes) {
      // Sort episodes by episode number
      const sortedEpisodes = [...allEpisodes].sort((a, b) => a.episode_number - b.episode_number);
      setEpisodes(sortedEpisodes);

      // Find index of current episode
      const index = sortedEpisodes.findIndex(ep => ep.id.toString() === episodeId);
      setCurrentEpisodeIndex(index);
    }
  }, [allEpisodes, episodeId]);

  // Update watch history and recently watched when playing an episode
  useEffect(() => {
    if (anime && currentEpisode) {
      // Update watch history
      updateWatchHistory({
        animeId: animeId,
        episodeId: episodeId,
        title: currentEpisode.title,
        episodeNumber: currentEpisode.episode_number,
        animeThumbnail: anime.thumbnail_url,
        animeTitle: anime.title.replace(/\(T\)|\(LR\)|\(P\)/g, ''), // Remove tags from title
        progress: 0, // Initial progress, will be updated by the video player
        timestamp: new Date().getTime()
      });

      // Update recently watched anime
      updateRecentlyWatchedAnime({
        id: anime.id.toString(),
        title: anime.title.replace(/\(T\)|\(LR\)|\(P\)/g, ''), // Remove tags from title
        thumbnail_url: anime.thumbnail_url,
        genre: anime.genre,
        timestamp: new Date().getTime()
      });
    }
  }, [anime, currentEpisode, animeId, episodeId]);

  const handleNextEpisode = () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      const nextEp = episodes[currentEpisodeIndex + 1];
      setLocation(`/watch/${animeId}/${nextEp.id}`);
    }
  };

  const handlePreviousEpisode = () => {
    if (currentEpisodeIndex > 0) {
      const prevEp = episodes[currentEpisodeIndex - 1];
      setLocation(`/watch/${animeId}/${prevEp.id}`);
    }
  };

  // Handle loading state
  if (isLoadingAnime || isLoadingEpisode) {
    return (
      <div className="h-screen flex flex-col bg-black p-4">
        <div className="max-w-7xl mx-auto w-full space-y-4">
          <Skeleton className="w-full aspect-video rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (!anime) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-2">Anime not found</h1>
          <p className="mb-4">This anime doesn't exist or is unavailable.</p>
          <button 
            className="bg-primary hover:bg-primary/90 transition px-6 py-2 rounded-full"
            onClick={() => setLocation('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // If no episode is specified, redirect to first episode
  if (!currentEpisode && episodes.length > 0) {
    setLocation(`/watch/${animeId}/${episodes[0].id}`);
    return null;
  }

  // If no episodes available
  if (!currentEpisode || episodes.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <div className="text-center p-4">
          <h1 className="heading-responsive mb-2">No episodes available</h1>
          <p className="text-responsive mb-4">This anime doesn't have any episodes yet.</p>
          <button 
            className="bg-primary hover:bg-primary/90 transition px-6 py-2 rounded-full text-responsive"
            onClick={() => setLocation(`/anime/${animeId}`)}
          >
            Back to Anime
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black to-dark-950">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Main Fluid Player Component */}
        <FluidVideoPlayer 
          anime={anime}
          episode={currentEpisode}
          onNextEpisode={handleNextEpisode}
          onPreviousEpisode={handlePreviousEpisode}
          hasNext={currentEpisodeIndex < episodes.length - 1}
          hasPrevious={currentEpisodeIndex > 0}
        />
        
        {/* Test Player for debugging */}
        <div className="mt-6 mb-6 p-4 bg-gray-900 rounded-lg">
          <h2 className="text-lg font-bold mb-4 text-white">Test Fluid Player</h2>
          <TestFluidPlayer />
        </div>

        <div className="p-4 space-y-4 md:space-y-6 rounded-t-xl backdrop-blur-sm bg-black/40 border-t border-white/5">
          {/* Episode Info */}
          <div className="glass-effect p-4 rounded-lg border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-white/20">
            <h2 className="text-2xl font-bold mb-2">{anime.title.replace(/\(T\)|\(LR\)|\(P\)/g, '')}</h2>
            <p className="text-gray-400">Episode {currentEpisode.episode_number}: {currentEpisode.title}</p>
          </div>

          {/* Episode Description */}
          <div>
            <p className="text-gray-300">{currentEpisode.description || "No description available."}</p>
          </div>

          {/* Episodes List */}
          <div>
            <h3 className="subheading-responsive mb-3">Episodes</h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setLocation(`/watch/${animeId}/${ep.id}`)}
                  className={cn(
                    "p-4 rounded-lg text-left transition-all duration-300 flex flex-col glass-card",
                    "hover:scale-[1.05] hover:shadow-lg hover:shadow-primary/20",
                    ep.id === currentEpisode.id 
                      ? "bg-primary/20 text-white shadow-lg shadow-primary/30 border-primary/30" 
                      : "text-gray-300 glass-effect"
                  )}
                >
                  <div className="font-medium text-mobile-optimized">Episode {ep.episode_number}</div>
                  <div className="caption-responsive truncate mt-1 line-clamp-1">{ep.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;