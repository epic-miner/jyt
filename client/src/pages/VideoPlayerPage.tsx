import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import VideoPlayer from '../components/VideoPlayer';
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
        animeTitle: anime.title,
        progress: 0, // Initial progress, will be updated by the video player
        timestamp: new Date().getTime()
      });
      
      // Update recently watched anime
      updateRecentlyWatchedAnime({
        id: anime.id.toString(),
        title: anime.title,
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
      <div className="h-screen flex flex-col bg-black">
        <Skeleton className="w-full flex-grow" />
      </div>
    );
  }
  
  // Handle error state
  if (!anime || !currentEpisode) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-2">Video not found</h1>
          <p className="mb-4">The episode you're looking for doesn't exist or is unavailable.</p>
          <button 
            className="bg-primary hover:bg-primary/90 transition px-6 py-2 rounded-full"
            onClick={() => setLocation(`/anime/${animeId}`)}
          >
            Back to Anime
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-black">
      <VideoPlayer 
        anime={anime}
        episode={currentEpisode}
        onNextEpisode={handleNextEpisode}
        onPreviousEpisode={handlePreviousEpisode}
        hasNext={currentEpisodeIndex < episodes.length - 1}
        hasPrevious={currentEpisodeIndex > 0}
      />
    </div>
  );
};

export default VideoPlayerPage;
