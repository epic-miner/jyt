
import { useEffect, useRef } from 'react';

// Declare the global fluidPlayer variable loaded from CDN
declare global {
  interface Window {
    fluidPlayer: (element: string | HTMLVideoElement, options?: any) => any;
  }
}

const TestFluidPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<any>(null);
  
  // Use a sample video URL for testing
  const sampleVideoUrl = 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.mp4';
  
  useEffect(() => {
    console.log('TestFluidPlayer component mounted');
    
    // Initialize the player when the component mounts
    try {
      // Check if fluidPlayer is loaded
      console.log('window.fluidPlayer available:', typeof window.fluidPlayer === 'function');
      
      // Enhanced initialization with more options
      if (typeof window.fluidPlayer === 'function') {
        console.log('Initializing fluid player');
        const player = window.fluidPlayer('test-player', {
          layoutControls: {
            primaryColor: "#ef4444", // Match your theme's primary color
            fillToContainer: true,
            posterImage: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.jpg', // Thumbnail image
            playButtonShowing: true,
            playPauseAnimation: true,
            autoPlay: false,
            mute: false,
            controlBar: {
              autoHide: true,
              autoHideTimeout: 3,
              animated: true
            },
            logo: {
              imageUrl: '/assets/logo_optimized.png', // Your logo
              position: 'top left',
              clickUrl: null,
              opacity: 0.8,
              mouseOverImageUrl: null,
              imageMargin: '10px',
              hideWithControls: true,
              showOverAds: false
            },
            // Uncomment if you have a VTT file with thumbnails
            // timelinePreview: {
            //   file: '/assets/thumbnails.vtt',
            //   type: 'VTT'
            // },
            allowDownload: true,
            playbackRateEnabled: true,
            allowTheatre: true,
            theatreSettings: {
              width: '100%',
              height: '60%',
              marginTop: 0,
              horizontalAlign: 'center',
              keepPosition: true
            },
            contextMenu: {
              controls: true,
              links: [
                {
                  href: "https://github.com/fluid-player/fluid-player",
                  label: "About Fluid Player"
                }
              ]
            }
          },
          // Add advertising if needed
          // vastOptions: {
          //   adList: [
          //     {
          //       roll: 'preRoll',
          //       vastTag: 'your-vast-tag-url'
          //     }
          //   ]
          // }
        });
        
        playerInstanceRef.current = player;
        
        // Add event listeners
        player.on('play', () => console.log('Video playing'));
        player.on('pause', () => console.log('Video paused'));
        player.on('ended', () => console.log('Video ended'));
        player.on('timeupdate', (currentTime) => console.log('Current time:', currentTime));
        
        console.log('Fluid player instance:', player);
      } else {
        console.error('Fluid Player not loaded or available!');
      }
    } catch (error) {
      console.error('Error initializing Fluid Player:', error);
    }
    
    return () => {
      // Cleanup on unmount
      console.log('TestFluidPlayer component unmounting');
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
    };
  }, []);
  
  return (
    <div className="w-full my-4">
      <h2 className="text-xl font-semibold mb-3">Video Player</h2>
      <div className="video-aspect-container">
        <div className="video-container">
          <video
            ref={videoRef}
            id="test-player"
            className="fluid-video"
            controls
            crossOrigin="anonymous"
          >
            <source src={sampleVideoUrl} type="video/mp4" title="720p" />
            {/* Add additional source elements for different qualities */}
            <p>Your browser does not support HTML5 video.</p>
          </video>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-500">
        Use keyboard shortcuts: Space (play/pause), F (fullscreen), M (mute)
      </div>
    </div>
  );
};

export default TestFluidPlayer;
