import { useEffect, useRef } from 'react';

// Declare the global fluidPlayer variable loaded from CDN
declare global {
  interface Window {
    fluidPlayer: (element: string | HTMLVideoElement, options?: any) => any;
  }
}

const TestFluidPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Use a sample video URL for testing
  const sampleVideoUrl = 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.mp4';
  
  useEffect(() => {
    console.log('TestFluidPlayer component mounted');
    
    // Initialize the player when the component mounts
    try {
      // Check if fluidPlayer is loaded
      console.log('window.fluidPlayer available:', typeof window.fluidPlayer === 'function');
      
      // Simple initialization with minimal options
      if (typeof window.fluidPlayer === 'function') {
        console.log('Initializing fluid player');
        const player = window.fluidPlayer('test-player', {
          layoutControls: {
            fillToContainer: true
          }
        });
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
    };
  }, []);
  
  return (
    <div className="w-full my-4">
      <h2 className="text-lg mb-2">Test Fluid Player</h2>
      <div className="relative w-full overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute top-0 left-0 w-full h-full">
          <video
            ref={videoRef}
            id="test-player"
            className="w-full h-full"
            controls
            crossOrigin="anonymous"
          >
            <source src={sampleVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default TestFluidPlayer;