import { useState, useEffect, useRef, memo } from 'react';
import { Episode, Anime } from '@shared/types';
import { updateWatchHistory } from '../lib/cookies';
import '../styles/fluid-player.css'; // This will be created later

// Import Fluid Player TypeScript definitions
declare global {
  interface Window {
    fluidPlayer: (target: HTMLVideoElement | string, options?: any) => FluidPlayerInstance;
  }

  interface FluidPlayerInstance {
    play: () => void;
    pause: () => void;
    skipTo: (seconds: number) => void;
    setPlaybackSpeed: (speed: number) => void;
    setVolume: (volume: number) => void;
    toggleControlBar: (shouldToggle: boolean) => void;
    toggleFullScreen: (shouldToggle: boolean) => void;
    toggleMiniPlayer: (shouldToggle: boolean) => void;
    destroy: () => void;
    dashInstance: () => any | null;
    hlsInstance: () => any | null;
    on: (event: string, callback: (additionalInfo?: any) => void) => void;
  }
}

interface FluidVideoPlayerProps {
  anime: Anime;
  episode: Episode;
  onNextEpisode: () => void;
  onPreviousEpisode: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const FluidVideoPlayer = ({
  anime,
  episode,
  onNextEpisode,
  onPreviousEpisode,
  hasNext,
  hasPrevious
}: FluidVideoPlayerProps) => {
  // Player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<FluidPlayerInstance | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get video URL based on available qualities
  const getVideoUrl = (): string => {
    return episode.video_url_max_quality ||
           episode.video_url_1080p ||
           episode.video_url_720p ||
           episode.video_url_480p || '';
  };

  // Initialize Fluid Player
  useEffect(() => {
    // Load Fluid Player scripts if they're not already loaded
    const loadFluidPlayerScript = () => {
      if (typeof window.fluidPlayer === 'undefined') {
        // Import the Fluid Player scripts
        import('../../fluid-player/dist/fluidplayer.min.js')
          .then(() => {
            initializePlayer();
          })
          .catch(err => {
            console.error('Failed to load Fluid Player:', err);
          });
      } else {
        initializePlayer();
      }
    };

    // Initialize the player with our configuration
    const initializePlayer = () => {
      if (!videoRef.current || typeof window.fluidPlayer === 'undefined') return;
      
      // Destroy previous instance if exists
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      // Configure available qualities
      const videoSources = [];
      
      if (episode.video_url_1080p) {
        videoSources.push({ 
          label: '1080p', // Label that will appear in the menu
          url: episode.video_url_1080p, 
          default: !episode.video_url_max_quality
        });
      }
      
      if (episode.video_url_720p) {
        videoSources.push({ 
          label: '720p',
          url: episode.video_url_720p,
          default: !episode.video_url_max_quality && !episode.video_url_1080p
        });
      }
      
      if (episode.video_url_480p) {
        videoSources.push({ 
          label: '480p',
          url: episode.video_url_480p,
          default: !episode.video_url_max_quality && !episode.video_url_1080p && !episode.video_url_720p
        });
      }
      
      // If we have a max quality URL and it's different from the others
      if (episode.video_url_max_quality) {
        const isMaxQualitySame = 
          episode.video_url_max_quality === episode.video_url_1080p || 
          episode.video_url_max_quality === episode.video_url_720p || 
          episode.video_url_max_quality === episode.video_url_480p;
          
        if (!isMaxQualitySame) {
          videoSources.push({ 
            label: 'Auto (Best Quality)',
            url: episode.video_url_max_quality,
            default: true
          });
        }
      }

      // Create Fluid Player instance
      const options = {
        layoutControls: {
          primaryColor: "#ef4444", // Use the appropriate color from your theme
          playButtonShowing: true,
          playPauseAnimation: true,
          fillToContainer: true,
          autoPlay: false,
          mute: false,
          loop: false,
          allowDownload: false,
          playbackRateEnabled: true,
          allowTheatre: true,
          title: `${anime.title} - Episode ${episode.episode_number}: ${episode.title}`,
          posterImage: episode.thumbnail_url || anime.thumbnail_url,
          controlBar: {
            autoHide: true,
            autoHideTimeout: 3,
            animated: true
          },
          logo: {
            imageUrl: null, // Your logo image URL if needed
            position: 'top left',
            clickUrl: null,
            opacity: 0.8,
            mouseOverImageUrl: null,
            imageMargin: '2px',
            hideWithControls: true,
            showOverAds: false
          },
          controlForwardBackward: {
            show: true
          },
          // Enable mini player for a better viewing experience
          miniPlayer: {
            enabled: true,
            width: 400,
            height: 225,
            widthMobile: 280,
            placeholderText: 'Minimize Player',
            position: 'bottom right'
          }
        },
        // If you need multiple video source qualities
        captions: { play: 'Play', pause: 'Pause', mute: 'Mute', unmute: 'Unmute', fullscreen: 'Fullscreen', exitFullscreen: 'Exit Fullscreen' }
      };

      // Initialize player
      playerRef.current = window.fluidPlayer(videoRef.current, options);
      
      // Set video sources if available
      if (videoSources.length > 1) {
        // This approach will depend on how Fluid Player handles multiple sources
        // This might need adjustment based on actual Fluid Player implementation
        videoSources.forEach(source => {
          // Add source elements dynamically
          const sourceElement = document.createElement('source');
          sourceElement.src = source.url;
          sourceElement.type = 'video/mp4';
          sourceElement.setAttribute('title', source.label);
          sourceElement.setAttribute('data-fluid-hd', source.default ? 'true' : 'false');
          videoRef.current?.appendChild(sourceElement);
        });
        
        if (videoRef.current) {
          videoRef.current.load();
        }
      }

      // Setup event handlers
      if (playerRef.current) {
        // When the player's ready
        playerRef.current.on('play', () => {
          startWatchHistoryTracking();
        });

        playerRef.current.on('timeupdate', (time) => {
          // Update time display and other UI elements
          updateWatchProgress();
        });

        playerRef.current.on('ended', () => {
          clearWatchHistoryTracking();
          if (hasNext) {
            onNextEpisode();
          }
        });
      }

      setIsInitialized(true);
    };

    loadFluidPlayerScript();

    // Clean up on unmount
    return () => {
      clearWatchHistoryTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [anime.id, episode.id]); // Re-initialize when anime or episode changes

  // Watch history tracking functions
  const startWatchHistoryTracking = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    // Update watch history every 5 seconds
    updateIntervalRef.current = setInterval(() => {
      updateWatchProgress();
    }, 5000);
  };

  const clearWatchHistoryTracking = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };

  const updateWatchProgress = () => {
    if (!videoRef.current || !anime?.id || !episode?.id) return;

    const currentVideoTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    
    if (isNaN(duration) || duration <= 0) return;
    
    // Calculate percentage progress
    const progressPercentage = Math.floor((currentVideoTime / duration) * 100);
    
    // Update watch history
    updateWatchHistory({
      animeId: anime.id.toString(),
      episodeId: episode.id.toString(),
      title: episode.title,
      episodeNumber: episode.episode_number,
      animeThumbnail: anime.thumbnail_url,
      animeTitle: anime.title,
      progress: progressPercentage,
      timestamp: new Date().getTime()
    });
  };

  // Set up previously saved progress
  useEffect(() => {
    if (!videoRef.current || !isInitialized) return;

    // Check if we have saved progress for this episode
    const savedHistoryItems = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const savedItem = savedHistoryItems.find(
      (item: any) => item.animeId === anime.id.toString() && item.episodeId === episode.id.toString()
    );

    if (savedItem && savedItem.progress > 0 && playerRef.current) {
      // Set video time to saved progress
      const durationSeconds = videoRef.current.duration;
      if (!isNaN(durationSeconds)) {
        const timeToSet = savedItem.progress * durationSeconds / 100;
        // Use Fluid Player's API to skip to the saved time
        playerRef.current.skipTo(timeToSet);
      }
    }
  }, [isInitialized, anime.id, episode.id]);

  return (
    <div className="w-full flex flex-col bg-black fluid-player-container">
      {/* Main video container */}
      <div className="relative w-full bg-black overflow-hidden video-aspect-container">
        <div className="video-container">
          {/* Video element that Fluid Player will enhance */}
          <video ref={videoRef} id="fluid-player" className="fluid-video">
            <source src={getVideoUrl()} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Episode navigation bar */}
      <div className="bg-black py-3 px-4 flex justify-between items-center border-t border-gray-800/30">
        <button
          className="bg-gray-800/70 hover:bg-gray-700/70 transition px-4 py-2 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={onPreviousEpisode}
          disabled={!hasPrevious}
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="19 20 9 12 19 4"></polyline>
          </svg> 
          Previous
        </button>

        <div className="text-sm text-gray-300">
          Episode <span className="font-bold">{episode.episode_number}</span>
        </div>

        <button
          className="bg-gray-800/70 hover:bg-gray-700/70 transition px-4 py-2 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={onNextEpisode}
          disabled={!hasNext}
        >
          Next 
          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="5 4 15 12 5 20"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Optimize with memo to prevent unnecessary re-renders
export default memo(FluidVideoPlayer);