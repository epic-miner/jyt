
import React, { useRef, useEffect } from 'react';

interface TestPlayerProps {
  videoUrl: string;
  title?: string;
  poster?: string;
  episode?: any; // Episode data
  videoSources?: {url: string, label: string, type: string, quality?: string}[]; // Add video sources array
  onTimeUpdate?: (timeData: { currentTime: number, duration: number }) => void;
}

const TestPlayer: React.FC<TestPlayerProps> = ({ 
  videoUrl, 
  title, 
  poster, 
  episode, 
  videoSources = [], 
  onTimeUpdate 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<any>(null);
  
  useEffect(() => {
    const initPlayer = () => {
      if (!videoRef.current || typeof window.fluidPlayer !== 'function') {
        console.log('Video element or fluidPlayer not available yet');
        setTimeout(initPlayer, 200);
        return;
      }

      try {
        if (playerInstanceRef.current) {
          playerInstanceRef.current.destroy();
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
              imageUrl: '/assets/logo_optimized.png',
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
          playerInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
    };
  }, [videoUrl, poster, episode, onTimeUpdate]);

  return (
    <div className="fluid-player-container">
      <video
        id="test-fluid-player"
        ref={videoRef}
        className="w-full aspect-video"
        controls
        playsInline
        poster={episode?.thumbnail_url || poster}
      >
        {/* If videoSources are provided, use them for multiple qualities */}
        {videoSources && videoSources.length > 0 ? (
          videoSources.map((source, index) => (
            <source 
              key={index} 
              src={source.url} 
              title={source.label}
              type={source.type}
              {...(source.quality ? { 'data-fluid-hd': '' } : {})}
            />
          ))
        ) : (
          // Fallback to single video URL if no sources array
          <source src={videoUrl} type="video/mp4" />
        )}
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default TestPlayer;
