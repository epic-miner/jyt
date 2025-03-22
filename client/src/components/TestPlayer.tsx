import { useRef, useEffect, useState } from 'react';

// Define available quality options
type VideoQuality = '480p' | '720p' | '1080p' | 'max';

interface TestPlayerProps {
  videoUrl: string;
  title?: string;
  poster?: string;
  episode?: any; 
  onTimeUpdate?: (timeData: { currentTime: number; duration: number }) => void;
}

const TestPlayer: React.FC<TestPlayerProps> = ({ videoUrl, title, poster, episode, onTimeUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('max');
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);

  // Get available quality options from episode
  const getAvailableQualities = () => {
    if (!episode) return [];

    const qualities: { quality: VideoQuality; url: string | undefined }[] = [];

    if (episode.video_url_480p) {
      qualities.push({ quality: '480p', url: episode.video_url_480p });
    }

    if (episode.video_url_720p) {
      qualities.push({ quality: '720p', url: episode.video_url_720p });
    }

    if (episode.video_url_1080p) {
      qualities.push({ quality: '1080p', url: episode.video_url_1080p });
    }

    // Always include max quality
    qualities.push({ quality: 'max', url: episode.video_url_max_quality });

    return qualities;
  };

  // Get current video URL based on selected quality
  const getCurrentVideoUrl = () => {
    if (!episode) return videoUrl;

    switch (selectedQuality) {
      case '480p':
        return episode.video_url_480p || videoUrl;
      case '720p':
        return episode.video_url_720p || videoUrl;
      case '1080p':
        return episode.video_url_1080p || videoUrl;
      case 'max':
      default:
        return episode.video_url_max_quality || videoUrl;
    }
  };

  // Handle quality change
  const handleQualityChange = (quality: VideoQuality) => {
    if (videoRef.current) {
      // Save current playback time and playing state
      const currentTime = videoRef.current.currentTime;
      const isPlaying = !videoRef.current.paused;

      // Change quality
      setSelectedQuality(quality);

      // Apply new source
      videoRef.current.src = getCurrentVideoUrl();
      videoRef.current.load();

      // Restore playback position
      videoRef.current.onloadeddata = () => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
          if (isPlaying) {
            videoRef.current.play().catch(e => {
              console.error('Error playing video after quality change:', e);
            });
          }
        }
      };

      // Hide quality menu
      setShowQualityMenu(false);
    }
  };

  useEffect(() => {
    let initAttempts = 0;
    const MAX_ATTEMPTS = 10;
    
    const initPlayer = () => {
      if (initAttempts >= MAX_ATTEMPTS) {
        console.error('Failed to initialize player after multiple attempts');
        return;
      }
      
      initAttempts++;
      
      if (!videoRef.current || typeof window.fluidPlayer !== 'function') {
        console.log(`Video element or fluidPlayer not available yet (attempt ${initAttempts}/${MAX_ATTEMPTS})`);
        setTimeout(initPlayer, 200);
        return;
      }

      try {
        if (playerInstanceRef.current) {
          playerInstanceRef.current.destroy();
          playerInstanceRef.current = null;
        }

        const playerOptions = {
          layoutControls: {
            primaryColor: "#ef4444",
            fillToContainer: true,
            posterImage: episode?.thumbnail_url || poster,
            posterImageSize: 'cover',
            playButtonShowing: true,
            playPauseAnimation: true,
            autoPlay: false,
            mute: false,
            keyboardControl: true,
            loop: false,
            allowDownload: false,
            playbackRateEnabled: true,
            allowTheatre: true,
            controlBar: {
              autoHide: true,
              autoHideTimeout: 3,
              animated: true
            },
            logo: {
              position: 'top left',
              clickUrl: null,
              opacity: 0.8,
              mouseOverImageUrl: null,
              imageMargin: '10px',
              hideWithControls: true,
              showOverAds: false
            },
            contextMenu: {
              controls: true,
              links: []
            }
          }
        };

        // Initialize player
        const videoId = videoRef.current.id;
        playerInstanceRef.current = window.fluidPlayer(videoId, playerOptions);

        // Add time update event listener
        if (onTimeUpdate) {
          videoRef.current.addEventListener('timeupdate', () => {
            onTimeUpdate({
              currentTime: videoRef.current?.currentTime || 0,
              duration: videoRef.current?.duration || 0
            });
          });
        }
      } catch (error) {
        console.error('Error initializing Fluid Player:', error);
      }
    };

    initPlayer();

    // Cleanup
    return () => {
      if (playerInstanceRef.current) {
        try {
          console.log('Destroying player instance on unmount');
          playerInstanceRef.current.destroy();
          playerInstanceRef.current = null;
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
      
      // Clean up event listeners from the video element
      if (videoRef.current) {
        videoRef.current.onloadeddata = null;
      }
    };
  }, [videoUrl, poster, episode, onTimeUpdate]);

  // Update video source when quality changes
  useEffect(() => {
    if (videoRef.current) {
      const newUrl = getCurrentVideoUrl();
      if (videoRef.current.src !== newUrl) {
        console.log(`Updating video source to: ${newUrl}`);
        videoRef.current.src = newUrl;
        videoRef.current.load();
      }
    }
  }, [selectedQuality, episode]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      if (onTimeUpdate && videoElement.duration) {
        onTimeUpdate({
          currentTime: videoElement.currentTime,
          duration: videoElement.duration
        });
      }
    };

    // Close quality menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showQualityMenu && 
          !((event.target as HTMLElement).closest('.quality-menu') || 
            (event.target as HTMLElement).closest('button'))) {
        setShowQualityMenu(false);
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    document.addEventListener('click', handleClickOutside);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onTimeUpdate, showQualityMenu]);

  return (
    <div className="fluid-player-container">
      <div className="relative w-full">
        <video
          id="test-fluid-player"
          ref={videoRef}
          className="w-full aspect-video"
          controls
          playsInline
          poster={episode?.thumbnail_url || poster}
        >
          <source src={getCurrentVideoUrl()} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Quality selection button */}
        <div className="absolute bottom-16 right-4 z-10">
          <button
            className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-md text-sm flex items-center"
            onClick={() => setShowQualityMenu(!showQualityMenu)}
          >
            {selectedQuality === 'max' ? 'MAX' : selectedQuality} 
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Quality menu */}
          {showQualityMenu && (
            <div className="absolute bottom-10 right-0 bg-black bg-opacity-90 text-white rounded-md overflow-hidden">
              {getAvailableQualities().map(({ quality, url }) => (
                <button
                  key={quality}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${selectedQuality === quality ? 'bg-gray-700' : ''}`}
                  onClick={() => handleQualityChange(quality)}
                  disabled={!url}
                >
                  {quality === 'max' ? 'MAX' : quality}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPlayer;