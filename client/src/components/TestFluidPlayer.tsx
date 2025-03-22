import React, { useEffect, useRef, useState } from 'react';
import '../styles/fluid-player.css';

interface TestFluidPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  episodeNumber?: number;
  totalEpisodes?: number;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
}

declare global {
  interface Window {
    fluidPlayer: any;
  }
}


const TestFluidPlayer: React.FC<TestFluidPlayerProps> = ({ 
  videoUrl, 
  posterUrl, 
  title,
  episodeNumber = 1,
  totalEpisodes = 1,
  onNextEpisode,
  onPrevEpisode
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Initialize Fluid Player with enhanced options
    const player = window.fluidPlayer(videoRef.current.id, {
      layoutControls: {
        primaryColor: "#9333ea",
        playButtonShowing: true,
        playPauseAnimation: true,
        fillToContainer: true,
        autoPlay: false,
        keyboardControl: true,
        controlBar: {
          animated: true,
          autoHide: true,
          autoHideTimeout: 3,
          animated: true
        },
        logo: {
          imageUrl: null, // Add your logo URL here if needed
          position: 'top left',
          clickUrl: null,
          opacity: 0.8,
          mouseOverImageUrl: null,
          imageMargin: '10px',
          hideWithControls: true,
          showOverAds: false
        },
        htmlOnPauseBlock: {
          html: title ? `<div style="display:flex;align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);color:white;font-family:Inter,sans-serif;"><div style="background:rgba(0,0,0,0.7);padding:20px;border-radius:8px;text-align:center;"><h2>${title}</h2><p>Episode ${episodeNumber}</p></div></div>` : null,
          width: 100,
          height: 100
        },
        allowDownload: false,
        playbackRateEnabled: true,
        allowTheatre: true,
        posterImage: posterUrl || '',
        mouseOutTimeFocus: 3000,
      }
    });

    playerInstanceRef.current = player;
    
    // Add event listeners
    player.on('play', function() {
      console.log('Video played');
    });
    
    player.on('pause', function() {
      console.log('Video paused');
    });
    
    player.on('timeupdate', function() {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
        setDuration(videoRef.current.duration);
      }
    });
    
    player.on('ended', function() {
      console.log('Video ended');
      if (onNextEpisode && episodeNumber < totalEpisodes) {
        onNextEpisode();
      }
    });

    // Cleanup
    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, [videoUrl, posterUrl, title, episodeNumber]);

  // Format time (convert seconds to MM:SS format)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="player-container">
      <div className="video-wrapper">
        <video ref={videoRef} id="anime-player" className="custom-fluid">
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>
      
      {/* Episode navigation */}
      <div className="episode-nav">
        <button 
          onClick={onPrevEpisode} 
          disabled={!onPrevEpisode || episodeNumber <= 1}
          style={{ opacity: (!onPrevEpisode || episodeNumber <= 1) ? 0.5 : 1 }}
        >
          <i className="fas fa-arrow-left"></i> Prev
        </button>
        <div className="episode-info">
          <span>Episode {episodeNumber} / {totalEpisodes}</span>
        </div>
        <button 
          onClick={onNextEpisode} 
          disabled={!onNextEpisode || episodeNumber >= totalEpisodes}
          style={{ opacity: (!onNextEpisode || episodeNumber >= totalEpisodes) ? 0.5 : 1 }}
        >
          Next <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default TestFluidPlayer;

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