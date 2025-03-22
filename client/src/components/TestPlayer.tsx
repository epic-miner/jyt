import { useRef, useEffect, useState, useCallback } from 'react';
import { Episode } from '@shared/types';
import '../styles/enhanced-player.css'; // We'll create this style file later

// Define available quality options
type VideoQuality = '480p' | '720p' | '1080p' | 'max';

interface TestPlayerProps {
  videoUrl: string;
  title?: string;
  poster?: string;
  episode?: Episode; 
  onTimeUpdate?: (timeData: { currentTime: number; duration: number }) => void;
  onEnded?: () => void;
}

// Add a type for Fluid Player global variable
// This will properly extend the Window interface
interface FluidPlayerWindow extends Window {
  fluidPlayer: (element: string | HTMLVideoElement, options?: any) => any;
}
declare const window: FluidPlayerWindow;

const TestPlayer: React.FC<TestPlayerProps> = ({ videoUrl, title, poster, episode, onTimeUpdate, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('1080p');
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasPlaybackStarted, setHasPlaybackStarted] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Get available quality options from episode - memoize with useCallback
  const getAvailableQualities = useCallback(() => {
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
    if (episode.video_url_max_quality) {
      qualities.push({ quality: 'max', url: episode.video_url_max_quality });
    }

    return qualities;
  }, [episode]);

  // Get current video URL based on selected quality
  const getCurrentVideoUrl = useCallback(() => {
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
  }, [episode, selectedQuality, videoUrl]);

  // Handle quality change
  const handleQualityChange = useCallback((quality: VideoQuality) => {
    if (videoRef.current) {
      // Save current playback time and playing state
      const currentTime = videoRef.current.currentTime;
      const isPlaying = !videoRef.current.paused;
      
      setIsLoading(true);
      // Change quality
      setSelectedQuality(quality);

      // Apply new source
      videoRef.current.src = getCurrentVideoUrl();
      videoRef.current.load();

      // Restore playback position
      videoRef.current.onloadeddata = () => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
          setIsLoading(false);
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
  }, [getCurrentVideoUrl]);

  // Dynamically load Fluid Player script if not available
  const loadFluidPlayerScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window.fluidPlayer === 'function') {
        resolve();
        return;
      }

      // Check if we already have a script tag for fluid player (avoid duplicates)
      const existingScript = document.querySelector('script[src*="fluidplayer.min.js"]');
      if (existingScript) {
        // If script exists but wasn't loaded yet, wait for it
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => 
          reject(new Error('Existing Fluid Player script failed to load')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.fluidplayer.com/v3/current/fluidplayer.min.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      // Add preconnect for performance optimization
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = 'https://cdn.fluidplayer.com';
      document.head.appendChild(preconnect);
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Fluid Player script'));
      document.head.appendChild(script);
    });
  }, []);

  // Initialize Fluid Player
  useEffect(() => {
    let initAttempts = 0;
    const MAX_ATTEMPTS = 10;
    let attemptTimeout: NodeJS.Timeout;
    
    const initPlayer = async () => {
      if (initAttempts >= MAX_ATTEMPTS) {
        console.error('Failed to initialize player after multiple attempts');
        setIsPlayerReady(true); // Fall back to native player
        setIsLoading(false);
        return;
      }
      
      initAttempts++;
      
      // First ensure the script is loaded
      try {
        await loadFluidPlayerScript();
      } catch (error) {
        console.error('Failed to load Fluid Player script:', error);
        attemptTimeout = setTimeout(initPlayer, 500);
        return;
      }
      
      if (!videoRef.current || typeof window.fluidPlayer !== 'function') {
        console.log(`Video element or fluidPlayer not available yet (attempt ${initAttempts}/${MAX_ATTEMPTS})`);
        attemptTimeout = setTimeout(initPlayer, 300);
        return;
      }

      try {
        // Clean up previous instance if it exists
        if (playerInstanceRef.current) {
          playerInstanceRef.current.destroy();
          playerInstanceRef.current = null;
        }

        // Configure player with optimized settings
        const playerOptions = {
          layoutControls: {
            primaryColor: "#ef4444",
            fillToContainer: true,
            posterImage: episode?.thumbnail_url || poster,
            posterImageSize: 'cover',
            playButtonShowing: true,
            playPauseAnimation: true,
            autoPlay: true,
            mute: false,
            keyboardControl: true,
            doubleclickFullscreen: true,
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
            },
            controlForwardBackward: {
              show: true,
              doubleTapMobile: true
            }
          },
          modules: {
            configureHls: (options: any) => {
              return {
                ...options,
                enableWorker: true,
                lowLatencyMode: true,
                startLevel: -1
              };
            }
          }
        };

        // Initialize player
        const videoId = videoRef.current.id;
        playerInstanceRef.current = window.fluidPlayer(videoId, playerOptions);
        
        // Register event handlers
        if (playerInstanceRef.current) {
          playerInstanceRef.current.on('play', () => {
            setHasPlaybackStarted(true);
            setIsLoading(false);
          });
          
          playerInstanceRef.current.on('pause', () => {
            setShowControls(true);
          });
          
          playerInstanceRef.current.on('playing', () => {
            setIsLoading(false);
          });
          
          playerInstanceRef.current.on('waiting', () => {
            setIsLoading(true);
          });
        }

        // Add time update event listener
        if (onTimeUpdate && videoRef.current) {
          videoRef.current.addEventListener('timeupdate', () => {
            onTimeUpdate({
              currentTime: videoRef.current?.currentTime || 0,
              duration: videoRef.current?.duration || 0
            });
          });
        }
        
        // Add ended event listener for auto-play next episode
        if (onEnded && videoRef.current) {
          videoRef.current.addEventListener('ended', () => {
            console.log('Video ended, triggering next episode');
            onEnded();
          });
        }
        
        setIsPlayerReady(true);
      } catch (error) {
        console.error('Error initializing Fluid Player:', error);
        
        // Fall back to native video player
        setIsPlayerReady(true);
        setIsLoading(false);
        
        // Try again if we haven't reached max attempts
        if (initAttempts < MAX_ATTEMPTS) {
          attemptTimeout = setTimeout(initPlayer, 500);
        }
      }
    };

    setIsLoading(true);
    initPlayer();

    // Cleanup
    return () => {
      clearTimeout(attemptTimeout);
      
      if (playerInstanceRef.current) {
        try {
          console.log('Destroying player instance on unmount');
          playerInstanceRef.current.destroy();
          playerInstanceRef.current = null;
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
      
      // Clean up event listeners
      if (videoRef.current) {
        videoRef.current.onloadeddata = null;
      }
    };
  }, [videoUrl, poster, episode, onTimeUpdate, onEnded, loadFluidPlayerScript]);

  // Handle mouse movement for controls visibility
  useEffect(() => {
    const container = playerContainerRef.current;
    if (!container || !hasPlaybackStarted) return;
    
    let controlsTimer: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(controlsTimer);
      
      controlsTimer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(controlsTimer);
    };
  }, [hasPlaybackStarted]);

  return (
    <div 
      ref={playerContainerRef}
      className="enhanced-player-container relative w-full bg-black overflow-hidden"
    >
      <video
        id="test-fluid-player"
        ref={videoRef}
        className="w-full aspect-video"
        controls
        autoPlay
        playsInline
        poster={episode?.thumbnail_url || poster}
        preload="auto"
        onEnded={onEnded}
      >
        <source src={getCurrentVideoUrl()} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-20">
          <div className="loader-spinner"></div>
        </div>
      )}

      {/* Quality selection button */}
      {isPlayerReady && (
        <div className={`absolute bottom-16 right-4 z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <button
            className="bg-black bg-opacity-80 text-white px-3 py-1 rounded-md text-sm flex items-center hover:bg-opacity-100 transition-all"
            onClick={() => setShowQualityMenu(!showQualityMenu)}
          >
            {selectedQuality === 'max' ? 'MAX' : selectedQuality} 
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Quality menu */}
          {showQualityMenu && (
            <div className="absolute bottom-10 right-0 bg-black bg-opacity-90 text-white rounded-md overflow-hidden shadow-lg quality-menu">
              {getAvailableQualities().map(({ quality, url }) => (
                <button
                  key={quality}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${selectedQuality === quality ? 'bg-gray-700' : ''}`}
                  onClick={() => handleQualityChange(quality)}
                  disabled={!url}
                >
                  {quality === 'max' ? 'MAX' : quality}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestPlayer;