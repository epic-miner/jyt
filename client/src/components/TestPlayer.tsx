
import React, { useRef, useEffect } from 'react';

interface TestPlayerProps {
  videoUrl: string;
  title?: string;
  poster?: string;
  onTimeUpdate?: (timeData: { currentTime: number, duration: number }) => void;
}

const TestPlayer: React.FC<TestPlayerProps> = ({ videoUrl, title, poster, onTimeUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<any>(null);
  
  useEffect(() => {
    console.log('TestPlayer - Component mounted');
    
    // Wait for window.fluidPlayer to be available
    const checkForFluidPlayer = () => {
      console.log('Checking for window.fluidPlayer availability');
      
      if (typeof window.fluidPlayer === 'function') {
        console.log('Fluid Player is available, initializing player...');
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
        const playerInstance = window.fluidPlayer(videoRef.current.id, {
          layoutControls: {
            primaryColor: "#ef4444",
            fillToContainer: true,
            autoPlay: false,
            playbackRateEnabled: true,
            allowTheatre: true,
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
          modules: {
            configureDash: (options: any) => {
              return options;
            },
            configureHls: (options: any) => {
              return options;
            }
          }
        });
        
        console.log('Fluid Player instance created successfully');
        playerInstanceRef.current = playerInstance;
        
        // Set up time update handler
        if (onTimeUpdate) {
          playerInstance.on('timeupdate', (time: number) => {
            if (!videoRef.current) return;
            
            const currentTime = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            
            onTimeUpdate({
              currentTime,
              duration
            });
          });
        }
      } catch (error) {
        console.error('Error initializing Fluid Player:', error);
      }
    };
    
    // Start checking for Fluid Player
    checkForFluidPlayer();
    
    // Cleanup
    return () => {
      try {
        if (playerInstanceRef.current) {
          console.log('Cleaning up player instance');
          playerInstanceRef.current.destroy();
          playerInstanceRef.current = null;
        }
      } catch (error) {
        console.error('Error cleaning up player:', error);
      }
    };
  }, [videoUrl, onTimeUpdate]);
  
  return (
    <div className="w-full aspect-video bg-black">
      <video 
        ref={videoRef}
        id={`test-video-player-${Math.random().toString(36).substring(2, 9)}`}
        className="w-full aspect-video"
        controls
        playsInline
        poster={poster}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default TestPlayer;
