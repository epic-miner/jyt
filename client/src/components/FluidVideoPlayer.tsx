import { useState, useEffect, useRef, memo } from 'react';
import { Episode, Anime } from '@shared/types';
import { updateWatchHistory } from '../lib/cookies';

// Add custom styles
import '../styles/fluid-player.css';
import '../styles/play-button-fix.css';

// Use the type definition from fluid-player.d.ts
import { FluidPlayerOptions, FluidPlayerInstance, PlayerEventInfo, MiniPlayerToggleEvent } from '../types/fluid-player';

// Using PlayerEventInfo and MiniPlayerToggleEvent from fluid-player.d.ts

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
  const playerInstanceRef = useRef<FluidPlayerInstance | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const maxInitializationAttempts = 10;


  // Get initial video URL based on available qualities - prioritize 1080p
  const getVideoUrl = (): string => {
    return episode.video_url_1080p ||
           episode.video_url_max_quality ||
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
        title: '1080p',
        selected: true // Mark 1080p as selected by default
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

    // If 1080p isn't available, select the highest quality available
    if (!episode.video_url_1080p && sources.length > 0) {
      // Mark the first source as selected (highest quality available)
      sources[0].selected = true;
    }

    return sources;
  };

  // Initialize Fluid Player with enhanced features
  useEffect(() => {
    const initPlayer = () => {
      if (!videoRef.current) return;

      // Clean up any previous instance
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (e) {
          console.error('Error destroying player:', e);
        }
        playerInstanceRef.current = null;
      }

      // Get the video sources for quality options
      const videoSources = getVideoSources();

      // Enhanced player configuration with all available features
      const enhancedOptions: FluidPlayerOptions = {
        layoutControls: {
          // Appearance
          primaryColor: "hsl(266, 100%, 64%)", // Primary accent color matching theme.json (purple)
          fillToContainer: true,
          posterImage: episode.thumbnail_url || anime.thumbnail_url,
          posterImageSize: 'cover' as 'cover', // Type assertion to match the expected type

          // Playback options
          playButtonShowing: true,
          playPauseAnimation: true,
          autoPlay: true,
          mute: false,
          keyboardControl: true,
          loop: false,
          allowDownload: false,
          playbackRateEnabled: true,
          allowTheatre: true,

          // Control bar options
          controlBar: {
            autoHide: true,
            autoHideTimeout: 3,
            animated: true
          },

          // Logo options
          logo: {
            imageUrl: null,
            position: 'top left' as 'top left',
            clickUrl: null,
            opacity: 0.8,
            mouseOverImageUrl: null,
            imageMargin: '10px',
            hideWithControls: true,
            showOverAds: false
          },

          // Context menu options
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

          // Mini player support
          miniPlayer: {
            enabled: true,
            width: 400,
            height: 225,
            widthMobile: 280,
            placeholderText: "Playing in mini player",
            position: "bottom right" as "bottom right",
            autoToggle: false
          },

          // On-pause overlay
          htmlOnPauseBlock: {
            html: `
              <div class="fluid-player-pause-banner">
                <div style="display: flex; align-items: center;">
                  <img src="${anime.thumbnail_url}" style="width: 60px; height: 60px; border-radius: 4px; margin-right: 10px;">
                  <div>
                    <div style="font-weight: bold;">${anime.title}</div>
                    <div>Episode ${episode.episode_number}: ${episode.title}</div>
                  </div>
                </div>
              </div>
            `,
            height: null,
            width: null
          },

          // Captions
          captions: {
            play: 'Play',
            pause: 'Pause',
            mute: 'Mute',
            unmute: 'Unmute',
            fullscreen: 'Fullscreen',
            exitFullscreen: 'Exit Fullscreen'
          },

          // Advanced theater mode
          theatreAdvanced: {
            theatreElement: 'fluid-player-container',
            classToApply: 'theatre-mode'
          },

          // Persistent settings
          persistentSettings: {
            volume: true,
            quality: true,
            speed: true,
            theatre: true
          },

          // Controls for forward/backward
          controlForwardBackward: {
            show: true,
            doubleTapMobile: true
          },

          // Mobile enhancements
          showCardBoardView: false,
          roundedCorners: 8,
          autoRotateFullScreen: true
        },

        // VAST (Video Ad Serving Template) options - enabled but no ads by default
        vastOptions: {
          adList: [],
          adClickable: true,
          showProgressbarMarkers: false,
          adCTAText: false,
          adCTATextPosition: 'bottom right' as 'bottom right'
        },

        // Modules configuration to enable HLS and DASH streaming with quality selection
        modules: {
          // HLS configuration for better streaming
          configureHls: (options: any) => {
            // Set up HLS options for optimal playback
            return {
              ...options,
              // Set quality cap to 1080p (level will depend on available qualities)
              autoLevelCapping: -1, // Still allow auto switching within cap
              // Optimize for low latency streaming
              lowLatencyMode: true,
              // Start with highest quality immediately for better experience
              startLevel: 2, // Usually level 2 corresponds to highest quality (1080p)
            };
          },
          onBeforeInitHls: (hls: any) => {
            console.log('HLS about to initialize for streaming');
          },
          onAfterInitHls: (hls: any) => {
            console.log('HLS initialized for streaming');
          },

          // DASH configuration
          configureDash: (options: any) => {
            // Set up DASH options for optimal playback
            return {
              ...options,
              // These settings help with quality switching
              streaming: {
                fastSwitchEnabled: true,
                lowLatencyEnabled: true,
                abr: {
                  initialBitrate: { video: 5000 }, // Target higher initial bitrate (~1080p)
                  autoSwitchBitrate: { video: true }
                }
              }
            };
          },
          onBeforeInitDash: (dash: any) => {
            console.log('DASH about to initialize for streaming');
          },
          onAfterInitDash: (dash: any) => {
            console.log('DASH initialized for streaming');
          }
        }
      };

      try {
        // Extensive debugging to check if fluidPlayer is loaded and working
        console.log('Attempting to initialize Fluid Player...');
        console.log('window.fluidPlayer exists:', typeof window.fluidPlayer !== 'undefined' ? 'YES' : 'NO');
        console.log('window.fluidPlayer type:', typeof window.fluidPlayer);
        console.log('video element exists:', videoRef.current ? 'YES' : 'NO');

        // Log all scripts loaded in the page to check for fluidplayer
        const scripts = document.querySelectorAll('script');
        console.log('All loaded scripts:');
        scripts.forEach(script => {
          console.log('Script src:', script.src);
        });

        if (typeof window.fluidPlayer !== 'function') {
          console.error('Fluid Player not loaded correctly! window.fluidPlayer is:', window.fluidPlayer);
          // Use native video controls as fallback
          setIsPlayerReady(true);

          // Try to dynamically load Fluid Player
          console.log('Attempting to dynamically load Fluid Player...');
          const fluidPlayerScript = document.createElement('script');
          fluidPlayerScript.src = 'https://cdn.fluidplayer.com/v3/current/fluidplayer.min.js';
          fluidPlayerScript.onload = () => {
            console.log('Fluid Player script loaded dynamically!');
            console.log('window.fluidPlayer now exists:', typeof window.fluidPlayer !== 'undefined' ? 'YES' : 'NO');
            initPlayer(); // Retry initialization after dynamic load
          };
          document.head.appendChild(fluidPlayerScript);

          return;
        }

        // Initialize with enhanced options
        const fpInstance = window.fluidPlayer('anime-player', enhancedOptions);
        console.log('Fluid Player instance created successfully');

        // Store player instance for later control
        playerInstanceRef.current = fpInstance;

        // Force play the video after initialization
        setTimeout(() => {
          if (fpInstance && videoRef.current) {
            console.log('Forcing playback to start...');
            fpInstance.play();
            videoRef.current.play().catch(e => console.error('Error forcing play:', e));
          }
        }, 500);

        // Register event listeners for advanced functionality
        fpInstance.on('play', (eventInfo: PlayerEventInfo) => {
          console.log('Video played', eventInfo);
          startWatchHistoryTracking();
        });

        fpInstance.on('pause', (eventInfo: PlayerEventInfo) => {
          console.log('Video paused', eventInfo);
        });

        fpInstance.on('timeupdate', (time: number, eventInfo: PlayerEventInfo) => {
          updateWatchProgress();
        });

        fpInstance.on('ended', (eventInfo: PlayerEventInfo) => {
          console.log('Video ended', eventInfo);
          clearWatchHistoryTracking();
          if (hasNext) {
            setTimeout(() => {
              onNextEpisode();
            }, 1500);
          }
        });

        fpInstance.on('seeked', (eventInfo: PlayerEventInfo) => {
          console.log('Video seeked', eventInfo);
        });

        fpInstance.on('theatreModeOn', (event: Event, eventInfo: PlayerEventInfo) => {
          console.log('Theatre mode enabled', eventInfo);
        });

        fpInstance.on('theatreModeOff', (event: Event, eventInfo: PlayerEventInfo) => {
          console.log('Theatre mode disabled', eventInfo);
        });

        fpInstance.on('miniPlayerToggle', (event: MiniPlayerToggleEvent, eventInfo: PlayerEventInfo) => {
          console.log('Mini player toggled:', event.detail.isToggledOn);
        });

        // Additional script to remove download button completely (using DOM manipulation)
        setTimeout(() => {
          try {
            // Remove any download buttons that might have been created
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
            console.log('Note: Download button removal script ran', e);
          }
        }, 500);

        setIsPlayerReady(true);
      } catch (error) {
        console.error('Error initializing Fluid Player:', error);
        // Fallback to native video if Fluid Player fails
        setIsPlayerReady(true);
        if (initializationAttempts < maxInitializationAttempts) {
          setInitializationAttempts(prev => prev + 1);
          setTimeout(initPlayer, 500); //Retry after 500ms
        }
      }
    };

    // Start initialization process
    initPlayer();

    return () => {
      // Cleanup on unmount
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
          playerInstanceRef.current = null;
        } catch (error) {
          console.error('Error destroying player:', error);
        }
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

  // Inject CSS to fix play button styling and monitor for dynamic changes
  useEffect(() => {
    // Function to inject style to fix play button color
    const injectPlayButtonFix = () => {
      // Create a style element if it doesn't exist
      let styleEl = document.getElementById('play-button-style-fix');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'play-button-style-fix';
        document.head.appendChild(styleEl);
      }

      // Add more specific CSS to override dynamically generated styles
      styleEl.innerHTML = `
        /* Force override for play button triangle */
        .fluid_initial_play_button {
          border-color: transparent transparent transparent hsl(266, 100%, 64%) !important;
        }
        
        /* Target dynamically added pseudo-elements */
        .fluid_initial_play_button:before,
        .fluid_initial_play_button:after {
          border-color: transparent transparent transparent hsl(266, 100%, 64%) !important;
        }
        
        /* For SVG triangles or other icons */
        .fluid_initial_play_button svg,
        .fluid_initial_play_button i {
          color: hsl(266, 100%, 64%) !important;
          fill: hsl(266, 100%, 64%) !important;
        }
      `;

      // Directly target play button elements and modify inline styles
      const fixPlayButtonStyles = () => {
        const playButtons = document.querySelectorAll('.fluid_initial_play_button');
        playButtons.forEach(button => {
          if (button instanceof HTMLElement) {
            // Override any inline styles
            button.style.setProperty('border-color', 'transparent transparent transparent hsl(266, 100%, 64%)', 'important');
            
            // Also look for any SVG or icon children
            const svgElements = button.querySelectorAll('svg, i');
            svgElements.forEach(svg => {
              if (svg instanceof HTMLElement) {
                svg.style.setProperty('color', 'hsl(266, 100%, 64%)', 'important');
                svg.style.setProperty('fill', 'hsl(266, 100%, 64%)', 'important');
              }
            });
          }
        });
      };
      
      // Run the style fix
      fixPlayButtonStyles();
      
      // Set up a MutationObserver to watch for dynamically added play buttons
      const observer = new MutationObserver((mutations) => {
        let needsFix = false;
        
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node instanceof HTMLElement) {
                if (node.classList.contains('fluid_initial_play_button') || 
                    node.querySelector('.fluid_initial_play_button')) {
                  needsFix = true;
                }
              }
            });
          }
        });
        
        if (needsFix) {
          fixPlayButtonStyles();
        }
      });
      
      // Start observing the document with the configured parameters
      observer.observe(document.body, { 
        childList: true, 
        subtree: true
      });
      
      // Store the observer for cleanup
      return observer;
    };

    // Run the injection when component mounts and whenever player becomes ready
    const observer = injectPlayButtonFix();
    
    // Run fixes at specific intervals to ensure styling persists
    const fixInterval = setInterval(() => {
      const playButtons = document.querySelectorAll('.fluid_initial_play_button');
      playButtons.forEach(button => {
        if (button instanceof HTMLElement) {
          button.style.setProperty('border-color', 'transparent transparent transparent hsl(266, 100%, 64%)', 'important');
        }
      });
    }, 1000);
    
    return () => {
      // Cleanup
      if (observer) {
        observer.disconnect();
      }
      clearInterval(fixInterval);
      
      const styleEl = document.getElementById('play-button-style-fix');
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, [isPlayerReady]);

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
      {/* Main video container - optimized for mobile */}
      <div className="relative w-full bg-black overflow-hidden aspect-video">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Video element that Fluid Player will enhance */}
          <video
            ref={videoRef}
            className="w-full h-full"
            data-fluid-player
            id="anime-player"
            controls
            playsInline
            autoPlay
            preload="auto"
            onLoadedData={() => {
              // Force playback to start when the video data has loaded
              if (videoRef.current) {
                videoRef.current.play().catch(e => {
                  console.error('Error auto-starting playback:', e);
                });
              }
            }}
            onCanPlay={() => {
              // Also try to play when the video can start playing
              if (videoRef.current) {
                videoRef.current.play().catch(e => {
                  console.error('Error on canplay event:', e);
                });
              }
            }}
          >
            {/* Use multiple source tags with data-fluid-hd attribute for HD quality sources */}
            {/* Default to 1080p, make it the first source */}
            {episode.video_url_1080p && (
              <source src={episode.video_url_1080p} type="video/mp4" data-fluid-hd title="1080p" />
            )}
            {episode.video_url_720p && (
              <source src={episode.video_url_720p} type="video/mp4" data-fluid-hd title="720p" />
            )}
            {episode.video_url_480p && (
              <source src={episode.video_url_480p} type="video/mp4" title="480p" />
            )}
            {!episode.video_url_1080p && !episode.video_url_720p && !episode.video_url_480p && (
              <source src={episode.video_url_max_quality} type="video/mp4" title="Auto" />
            )}
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Episode navigation bar - mobile optimized */}
      <div className="bg-black py-2 px-3 sm:py-3 sm:px-4 flex justify-between items-center border-t border-gray-800/30">
        <button
          className="bg-gray-800/70 hover:bg-gray-700/70 transition px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={onPreviousEpisode}
          disabled={!hasPrevious}
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="19 20 9 12 19 4"></polyline>
          </svg>
          <span className="sm:inline hidden">Previous</span>
          <span className="sm:hidden inline">Prev</span>
        </button>

        <div className="text-xs sm:text-sm text-gray-300">
          Ep <span className="font-bold">{episode.episode_number}</span>
        </div>

        <button
          className="bg-gray-800/70 hover:bg-gray-700/70 transition px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={onNextEpisode}
          disabled={!hasNext}
        >
          <span className="sm:inline hidden">Next</span>
          <span className="sm:hidden inline">Next</span>
          <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="5 4 15 12 5 20"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Optimize with memo to prevent unnecessary re-renders
export default memo(FluidVideoPlayer);