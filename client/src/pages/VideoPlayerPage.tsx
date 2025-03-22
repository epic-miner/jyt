import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import FluidVideoPlayer from '../components/FluidVideoPlayer';
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

  const handleNextEpisode = useCallback(() => {
    if (currentEpisodeIndex < episodes.length - 1) {
      const nextEp = episodes[currentEpisodeIndex + 1];
      setLocation(`/watch/${animeId}/${nextEp.id}`);
    }
  }, [currentEpisodeIndex, episodes, animeId, setLocation]);

  const handlePreviousEpisode = useCallback(() => {
    if (currentEpisodeIndex > 0) {
      const prevEp = episodes[currentEpisodeIndex - 1];
      setLocation(`/watch/${animeId}/${prevEp.id}`);
    }
  }, [currentEpisodeIndex, episodes, animeId, setLocation]);

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

  // Add custom Fluid Player refs at top level
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<any>(null);

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

  // Initialize Fluid Player when episode is loaded
  useEffect(() => {
    if (!currentEpisode || !anime || !videoRef.current) return;

    // Clean up previous player instance if it exists
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.destroy();
      } catch (e) {
        console.error('Error destroying previous player:', e);
      }
      playerInstanceRef.current = null;
    }

    // Wait for fluidPlayer to be available
    const initPlayer = () => {
      if (typeof window.fluidPlayer !== 'function') {
        console.log('Waiting for Fluid Player to load...');
        setTimeout(initPlayer, 500);
        return;
      }

      try {
        console.log('Initializing enhanced Fluid Player...');
        // Initialize with enhanced options
        const playerInstance = window.fluidPlayer('anime-player', {
          layoutControls: {
            primaryColor: "#ef4444",
            fillToContainer: true,
            autoPlay: false,
            playbackRateEnabled: true,
            allowTheatre: true,
            miniPlayer: {
              enabled: true,
              width: 400,
              widthMobile: 280,
              placeholderText: "Playing in Mini Player",
              position: "bottom right"
            },
            controlBar: {
              autoHide: true,
              autoHideTimeout: 3,
              animated: true
            },
            logo: {
              imageUrl: null,
              position: "top left",
              clickUrl: null,
              opacity: 1
            },
            contextMenu: {
              controls: true,
              links: [
                {
                  href: '/',
                  label: 'Back to Home'
                },
                {
                  href: `/anime/${anime.id}`,
                  label: `View ${anime.title}`
                }
              ]
            },
            persistentSettings: {
              volume: true,
              quality: true,
              speed: true,
              theatre: true
            },
            controlForwardBackward: {
              show: true,
              doubleTapMobile: true
            },
            allowDownload: false,
          },
          modules: {
            configureHls: (options: any) => {
              return {
                ...options,
                autoLevelCapping: -1,
                lowLatencyMode: true,
                startLevel: -1
              };
            },
            configureDash: (options: any) => {
              return {
                ...options,
                streaming: {
                  fastSwitchEnabled: true,
                  lowLatencyEnabled: true
                }
              };
            }
          }
        });

        playerInstanceRef.current = playerInstance;

        // Set up event listeners
        playerInstance.on('play', () => {
          console.log('Video started playing');
        });

        playerInstance.on('pause', () => {
          console.log('Video paused');
        });

        playerInstance.on('timeupdate', (time: number) => {
          if (!videoRef.current || !anime?.id || !currentEpisode?.id) return;

          const currentVideoTime = videoRef.current.currentTime;
          const duration = videoRef.current.duration;

          if (isNaN(duration) || duration <= 0) return;

          // Calculate percentage progress and update watch history every 5 seconds
          if (Math.floor(currentVideoTime) % 5 === 0) {
            const progressPercentage = Math.floor((currentVideoTime / duration) * 100);
            updateWatchHistory({
              animeId: anime.id.toString(),
              episodeId: currentEpisode.id.toString(),
              title: currentEpisode.title,
              episodeNumber: currentEpisode.episode_number,
              animeThumbnail: anime.thumbnail_url,
              animeTitle: anime.title,
              progress: progressPercentage,
              timestamp: new Date().getTime()
            });
          }
        });

        playerInstance.on('ended', () => {
          console.log('Video ended');
          if (currentEpisodeIndex < episodes.length - 1) {
            setTimeout(() => {
              handleNextEpisode();
            }, 1500);
          }
        });

        // Remove download button completely
        setTimeout(() => {
          try {
            // Remove any download buttons that might be created
            const downloadButtons = document.querySelectorAll('[data-player-action="download"], .fluid_control_download');
            downloadButtons.forEach(button => {
              if (button instanceof HTMLElement) {
                button.style.display = 'none';
                button.remove();
              }
            });

            // Remove from context menu if exists
            const contextMenuItems = document.querySelectorAll('.fluid_context_menu li');
            contextMenuItems.forEach(item => {
              if (item.textContent?.includes('Download')) {
                item.remove();
              }
            });
          } catch (e) {
            console.log('Download button removal attempt:', e);
          }
        }, 500);

      } catch (error) {
        console.error('Error initializing Fluid Player:', error);
      }
    };

    initPlayer();

    // Clean up on unmount
    return () => {
      try {
        if (playerInstanceRef.current) {
          playerInstanceRef.current.destroy();
          playerInstanceRef.current = null;
        }
      } catch (error) {
        console.error('Error cleaning up Fluid Player:', error);
      }
    };
  }, [anime?.id, currentEpisode?.id, currentEpisodeIndex, episodes.length, handleNextEpisode]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black to-dark-950">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Enhanced Fluid Player Direct Implementation */}
        <div className="w-full flex flex-col bg-black fluid-player-container">
          <div className="relative w-full bg-black overflow-hidden aspect-video">
            <div className="absolute top-0 left-0 w-full h-full">
              <video 
                ref={videoRef} 
                className="w-full h-full"
                id="anime-player"
                controls
                playsInline
                preload="auto"
              >
                {/* Use multiple source tags with data-fluid-hd attribute for HD quality sources */}
                {currentEpisode.video_url_1080p && (
                  <source src={currentEpisode.video_url_1080p} type="video/mp4" data-fluid-hd title="1080p" />
                )}
                {currentEpisode.video_url_720p && (
                  <source src={currentEpisode.video_url_720p} type="video/mp4" data-fluid-hd title="720p" />
                )}
                {currentEpisode.video_url_480p && (
                  <source src={currentEpisode.video_url_480p} type="video/mp4" title="480p" />
                )}
                {!currentEpisode.video_url_1080p && !currentEpisode.video_url_720p && !currentEpisode.video_url_480p && (
                  <source src={currentEpisode.video_url_max_quality} type="video/mp4" title="Auto" />
                )}
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Episode navigation bar */}
          <div className="bg-black py-2 px-3 sm:py-3 sm:px-4 flex justify-between items-center border-t border-gray-800/30">
            <button
              className="bg-gray-800/70 hover:bg-gray-700/70 transition px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              onClick={handlePreviousEpisode}
              disabled={!(currentEpisodeIndex > 0)}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="19 20 9 12 19 4"></polyline>
              </svg> 
              <span className="sm:inline hidden">Previous</span>
              <span className="sm:hidden inline">Prev</span>
            </button>

            <div className="text-xs sm:text-sm text-gray-300">
              Ep <span className="font-bold">{currentEpisode.episode_number}</span>
            </div>

            <button
              className="bg-gray-800/70 hover:bg-gray-700/70 transition px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              onClick={handleNextEpisode}
              disabled={!(currentEpisodeIndex < episodes.length - 1)}
            >
              <span className="sm:inline hidden">Next</span>
              <span className="sm:hidden inline">Next</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="5 4 15 12 5 20"></polyline>
              </svg>
            </button>
          </div>
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