import { useEffect, useRef } from 'react';
import '../styles/play-button-fix.css';

// Define types for Fluid Player
interface FluidPlayerInstance {
  on: (event: string, callback: () => void) => void;
  destroy: () => void;
}

interface FluidPlayerOptions {
  layoutControls?: {
    primaryColor?: string;
    fillToContainer?: boolean;
  };
}

declare global {
  interface Window {
    fluidPlayer: (id: string, options?: FluidPlayerOptions) => FluidPlayerInstance;
  }
}

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
      `;

      // Create MutationObserver to monitor for any dynamic changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Re-apply our styles when new nodes are added
            const playButtons = document.querySelectorAll('.fluid_initial_play_button');
            playButtons.forEach(button => {
              if (button instanceof HTMLElement) {
                button.style.setProperty('border-color', 'transparent transparent transparent hsl(266, 100%, 64%)', 'important');
              }
            });
          }
        });
      });

      // Start observing the document with the configured parameters
      observer.observe(document.body, { childList: true, subtree: true });

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
      console.log('window.fluidPlayer exists:', typeof window.fluidPlayer !== 'undefined' ? 'YES' : 'NO');
      console.log('window.fluidPlayer type:', typeof window.fluidPlayer);

      if (typeof window.fluidPlayer === 'function') {
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
        // Configure player options
        const playerOptions: FluidPlayerOptions = {
          layoutControls: {
            primaryColor: "#7c3aed", // Purple color
            fillToContainer: true
          }
        };

        // Initialize FluidPlayer
        const playerInstance = window.fluidPlayer(
          'test-video-player',
          playerOptions
        );

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
      <h1 className="text-2xl font-bold mb-6 text-white">Fluid Player Test Page</h1>
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