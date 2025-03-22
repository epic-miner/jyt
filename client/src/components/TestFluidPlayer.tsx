import React, { useEffect, useRef } from 'react';
import '../styles/fluid-player.css';

interface TestFluidPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
}

declare global {
  interface Window {
    fluidPlayer: any;
  }
}

const TestFluidPlayer: React.FC<TestFluidPlayerProps> = ({ 
  videoUrl, 
  posterUrl = '', 
  title = 'Video Player' 
}) => {
  const playerRef = useRef<HTMLVideoElement>(null);
  const fluidPlayerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (playerRef.current && window.fluidPlayer) {
      // Destroy previous instance if it exists
      if (fluidPlayerInstanceRef.current) {
        fluidPlayerInstanceRef.current.destroy();
      }

      // Initialize new player instance
      const playerInstance = window.fluidPlayer(playerRef.current.id, {
        layoutControls: {
          primaryColor: "#0080ff",
          playButtonShowing: true,
          playPauseAnimation: true,
          fillToContainer: true,
          autoPlay: false,
          mute: false,
          keyboardControl: true,
          allowDownload: true,
          playbackRateEnabled: true,
          controlBar: {
            autoHide: true,
            autoHideTimeout: 3,
            animated: true
          },
          logo: {
            imageUrl: null,
            position: 'top left',
            clickUrl: null,
            opacity: 0.8,
            mouseOverImageUrl: null,
            imageMargin: '2px',
            hideWithControls: true,
            showOverAds: false
          },
          title: title,
          posterImage: posterUrl,
          miniPlayer: {
            enabled: true,
            width: 300,
            height: 200,
            position: 'bottom-right'
          },
          theatre: {
            width: '80%',
            height: '70%',
            marginTop: 50,
            horizontalAlign: 'center'
          },
          htmlOnPauseBlock: {
            html: null,
            height: null,
            width: null
          }
        },
        vastOptions: {
          adList: [],
          skipButtonCaption: 'Skip ad in [seconds]',
          skipButtonClickCaption: 'Skip ad',
          adText: null,
          adTextPosition: 'top left',
          adCTAText: 'Visit now',
          adCTATextPosition: 'bottom right',
        }
      });

      fluidPlayerInstanceRef.current = playerInstance;

      // Event listeners for better UX
      playerInstance.on('play', () => {
        console.log('Video started playing');
      });

      playerInstance.on('pause', () => {
        console.log('Video paused');
      });

      playerInstance.on('ended', () => {
        console.log('Video ended');
      });
    }

    // Cleanup on unmount
    return () => {
      if (fluidPlayerInstanceRef.current) {
        fluidPlayerInstanceRef.current.destroy();
      }
    };
  }, [videoUrl, posterUrl, title]);

  return (
    <div className="video-player-container">
      <video id="my-fluid-player" ref={playerRef} width="100%">
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
};

export default TestFluidPlayer;