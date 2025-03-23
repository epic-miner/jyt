import { useEffect, useRef } from 'react';
import { FluidPlayerOptions, FluidPlayerInstance } from '../types/fluid-player';

// Simple test page to verify Fluid Player is loading correctly
const TestPlayerPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<FluidPlayerInstance | null>(null);

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
        // Enhanced configuration with streaming support
        const playerInstance = window.fluidPlayer('test-video-player', {
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