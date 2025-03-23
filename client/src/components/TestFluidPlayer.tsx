import React, { useRef, useState, useEffect } from 'react';
import fluidPlayer from 'fluid-player';
import '../fluid-player/fluid-player.min.css';
//import CustomQualityMenu from './CustomQualityMenu'; // Removed as it's not used in the modified approach

interface TestFluidPlayerProps {
  src: string;
  title?: string;
  episode?: {
    video_url_480p?: string;
    video_url_720p?: string;
    video_url_1080p?: string;
    video_url_max_quality?: string;
  };
}

type VideoQuality = 'auto' | '480p' | '720p' | '1080p';

const TestFluidPlayer: React.FC<TestFluidPlayerProps> = ({ src, title, episode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [player, setPlayer] = useState<any>(null);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('auto'); // Added state for quality selection
  const [showQualityMenu, setShowQualityMenu] = useState(false); // Added state for quality menu


  // Initialize FluidPlayer
  useEffect(() => {
    if (videoRef.current && !player) {
      const fluidPlayerInstance = fluidPlayer(videoRef.current.id, {
        layoutControls: {
          primaryColor: "#9b59b6",
          playButtonShowing: false,
          playPauseAnimation: true,
          fillToContainer: true,
          autoPlay: false,
          preload: 'auto',
          mute: false,
          doubleclickFullscreen: true,
          // Theater mode configuration
          allowTheatre: true,
          theatreSettings: {
            width: '100%',
            height: '100%',
            marginTop: 0,
            horizontalAlign: 'center'
          },
          // For advanced theater mode
          theatreAdvanced: {
            theatreElement: 'fluid-player-container',
            classToApply: 'theater-mode'
          },
          // Logo watermark configuration
          logo: {
            imageUrl: '/assets/logo/watermark.svg',
            position: 'top left',
            clickUrl: '',
            opacity: 0.8,
            imageMargin: '15px',
            hideWithControls: false,
            showOverAds: true
          },
          controlBar: {
            autoHide: true,
            autoHideTimeout: 3,
            animated: true,
          },
          controlForwardBackward: {
            show: true,
          },
          posterImage: '',
        },
      });

      setPlayer(fluidPlayerInstance);

      const videoElement = videoRef.current;

      // Event listeners
      videoElement.addEventListener('play', () => setIsPlaying(true));
      videoElement.addEventListener('pause', () => setIsPlaying(false));
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('volumechange', handleVolumeChange);
      videoElement.addEventListener('waiting', () => setIsBuffering(true));
      videoElement.addEventListener('canplay', () => setIsBuffering(false));

      return () => {
        videoElement.removeEventListener('play', () => setIsPlaying(true));
        videoElement.removeEventListener('pause', () => setIsPlaying(false));
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('volumechange', handleVolumeChange);
        videoElement.removeEventListener('waiting', () => setIsBuffering(true));
        videoElement.removeEventListener('canplay', () => setIsBuffering(false));

        if (fluidPlayerInstance) {
          fluidPlayerInstance.destroy();
        }
      };
    }
  }, [videoRef.current]);

  // Handle mouse movement to show/hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', () => {
        if (isPlaying) {
          setShowControls(false);
        }
      });
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', () => {});
      }

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Handle clicks outside volume control
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeControlRef.current && !volumeControlRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle Theater Mode
  useEffect(() => {
    const videoContainer = videoContainerRef.current;
    if (videoContainer) {
      if (isTheaterMode) {
        videoContainer.classList.add('theater-mode');
      } else {
        videoContainer.classList.remove('theater-mode');
      }
    }
  }, [isTheaterMode]);

  // Event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVolumeChange = () => {
    if (videoRef.current) {
      setVolume(videoRef.current.volume);
      setIsMuted(videoRef.current.muted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const handleVolumeChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        videoRef.current.muted = true;
      } else {
        videoRef.current.muted = false;
      }
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Determine available qualities based on episode data
  const availableQualities: { quality: VideoQuality; url: string | null }[] = [
    { quality: 'auto', url: episode?.video_url_max_quality || null },
    { quality: '1080p', url: episode?.video_url_1080p || null },
    { quality: '720p', url: episode?.video_url_720p || null },
    { quality: '480p', url: episode?.video_url_480p || null },
  ];

  const filteredQualities = availableQualities.filter(item => item.url !== null);

  // Handle quality change
  const handleQualityChange = (quality: VideoQuality) => {
    setSelectedQuality(quality);

    // Get the appropriate video URL based on selected quality
    if (videoRef.current) {
      let newSource = '';

      // Match quality selection to the database schema fields
      switch (quality) {
        case '1080p':
          newSource = episode?.video_url_1080p || episode?.video_url_max_quality || '';
          break;
        case '720p':
          newSource = episode?.video_url_720p || episode?.video_url_max_quality || '';
          break;
        case '480p':
          newSource = episode?.video_url_480p || episode?.video_url_max_quality || '';
          break;
        default:
          // Auto or fallback to max quality
          newSource = episode?.video_url_max_quality || '';
      }

      if (newSource) {
        videoRef.current.src = newSource;
        videoRef.current.load();
      }
    }
  };


  return (
    <div className="fluid-player-container" ref={playerContainerRef}>
      <div 
        className={`video-container ${isTheaterMode ? 'theater-mode' : ''}`}
        ref={videoContainerRef}
      >
        <div 
          className="custom-video-player"
          ref={containerRef}
        >
          {/* Buffering indicator */}
          {isBuffering && (
            <div className="buffering-indicator">
              <div className="spinner"></div>
            </div>
          )}

          <video
            id="fluid-player"
            ref={videoRef}
            className="video-js"
            controls={false}
            preload="auto"
          >
            <source src={src} type="video/mp4" />
          </video>

          {/* Custom Controls */}
          <div className={`custom-controls ${showControls ? 'show' : 'hide'}`}>
            {/* Progress Bar */}
            <div 
              className="progress-bar-container"
              ref={progressBarRef}
              onClick={handleProgressBarClick}
            >
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>

            {/* Controls Bottom Row */}
            <div className="controls-bottom">
              {/* Left controls group */}
              <div className="controls-left">
                {/* Play/Pause Button */}
                <button className="control-button" onClick={togglePlay}>
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                {/* Volume Control */}
                <div className="volume-control" ref={volumeControlRef}>
                  <button 
                    className="control-button" 
                    onClick={toggleMute}
                    onMouseEnter={() => setShowVolumeSlider(true)}
                  >
                    {isMuted || volume === 0 ? (
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                      </svg>
                    ) : volume < 0.5 ? (
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                        <path d="M5 9v6h4l5 5V4L9 9H5zm7-.17v6.34L9.83 13H7v-2h2.83L12 8.83z"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    )}
                  </button>

                  {showVolumeSlider && (
                    <div className="volume-slider-container">
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange2}
                        className="volume-slider"
                      />
                    </div>
                  )}
                </div>

                {/* Time Display */}
                <div className="time-display">
                  <span>{formatTime(currentTime)}</span>
                  <span> / </span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right controls group */}
              <div className="controls-right">
                {/* Quality selector */}
                <button className="control-button" onClick={() => setShowQualityMenu(!showQualityMenu)}>
                  {selectedQuality}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showQualityMenu && (
                  <div className="quality-menu">
                    {filteredQualities.map((quality) => (
                      <button key={quality.quality} onClick={() => handleQualityChange(quality.quality)}>{quality.quality}</button>
                    ))}
                  </div>
                )}

                {/* Theater Mode Button */}
                <button className="control-button" onClick={toggleTheaterMode}>
                  {isTheaterMode ? (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                      <path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                      <path d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"/>
                    </svg>
                  )}
                </button>

                {/* Fullscreen Button */}
                <button className="control-button" onClick={toggleFullscreen}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {title && <h2 className="video-title">{title}</h2>}
    </div>
  );
};

export default TestFluidPlayer;