import { useEffect, useRef } from 'react';
import { FluidPlayerOptions, FluidPlayerInstance } from '../types/fluid-player';
import '../styles/play-button-fix.css';

// Simple test page to verify Fluid Player is loading correctly
const TestPlayerPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<FluidPlayerInstance | null>(null);

  // Inject CSS to fix play button styling and monitor for dynamic changes
  useEffect(() => {
    // Function to inject style to fix play button color
    const injectPlayButtonFix = () => {
      // Create a style element if it doesn't exist
      let styleEl = document.getElementById('test-page-play-button-fix');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'test-page-play-button-fix';
        document.head.appendChild(styleEl);
      }

      // Add more specific CSS to override dynamically generated styles
      styleEl.innerHTML = `
        /* Force override for play button triangle in test page */
        #test-video-player + .fluid_video_wrapper .fluid_initial_play_button,
        #fluid_video_wrapper_test-video-player .fluid_initial_play_button,
        .fluid_video_wrapper .fluid_initial_play_button {
          border-color: transparent transparent transparent hsl(266, 100%, 64%) !important;
        }
        
        /* Target dynamically added pseudo-elements */
        #test-video-player + .fluid_video_wrapper .fluid_initial_play_button:before,
        #test-video-player + .fluid_video_wrapper .fluid_initial_play_button:after,
        #fluid_video_wrapper_test-video-player .fluid_initial_play_button:before,
        #fluid_video_wrapper_test-video-player .fluid_initial_play_button:after,
        .fluid_video_wrapper .fluid_initial_play_button:before,
        .fluid_video_wrapper .fluid_initial_play_button:after {
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

    // Run the injection when component mounts
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
      
      const styleEl = document.getElementById('test-page-play-button-fix');
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, []);

  useEffect(() => {
    console.log('TestPlayerPage - Component mounted');
    
    // Sample demo video URL
    const sampleVideoUrl = 'https://cdn.fluidplayer.com/videos/valerian-480p.mkv';
    
    // Wait for window.fluidPlayer to be available
    const checkForFluidPlayer = () => {
      console.log('Checking for window.fluidPlayer availability');
      console.log('window.fluidPlayer exists:', typeof (window as any).fluidPlayer !== 'undefined' ? 'YES' : 'NO');
      console.log('window.fluidPlayer type:', typeof (window as any).fluidPlayer);
      
      if (typeof (window as any).fluidPlayer === 'function') {
        console.log('Fluid Player is available, initializing test player...');
        initFluidPlayer();
      } else {
        console.log('Fluid Player not available yet, trying again in 500ms');
        setTimeout(checkForFluidPlayer, 500);
      }
    };
    
    // Initialize the player
    const initFluidPlayer = () => {
      if (!videoRef.current) {
        console.error('Video element reference is not available');
        return;
      }
      
      try {
        // Enhanced configuration with streaming support
        const playerInstance = (window as any).fluidPlayer('test-video-player', {
          layoutControls: {
            primaryColor: "hsl(266, 100%, 64%)",
            fillToContainer: true,
            autoPlay: false,
            playbackRateEnabled: true, // Enable playback speed control
            allowTheatre: true, // Enable theater mode
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
              controls: true
            }
          },
          // Modules configuration to properly handle streaming/quality options
          modules: {
            configureDash: (options: any) => {
              return options;
            },
            configureHls: (options: any) => {
              return options;
            }
          }
        });
        
        console.log('Fluid Player instance created successfully:', playerInstance);
        playerInstanceRef.current = playerInstance;
        
        // Add event listeners
        playerInstance.on('play', () => {
          console.log('Test player: Video played');
        });
        
        playerInstance.on('pause', () => {
          console.log('Test player: Video paused');
        });
      } catch (error) {
        console.error('Error initializing Fluid Player in test page:', error);
      }
    };
    
    // Start checking for Fluid Player
    checkForFluidPlayer();
    
    // Cleanup
    return () => {
      try {
        if (playerInstanceRef.current) {
          console.log('Cleaning up test player instance');
          playerInstanceRef.current.destroy();
          playerInstanceRef.current = null;
        }
      } catch (error) {
        console.error('Error cleaning up test player:', error);
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <h1 className="text-2xl font-bold mb-6">Fluid Player Test Page</h1>
      
      <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-lg overflow-hidden">
        <video 
          ref={videoRef}
          id="test-video-player"
          className="w-full aspect-video"
          controls
          playsInline
        >
          {/* Multiple quality sources for testing */}
          <source src="https://cdn.fluidplayer.com/videos/valerian-1080p.mkv" type="video/mp4" data-fluid-hd title="1080p" />
          <source src="https://cdn.fluidplayer.com/videos/valerian-720p.mkv" type="video/mp4" data-fluid-hd title="720p" />
          <source src="https://cdn.fluidplayer.com/videos/valerian-480p.mkv" type="video/mp4" title="480p" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div className="mt-6 text-gray-300">
        <p>This is a test page for Fluid Player. Check the console for detailed logs.</p>
      </div>
    </div>
  );
};

export default TestPlayerPage;