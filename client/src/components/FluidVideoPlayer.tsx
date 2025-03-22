import { useState, useEffect, useRef, memo } from 'react';
import { Episode, Anime } from '@shared/types';
import { updateWatchHistory } from '../lib/cookies';

// Import FluidPlayer directly
const fluidPlayer = require('fluid-player');

// Add custom styles
import '../styles/fluid-player.css';

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
  const playerInstanceRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get initial video URL based on available qualities
  const getVideoUrl = (): string => {
    return episode.video_url_max_quality ||
           episode.video_url_1080p ||
           episode.video_url_720p ||
           episode.video_url_480p || '';
  };

  // Get video sources for quality switching
  const getVideoSources = () => {
    const sources: Array<{src: string, type: string, title: string, selected?: boolean}> = [];
    
    if (episode.video_url_1080p) {
      sources.push({
        src: episode.video_url_1080p,
        type: 'video/mp4',
        title: '1080p'
      });
    }
    
    if (episode.video_url_720p) {
      sources.push({
        src: episode.video_url_720p,
        type: 'video/mp4',
        title: '720p'
      });
    }
    
    if (episode.video_url_480p) {
      sources.push({
        src: episode.video_url_480p,
        type: 'video/mp4',
        title: '480p'
      });
    }
    
    // If there's only one source, make it selected
    if (sources.length === 1) {
      sources[0].selected = true;
    }
    
    return sources;
  };

  // Initialize Fluid Player
  useEffect(() => {
    if (!videoRef.current) return;

    // Clean up any previous instance
    if (playerInstanceRef.current) {
      playerInstanceRef.current.destroy();
      playerInstanceRef.current = null;
    }

    const videoSources = getVideoSources();

    // Configure the player
    const playerOptions = {
      layoutControls: {
        primaryColor: "#ef4444",
        playButtonShowing: true,
        playPauseAnimation: true,
        fillToContainer: true,
        autoPlay: false,
        mute: false,
        keyboardControl: true,
        loop: false,
        allowDownload: false,
        playbackRateEnabled: true,
        allowTheatre: true,
        posterImage: episode.thumbnail_url || anime.thumbnail_url,
        title: `${anime.title} - Episode ${episode.episode_number}: ${episode.title}`,
        controlBar: {
          autoHide: true,
          autoHideTimeout: 3,
          animated: true
        },
        logo: {
          imageUrl: null,
          position: 'top left' as 'top left',
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
        miniPlayer: {
          enabled: true,
          width: 400,
          height: 225,
          widthMobile: 280,
          placeholderText: 'Minimize Player',
          position: 'bottom right' as 'bottom right'
        }
      },
      // Only set videoSources if we have multiple qualities
      videoSources: videoSources.length > 1 ? videoSources : undefined,
      captions: { 
        play: 'Play', 
        pause: 'Pause', 
        mute: 'Mute', 
        unmute: 'Unmute', 
        fullscreen: 'Fullscreen', 
        exitFullscreen: 'Exit Fullscreen' 
      }
    };

    try {
      // Initialize fluid player
      const fpInstance = fluidPlayer(
        videoRef.current,
        playerOptions
      );

      // Store the player instance for later use
      playerInstanceRef.current = fpInstance;

      // If we only have one source, set the src directly
      if (videoSources.length === 1) {
        videoRef.current.src = videoSources[0].src;
      }

      // Setup event listeners
      if (videoRef.current) {
        // When playback starts
        videoRef.current.addEventListener('play', startWatchHistoryTracking);
        
        // When the time updates
        videoRef.current.addEventListener('timeupdate', updateWatchProgress);
        
        // When the video ends
        videoRef.current.addEventListener('ended', () => {
          clearWatchHistoryTracking();
          if (hasNext) {
            setTimeout(() => {
              onNextEpisode();
            }, 1000);
          }
        });
      }

      setIsPlayerReady(true);
    } catch (error) {
      console.error('Error initializing Fluid Player:', error);
    }

    // Clean up on unmount
    return () => {
      clearWatchHistoryTracking();
      try {
        if (videoRef.current) {
          videoRef.current.removeEventListener('play', startWatchHistoryTracking);
          videoRef.current.removeEventListener('timeupdate', updateWatchProgress);
          videoRef.current.removeEventListener('ended', onNextEpisode);
        }
        
        if (playerInstanceRef.current) {
          playerInstanceRef.current.destroy();
          playerInstanceRef.current = null;
        }
      } catch (error) {
        console.error('Error cleaning up Fluid Player:', error);
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
    if (!videoRef.current || !isPlayerReady) return;

    // Check if we have saved progress for this episode
    const savedHistoryItems = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const savedItem = savedHistoryItems.find(
      (item: any) => item.animeId === anime.id.toString() && item.episodeId === episode.id.toString()
    );

    if (savedItem && savedItem.progress > 0) {
      // Wait for video metadata to load
      const handleMetadata = () => {
        if (!videoRef.current) return;
        
        const durationSeconds = videoRef.current.duration;
        if (!isNaN(durationSeconds) && durationSeconds > 0) {
          const timeToSet = (savedItem.progress * durationSeconds) / 100;
          // Skip to the saved time
          videoRef.current.currentTime = timeToSet;
          videoRef.current.removeEventListener('loadedmetadata', handleMetadata);
        }
      };
      
      videoRef.current.addEventListener('loadedmetadata', handleMetadata);
    }
  }, [isPlayerReady, anime.id, episode.id]);

  return (
    <div className="w-full flex flex-col bg-black fluid-player-container">
      {/* Main video container */}
      <div className="relative w-full bg-black overflow-hidden video-aspect-container">
        <div className="video-container">
          {/* Video element that Fluid Player will enhance */}
          <video 
            ref={videoRef} 
            className="fluid-video"
            data-fluid-player 
            id="anime-player"
          >
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