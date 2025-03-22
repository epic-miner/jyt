import { useState, useEffect, useRef, memo } from 'react';
import { Episode, Anime } from '@shared/types';
import { updateWatchHistory } from '../lib/cookies';
import '../styles/fluid-player.css';

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
    toggleFullScreen: (shouldToggle: boolean) => void;
    destroy: () => void;
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
  const [fluidPlayerLoaded, setFluidPlayerLoaded] = useState(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get video URL based on available qualities
  const getVideoUrl = (): string => {
    return episode.video_url_max_quality ||
           episode.video_url_1080p ||
           episode.video_url_720p ||
           episode.video_url_480p || '';
  };

  // Load Fluid Player scripts
  useEffect(() => {
    // Only load if not already loaded
    if (!window.fluidPlayer && !fluidPlayerLoaded) {
      // Load CSS
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = '/assets/fluid-player/fluidplayer.min.css';
      document.head.appendChild(linkElement);

      // Load JavaScript
      const scriptElement = document.createElement('script');
      scriptElement.src = '/assets/fluid-player/fluidplayer.min.js';
      scriptElement.async = true;
      scriptElement.onload = () => {
        setFluidPlayerLoaded(true);
      };
      document.body.appendChild(scriptElement);
    } else if (typeof window.fluidPlayer === 'function') {
      setFluidPlayerLoaded(true);
    }
  }, []);

  // Initialize Fluid Player
  useEffect(() => {
    if (!fluidPlayerLoaded || !videoRef.current || !window.fluidPlayer) return;

    // Destroy previous instance if exists
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    // Create Fluid Player instance
    const options = {
      layoutControls: {
        primaryColor: "#ef4444", // Use primary color from theme
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
          imageUrl: null,
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
        miniPlayer: {
          enabled: true,
          width: 400,
          height: 225,
          widthMobile: 280,
          placeholderText: 'Minimize Player',
          position: 'bottom right'
        }
      },
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
      // Initialize player
      playerRef.current = window.fluidPlayer(videoRef.current, options);
      
      // Setup event handlers
      if (playerRef.current) {
        // When playback starts
        playerRef.current.on('play', () => {
          startWatchHistoryTracking();
        });

        // When the time updates
        playerRef.current.on('timeupdate', () => {
          updateWatchProgress();
        });

        // When the video ends
        playerRef.current.on('ended', () => {
          clearWatchHistoryTracking();
          if (hasNext) {
            setTimeout(() => {
              onNextEpisode();
            }, 1000);
          }
        });
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing Fluid Player:', error);
    }

    // Clean up on unmount or when episode changes
    return () => {
      clearWatchHistoryTracking();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (error) {
          console.error('Error destroying Fluid Player:', error);
        }
      }
    };
  }, [fluidPlayerLoaded, anime.id, episode.id]); // Re-initialize when anime or episode changes

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
    if (!videoRef.current || !isInitialized || !playerRef.current) return;

    // Check if we have saved progress for this episode
    const savedHistoryItems = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const savedItem = savedHistoryItems.find(
      (item: any) => item.animeId === anime.id.toString() && item.episodeId === episode.id.toString()
    );

    if (savedItem && savedItem.progress > 0) {
      // Wait for video metadata to load
      const handleMetadata = () => {
        if (!videoRef.current || !playerRef.current) return;
        
        const durationSeconds = videoRef.current.duration;
        if (!isNaN(durationSeconds) && durationSeconds > 0) {
          const timeToSet = (savedItem.progress * durationSeconds) / 100;
          // Use Fluid Player's API to skip to the saved time
          playerRef.current.skipTo(timeToSet);
          
          videoRef.current.removeEventListener('loadedmetadata', handleMetadata);
        }
      };
      
      videoRef.current.addEventListener('loadedmetadata', handleMetadata);
    }
  }, [isInitialized, anime.id, episode.id]);

  // Quality menu toggle function defined outside the useEffect to prevent strict mode issues
  const toggleQualityMenu = (menu: HTMLElement) => {
    const isVisible = menu.style.display === 'block';
    menu.style.display = isVisible ? 'none' : 'block';
  };

  // Add quality switching functionality
  useEffect(() => {
    if (!isInitialized || !videoRef.current) return;

    // Prepare quality options
    const qualities: Array<{label: string, url: string}> = [];
    
    if (episode.video_url_1080p) {
      qualities.push({ label: '1080p', url: episode.video_url_1080p });
    }
    
    if (episode.video_url_720p) {
      qualities.push({ label: '720p', url: episode.video_url_720p });
    }
    
    if (episode.video_url_480p) {
      qualities.push({ label: '480p', url: episode.video_url_480p });
    }

    // Only add quality switcher if we have multiple qualities
    if (qualities.length > 1) {
      const videoWrapper = videoRef.current.closest('.fluid_video_wrapper');
      if (!videoWrapper) return;

      // Check if quality menu already exists
      if (videoWrapper.querySelector('.fluid_control_video_source')) return;

      // Create quality menu button
      const qualityButton = document.createElement('div');
      qualityButton.className = 'fluid_button fluid_button_video_source';
      qualityButton.innerHTML = '<i class="fa fa-cog"></i>';
      qualityButton.title = 'Video Quality';
      
      // Create quality menu
      const qualityMenu = document.createElement('div');
      qualityMenu.className = 'fluid_control_video_source';
      qualityMenu.style.display = 'none';
      qualityMenu.innerHTML = '<ul></ul>';
      
      // Wire up button click
      qualityButton.onclick = () => toggleQualityMenu(qualityMenu);
      
      // Find control bar to append button
      const controlBar = videoWrapper.querySelector('.fluid_controls_container');
      if (controlBar) {
        controlBar.appendChild(qualityButton);
      }
      
      videoWrapper.appendChild(qualityMenu);

      // Add quality options
      const menuList = qualityMenu.querySelector('ul');
      if (menuList) {
        qualities.forEach(quality => {
          const listItem = document.createElement('li');
          listItem.className = 'fluid_video_source_list_item';
          listItem.textContent = quality.label;
          listItem.onclick = () => {
            if (!videoRef.current) return;
            
            const currentTime = videoRef.current.currentTime || 0;
            const isPlaying = !videoRef.current.paused;
            videoRef.current.src = quality.url;
            videoRef.current.load();
            
            // Restore playback state
            const onMetadata = () => {
              if (!videoRef.current) return;
              videoRef.current.currentTime = currentTime;
              if (isPlaying) videoRef.current.play();
              videoRef.current.removeEventListener('loadedmetadata', onMetadata);
            };
            
            videoRef.current.addEventListener('loadedmetadata', onMetadata);
            
            // Update selected class
            document.querySelectorAll('.fluid_video_source_list_item').forEach(item => {
              item.classList.remove('source_selected');
            });
            listItem.classList.add('source_selected');
            
            // Hide menu
            qualityMenu.style.display = 'none';
          };
          menuList.appendChild(listItem);
        });

        // Mark current quality as selected
        const currentQuality = qualities.find(q => videoRef.current && q.url === videoRef.current.src);
        if (currentQuality) {
          const currentItems = menuList.querySelectorAll('li');
          for (let i = 0; i < currentItems.length; i++) {
            if (currentItems[i].textContent === currentQuality.label) {
              currentItems[i].classList.add('source_selected');
              break;
            }
          }
        }
      }

      // Close menu when clicking outside
      const closeMenu = (e: MouseEvent) => {
        if (!qualityButton.contains(e.target as Node) && 
            !qualityMenu.contains(e.target as Node)) {
          qualityMenu.style.display = 'none';
        }
      };
      
      document.addEventListener('click', closeMenu);
      
      // Clean up event listener on component unmount
      return () => {
        document.removeEventListener('click', closeMenu);
      };
    }
  }, [isInitialized, episode.video_url_480p, episode.video_url_720p, episode.video_url_1080p]);

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