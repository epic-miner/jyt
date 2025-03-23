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

  // Get current video URL based on selected quality with smart fallbacks
  const getCurrentVideoUrl = useCallback(() => {
    // If no episode data, fall back to the main videoUrl prop
    if (!episode) return videoUrl;
    
    // Smart quality selection with fallbacks
    switch (selectedQuality) {
      case '480p':
        if (episode.video_url_480p) {
          return episode.video_url_480p;
        } else {
          // If 480p isn't available, try higher qualities in ascending order
          console.log('480p not available, trying alternative qualities');
          return episode.video_url_720p || 
                 episode.video_url_1080p || 
                 episode.video_url_max_quality || 
                 videoUrl;
        }
        
      case '720p':
        if (episode.video_url_720p) {
          return episode.video_url_720p;
        } else {
          // If 720p isn't available, try other qualities (first lower, then higher)
          console.log('720p not available, trying alternative qualities');
          return episode.video_url_480p || 
                 episode.video_url_1080p || 
                 episode.video_url_max_quality || 
                 videoUrl;
        }
        
      case '1080p':
        if (episode.video_url_1080p) {
          return episode.video_url_1080p;
        } else {
          // If 1080p isn't available, try lower qualities in descending order
          console.log('1080p not available, trying alternative qualities');
          return episode.video_url_720p || 
                 episode.video_url_480p || 
                 episode.video_url_max_quality || 
                 videoUrl;
        }
        
      case 'max':
      default:
        // For max or auto quality, use the best available quality
        if (episode.video_url_max_quality) {
          return episode.video_url_max_quality;
        } else {
          // If max quality isn't specifically available, try the highest resolution
          console.log('Max quality not available, using highest available resolution');
          return episode.video_url_1080p || 
                 episode.video_url_720p || 
                 episode.video_url_480p || 
                 videoUrl;
        }
    }
  }, [episode, selectedQuality, videoUrl]);

  // Handle quality change with direct quality application
  const handleQualityChange = useCallback((quality: VideoQuality) => {
    if (videoRef.current) {
      // Save current playback state
      const currentTime = videoRef.current.currentTime;
      const isPlaying = !videoRef.current.paused;
      const currentVolume = videoRef.current.volume;
      
      // Show loading state first
      setIsLoading(true);
      
      console.log(`Starting quality change to: ${quality}`);
      console.log(`Player state - Time: ${currentTime}, Playing: ${isPlaying}, Volume: ${currentVolume}`);
      
      // Determine the source URL directly rather than relying on state updates
      let newSource = '';
      
      // Directly determine source URL based on selected quality
      if (!episode) {
        // Fallback to the videoUrl prop if no episode data
        newSource = videoUrl;
        console.log('No episode data, using default URL:', newSource);
      } else {
        // Determine URL based on requested quality with fallbacks
        switch (quality) {
          case '1080p':
            if (episode.video_url_1080p) {
              newSource = episode.video_url_1080p;
              console.log('Using 1080p source:', newSource);
            } else {
              newSource = episode.video_url_720p || 
                         episode.video_url_480p || 
                         episode.video_url_max_quality || 
                         videoUrl;
              console.log('1080p not available, using fallback:', newSource);
            }
            break;
            
          case '720p':
            if (episode.video_url_720p) {
              newSource = episode.video_url_720p;
              console.log('Using 720p source:', newSource);
            } else {
              newSource = episode.video_url_480p || 
                         episode.video_url_1080p || 
                         episode.video_url_max_quality || 
                         videoUrl;
              console.log('720p not available, using fallback:', newSource);
            }
            break;
            
          case '480p':
            if (episode.video_url_480p) {
              newSource = episode.video_url_480p;
              console.log('Using 480p source:', newSource);
            } else {
              newSource = episode.video_url_720p || 
                         episode.video_url_1080p || 
                         episode.video_url_max_quality || 
                         videoUrl;
              console.log('480p not available, using fallback:', newSource);
            }
            break;
            
          case 'max':
          default:
            newSource = episode.video_url_max_quality || 
                       episode.video_url_1080p || 
                       episode.video_url_720p || 
                       episode.video_url_480p || 
                       videoUrl;
            console.log('Using max quality source:', newSource);
        }
      }
      
      try {
        console.log(`Applying quality change to ${quality}, URL: ${newSource}`);
        
        if (!newSource) {
          console.error('No valid source URL found for quality:', quality);
          setIsLoading(false);
          setShowQualityMenu(false);
          return;
        }
        
        // Update quality state (do this immediately)
        setSelectedQuality(quality);
        
        // Update source and reload the player
        videoRef.current.src = newSource;
        videoRef.current.load();
        
        // After loading new source, restore playback position and state
        videoRef.current.onloadeddata = () => {
          if (videoRef.current) {
            console.log(`Video loaded, restoring time to ${currentTime} and volume to ${currentVolume}`);
            
            // Restore playback position and volume
            videoRef.current.currentTime = currentTime;
            videoRef.current.volume = currentVolume;
            
            // Hide loading spinner
            setIsLoading(false);
            
            // Resume playback if it was playing before
            if (isPlaying) {
              console.log('Resuming playback');
              const playPromise = videoRef.current.play();
              
              // Handle play promise properly
              if (playPromise !== undefined) {
                playPromise.catch(error => {
                  console.error('Error resuming playback after quality change:', error);
                });
              }
            }
          }
        };
        
        // Add error handling for source loading failures
        videoRef.current.onerror = () => {
          console.error('Failed to load video with selected quality:', quality);
          setIsLoading(false);
          
          // If the new quality fails, try falling back to max quality
          if (quality !== 'max' && episode?.video_url_max_quality) {
            console.log('Falling back to max quality after quality selection error');
            videoRef.current!.src = episode.video_url_max_quality;
            videoRef.current!.load();
            
            // Restore playback state after fallback
            videoRef.current!.onloadeddata = () => {
              if (videoRef.current) {
                videoRef.current.currentTime = currentTime;
                if (isPlaying) {
                  videoRef.current.play().catch(e => {
                    console.error('Error playing fallback quality:', e);
                  });
                }
              }
            };
          }
        };
      } catch (error) {
        console.error('Error during quality change:', error);
        setIsLoading(false);
      }
      
      // Hide quality menu regardless of success/failure
      setShowQualityMenu(false);
    }
  }, [episode, videoUrl]);

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
          
          // Force playback to start after initialization
          setTimeout(() => {
            if (playerInstanceRef.current && videoRef.current) {
              console.log('Forcing TestPlayer playback to start...');
              playerInstanceRef.current.play();
              videoRef.current.play().catch(e => console.error('Error forcing play:', e));
            }
          }, 500);
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
      
      // Clean up event listeners and release resources
      if (videoRef.current) {
        try {
          // Stop all video activity
          videoRef.current.pause();
          videoRef.current.removeAttribute('src');
          videoRef.current.load();
          
          // Remove all event listeners
          videoRef.current.onloadeddata = null;
          videoRef.current.oncanplay = null;
          videoRef.current.onended = null;
          videoRef.current.ontimeupdate = null;
          
          console.log('Successfully cleaned up video element');
        } catch (error) {
          console.error('Error during video cleanup:', error);
        }
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
        onLoadedData={() => {
          // Force playback to start when the video data has loaded
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              console.error('Error auto-starting playback:', e);
            });
            setIsLoading(false);
          }
        }}
        onCanPlay={() => {
          // Also try to play when the video can start playing
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              console.error('Error on canplay event:', e);
            });
            setIsLoading(false);
          }
        }}
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

      {/* Quality selection button - Responsive */}
      {isPlayerReady && (
        <div 
          className={`absolute z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
          style={{
            bottom: 'clamp(10px, 5vh, 60px)', 
            right: 'clamp(10px, 3vw, 30px)'
          }}
        >
          <button
            className="bg-black bg-opacity-80 text-white rounded-md flex items-center hover:bg-opacity-100 transition-all transform active:scale-95"
            style={{
              padding: 'clamp(0.25rem, 1vw, 0.75rem) clamp(0.5rem, 2vw, 1rem)',
              fontSize: 'clamp(0.75rem, 3vw, 1rem)'
            }}
            onClick={() => setShowQualityMenu(!showQualityMenu)}
          >
            {selectedQuality === 'max' ? 'MAX' : selectedQuality} 
            <svg 
              className="ml-1" 
              style={{
                width: 'clamp(0.75rem, 3vw, 1rem)',
                height: 'clamp(0.75rem, 3vw, 1rem)'
              }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Quality menu - Responsive */}
          {showQualityMenu && (
            <div 
              className="absolute right-0 bg-black bg-opacity-90 text-white rounded-md overflow-hidden shadow-lg quality-menu"
              style={{
                bottom: 'calc(100% + 0.5rem)',
                width: 'clamp(80px, 25vw, 150px)',
                maxHeight: 'clamp(120px, 30vh, 300px)',
                overflowY: 'auto'
              }}
            >
              {getAvailableQualities().map(({ quality, url }) => (
                <button
                  key={quality}
                  className={`block w-full text-left hover:bg-gray-700 transition-colors ${selectedQuality === quality ? 'bg-gray-700' : ''}`}
                  style={{
                    padding: 'clamp(0.4rem, 1.5vw, 0.7rem) clamp(0.7rem, 2vw, 1.2rem)',
                    fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)'
                  }}
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