import { useState, useEffect, useRef } from 'react';
import { Episode, Anime } from '@shared/types';
import { updateWatchHistory } from '../lib/cookies';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings
} from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import VideoPlayerDesktopMenu from './VideoPlayerDesktopMenu';
import VideoPlayerMobileMenu from './VideoPlayerMobileMenu';

interface VideoPlayerProps {
  anime: Anime;
  episode: Episode;
  onNextEpisode: () => void;
  onPreviousEpisode: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

type VideoQuality = '1080p' | '720p' | '480p' | '360p' | '240p' | '144p' | 'auto';

const VideoPlayer = ({ 
  anime, 
  episode, 
  onNextEpisode, 
  onPreviousEpisode, 
  hasNext, 
  hasPrevious 
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('auto');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showQualitySubmenu, setShowQualitySubmenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [timePreview, setTimePreview] = useState<{ time: number; position: number } | null>(null);
  const [showTitle, setShowTitle] = useState(true);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);


  // Get available quality options
  const availableQualities: { quality: VideoQuality; url: string | undefined }[] = [
    { quality: 'auto' as VideoQuality, url: episode.video_url_max_quality },
    { quality: '1080p' as VideoQuality, url: episode.video_url_1080p },
    { quality: '720p' as VideoQuality, url: episode.video_url_720p },
    { quality: '480p' as VideoQuality, url: episode.video_url_480p }
  ].filter(q => q.url);

  // Update watch history every 5 seconds while playing
  useEffect(() => {
    if (!videoRef.current) return;

    // Check if we have saved progress for this episode
    const savedHistoryItems = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const savedItem = savedHistoryItems.find(
      (item: any) => item.animeId === anime.id.toString() && item.episodeId === episode.id.toString()
    );

    if (savedItem && savedItem.progress > 0) {
      // Set video time to saved progress
      const durationSeconds = videoRef.current.duration;
      if (!isNaN(durationSeconds)) {
        const timeToSet = savedItem.progress * durationSeconds / 100;
        videoRef.current.currentTime = timeToSet;
      }
    }

    const handleTimeUpdate = () => {
      if (!videoRef.current) return;

      const currentVideoTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;

      if (!isNaN(duration) && duration > 0) {
        const progressPercent = (currentVideoTime / duration) * 100;
        setCurrentTime(progressPercent);

        // Save progress every 5 seconds
        if (Math.floor(currentVideoTime) % 5 === 0) {
          updateWatchHistory({
            animeId: anime.id.toString(),
            episodeId: episode.id.toString(),
            title: episode.title,
            episodeNumber: episode.episode_number,
            animeThumbnail: anime.thumbnail_url,
            animeTitle: anime.title,
            progress: progressPercent,
            timestamp: new Date().getTime()
          });
        }
      }
    };

    const handleVideoLoad = () => {
      setIsLoading(false);
    };

    const handleVideoError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      console.error('Video error:', target.error);
      setError('Failed to load video. The video might be unavailable or the format is not supported.');
      setIsLoading(false);

      // Reset video source if error is fatal
      if (target.error?.code === 2 || target.error?.code === 1) {
        target.src = '';
        target.load();
      }
    };

    // Track buffer progress
    const handleProgress = () => {
      if (!videoRef.current) return;
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        const duration = videoRef.current.duration;
        if (duration > 0) {
          setBufferProgress((bufferedEnd / duration) * 100);
        }
      }
    };

    const videoElement = videoRef.current;
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadeddata', handleVideoLoad);
    videoElement.addEventListener('error', handleVideoError);
    videoElement.addEventListener('progress', handleProgress);

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('loadeddata', handleVideoLoad);
        videoElement.removeEventListener('error', handleVideoError);
        videoElement.removeEventListener('progress', handleProgress);
      }
    };
  }, [anime, episode]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      setIsFullScreen(isFullscreen);

      // Toggle header and footer visibility
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const bottomNav = document.querySelector('nav');

      if (header) header.style.visibility = isFullscreen ? 'hidden' : 'visible';
      if (footer) footer.style.visibility = isFullscreen ? 'hidden' : 'visible';
      if (bottomNav) bottomNav.style.visibility = isFullscreen ? 'hidden' : 'visible';
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      // Reset visibility on cleanup
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const bottomNav = document.querySelector('nav');
      if (header) header.style.visibility = 'visible';
      if (footer) footer.style.visibility = 'visible';
      if (bottomNav) bottomNav.style.visibility = 'visible';
    };
  }, []);

  // Handle mobile rotation and fullscreen
  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.screen.orientation && playerContainerRef.current) {
        const isLandscape = window.screen.orientation.type.includes('landscape');
        if (isLandscape && !document.fullscreenElement) {
          playerContainerRef.current.requestFullscreen?.();
          window.screen.orientation.lock?.('landscape').catch(() => {});
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && window.screen.orientation) {
        window.screen.orientation.unlock?.();
      }
    };

    window.screen.orientation?.addEventListener('change', handleOrientationChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.screen.orientation?.removeEventListener('change', handleOrientationChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // YouTube-style keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts when user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (e.ctrlKey || e.altKey || e.metaKey)
      ) {
        return;
      }

      switch (e.key) {
        case ' ': // Spacebar - Play/Pause
        case 'k': // YouTube's play/pause shortcut
          e.preventDefault();
          togglePlay();
          break;

        case 'f': // Full screen
          e.preventDefault();
          toggleFullScreen();
          break;

        case 'm': // Mute/unmute
          e.preventDefault();
          toggleMute();
          break;

        case 'ArrowLeft': // Rewind 5 seconds
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
          }
          break;

        case 'ArrowRight': // Fast forward 5 seconds
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
              videoRef.current.duration || 0, 
              videoRef.current.currentTime + 5
            );
          }
          break;

        case 'ArrowUp': // Volume up
          e.preventDefault();
          if (videoRef.current) {
            const newVolume = Math.min(1, volume + 0.05);
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(false);
          }
          break;

        case 'ArrowDown': // Volume down
          e.preventDefault();
          if (videoRef.current) {
            const newVolume = Math.max(0, volume - 0.05);
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            if (newVolume === 0) setIsMuted(true);
          }
          break;

        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9': // Seek to percentage of video
          e.preventDefault();
          if (videoRef.current) {
            const percent = parseInt(e.key) * 10;
            videoRef.current.currentTime = videoRef.current.duration * (percent / 100);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [volume, isMuted, isFullScreen, isPlaying]);

  // Handle quality change
  useEffect(() => {
    if (!videoRef.current) return;

    // Save current playback time
    const currentPlaybackTime = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;

    // Update source and restore playback position
    videoRef.current.onloadeddata = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentPlaybackTime;
        if (wasPlaying) {
          videoRef.current.play().catch(e => console.error('Error playing video after quality change:', e));
        }
      }
    };
  }, [selectedQuality]);

  // Hide title after a few seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowTitle(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const toggleFullScreen = () => {
    const element = playerContainerRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const handleQualityChange = (quality: VideoQuality) => {
    setSelectedQuality(quality);
    setShowQualitySubmenu(false);
    setShowSettingsMenu(false);

    // Workaround for React bug with video source changes
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  // Open quality submenu
  const openQualitySubmenu = () => {
    setShowQualitySubmenu(true);
  };

  // Go back to main settings menu
  const backToMainMenu = () => {
    setShowQualitySubmenu(false);
  };

  // Determine video URL to use based on selected quality
  const getVideoUrl = (): string => {
    if (selectedQuality === 'auto') {
      return episode.video_url_max_quality || 
             episode.video_url_1080p || 
             episode.video_url_720p || 
             episode.video_url_480p || '';
    }

    if (selectedQuality === '1080p' && episode.video_url_1080p) {
      return episode.video_url_1080p;
    }

    if (selectedQuality === '720p' && episode.video_url_720p) {
      return episode.video_url_720p;
    }

    if (selectedQuality === '480p' && episode.video_url_480p) {
      return episode.video_url_480p;
    }

    // Fallback to max quality if selected quality isn't available
    return episode.video_url_max_quality || '';
  };

  // Additional player functions
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    const newMutedState = !isMuted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);

    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handlePlaybackSpeedChange = (newSpeed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = newSpeed;
    setPlaybackSpeed(newSpeed);
  };


  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const seekToPosition = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current) return;

    const progressBar = progressBarRef.current;
    const bounds = progressBar.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const width = bounds.width;
    const percentage = x / width;

    const videoDuration = videoRef.current.duration;
    if (!isNaN(videoDuration)) {
      videoRef.current.currentTime = percentage * videoDuration;
    }
  };

  // Effect to update duration and playing state
  useEffect(() => {
    if (!videoRef.current) return;

    const handleDurationChange = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      if (videoRef.current) {
        setVolume(videoRef.current.volume);
        setIsMuted(videoRef.current.muted);
      }
    };

    const videoElement = videoRef.current;
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('volumechange', handleVolumeChange);
    videoElement.addEventListener('ratechange', () => {
        setPlaybackSpeed(videoRef.current?.playbackRate || 1);
    });

    // Auto-hide controls after inactivity
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const handleMouseMove = () => {
      setShowControls(true);

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    const playerContainer = playerContainerRef.current;
    if (playerContainer) {
      playerContainer.addEventListener('mousemove', handleMouseMove);
      playerContainer.addEventListener('mouseenter', () => setShowControls(true));
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('durationchange', handleDurationChange);
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
        videoElement.removeEventListener('volumechange', handleVolumeChange);
        videoElement.removeEventListener('ratechange', () => {
            setPlaybackSpeed(videoRef.current?.playbackRate || 1);
        });
      }

      if (playerContainer) {
        playerContainer.removeEventListener('mousemove', handleMouseMove);
        playerContainer.removeEventListener('mouseenter', () => setShowControls(true));
      }

      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isPlaying]);

  const videoUrl = getVideoUrl();

  return (
    <div className="w-full flex flex-col bg-black">
      {/* Main video container with 16:9 aspect ratio */}
      <div 
        ref={playerContainerRef}
        className="relative w-full bg-black overflow-hidden"
      >
        <AspectRatio ratio={16 / 9} className="w-full">
          <div className="w-full h-full relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-white">Loading video...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                <div className="text-center max-w-md p-6 bg-dark-800 rounded-lg">
                  <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
                  <h3 className="text-xl font-bold mb-2">Video Error</h3>
                  <p className="text-slate-300 mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-primary hover:bg-primary/90 transition px-4 py-2 rounded-lg"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Video element */}
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              preload="auto"
              onClick={(e) => {
                if (isMobile) {
                  e.preventDefault();
                  const element = playerContainerRef.current;
                  if (!element) return;
                  
                  if (!document.fullscreenElement) {
                    if (element.requestFullscreen) {
                      element.requestFullscreen();
                    } else if (element.webkitRequestFullscreen) {
                      element.webkitRequestFullscreen();
                    } else if (element.msRequestFullscreen) {
                      element.msRequestFullscreen();
                    }
                    window.screen.orientation?.lock('landscape').catch(() => {});
                  }
                } else {
                  togglePlay();
                }
              }}
              controlsList="nodownload"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* YouTube-style Title overlay at top */}
            <div className={cn(
              "absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent text-white z-10 transition-opacity duration-500",
              !showControls && "opacity-0"
            )}>
              <h2 className="text-base font-semibold">{episode.title || `Episode ${episode.episode_number}`}</h2>
              <p className="text-sm text-gray-300">{anime.title}</p>
            </div>

            {/* Settings gear for quality selection (YouTube style) */}
            <div className={cn(
              "absolute top-4 right-4 z-30",
              !showControls && "opacity-0 transition-opacity duration-300"
            )}>
              <div className="relative inline-block">
                <button 
                  className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full"
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  aria-label="Settings"
                >
                  <Settings size={20} />
                </button>

                {/* Use Device Type to decide which menu to render */}
                {useIsMobile() ? (
                  <VideoPlayerMobileMenu 
                    showSettingsMenu={showSettingsMenu}
                    setShowSettingsMenu={setShowSettingsMenu}
                    showQualitySubmenu={showQualitySubmenu}
                    setShowQualitySubmenu={setShowQualitySubmenu}
                    selectedQuality={selectedQuality}
                    handleQualityChange={handleQualityChange}
                    backToMainMenu={backToMainMenu}
                    openQualitySubmenu={openQualitySubmenu}
                    availableQualities={availableQualities}
                    playbackSpeed={playbackSpeed}
                    handlePlaybackSpeedChange={handlePlaybackSpeedChange}
                  />
                ) : (
                  <VideoPlayerDesktopMenu 
                    showQualityMenu={showSettingsMenu}
                    setShowQualityMenu={setShowSettingsMenu}
                    selectedQuality={selectedQuality}
                    handleQualityChange={handleQualityChange}
                    availableQualities={availableQualities}
                    playbackSpeed={playbackSpeed}
                    handlePlaybackSpeedChange={handlePlaybackSpeedChange}
                  />
                )}
              </div>
            </div>

            {/* YouTube-style custom controls overlay */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-16 pb-2 z-10 transition-opacity duration-300",
              !showControls && "opacity-0 pointer-events-none"
            )}>
              {/* Progress bar - YouTube style (thin line with hover effect) */}
              <div 
                className="relative w-full h-10 px-4 cursor-pointer flex items-center group" 
                onMouseMove={(e) => {
                  if (!progressBarRef.current || !videoRef.current) return;

                  const progressBar = progressBarRef.current;
                  const bounds = progressBar.getBoundingClientRect();
                  const x = e.clientX - bounds.left;
                  const width = bounds.width;
                  const percentage = x / width;

                  const videoDuration = videoRef.current.duration;
                  if (!isNaN(videoDuration)) {
                    const previewTime = percentage * videoDuration;
                    setTimePreview({ time: previewTime, position: percentage * 100 });
                  }
                }}
                onMouseLeave={() => setTimePreview(null)}
              >
                {/* Time preview tooltip (YouTube style) */}
                {timePreview && (
                  <div 
                    className="absolute bottom-6 bg-black/90 px-2 py-1 rounded text-xs text-white font-medium z-10 whitespace-nowrap pointer-events-none transform -translate-x-1/2"
                    style={{ left: `${timePreview.position}%` }}
                  >
                    {formatTime(timePreview.time)}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                  </div>
                )}

                {/* Progress bar track */}
                <div 
                  ref={progressBarRef}
                  className="w-full h-1 bg-gray-600/50 rounded-full relative group-hover:h-3 transition-all duration-150"
                  onClick={seekToPosition}
                >
                  {/* Buffered progress */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-gray-500/70 rounded-full"
                    style={{ width: `${bufferProgress}%` }}
                  ></div>

                  {/* Played progress - red for YouTube */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
                    style={{ width: `${(videoRef.current?.currentTime || 0) / (videoRef.current?.duration || 1) * 100}%` }}
                  >
                    {/* Thumb dot - larger on hover */}
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-0 h-0 bg-red-600 rounded-full group-hover:w-4 group-hover:h-4 transition-all duration-150"></div>
                  </div>
                </div>
              </div>

              {/* Control buttons row */}
              <div className="flex justify-between items-center px-4 text-white">
                {/* Left controls */}
                <div className="flex items-center space-x-2">
                  {/* Play/Pause button */}
                  <button 
                    className="text-white p-2 hover:text-white/80 transition rounded-full" 
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                  </button>

                  {/* Previous/Next episode buttons */}
                  <button 
                    className="text-white p-2 hover:text-white/80 transition rounded-full disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={onPreviousEpisode}
                    disabled={!hasPrevious}
                    aria-label="Previous episode"
                  >
                    <SkipBack size={22} />
                  </button>

                  <button 
                    className="text-white p-2 hover:text-white/80 transition rounded-full disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={onNextEpisode}
                    disabled={!hasNext}
                    aria-label="Next episode"
                  >
                    <SkipForward size={22} />
                  </button>

                  {/* Volume control - YouTube style */}
                  <div className="relative flex items-center group">
                    <button 
                      className="text-white p-2 hover:text-white/80 transition rounded-full flex items-center" 
                      onClick={toggleMute}
                      onMouseEnter={() => setShowVolumeSlider(true)}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      <div className="flex items-center justify-center w-6 h-6">
                        {isMuted || volume === 0 ? (
                          <VolumeX size={22} />
                        ) : volume < 0.5 ? (
                          <Volume1 size={22} />
                        ) : (
                          <Volume2 size={22} />
                        )}
                      </div>
                    </button>

                    <div 
                      className={cn(
                        "hidden group-hover:block absolute bottom-full left-0 pb-3",
                        showVolumeSlider && "block"
                      )}
                      onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                      {/* YouTube-style vertical volume slider */}
                      <div className="w-8 h-24 bg-black/95 py-3 rounded shadow-lg border border-gray-800 flex flex-col items-center relative">
                        {/* Volume percentage display */}
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-xs text-white font-medium z-10 border border-gray-800 whitespace-nowrap pointer-events-none">
                          {Math.round((isMuted ? 0 : volume) * 100)}%
                        </div>

                        {/* Vertical slider container */}
                        <div className="h-full w-full flex flex-col items-center justify-center relative" 
                          onClick={(e) => {
                            if (!videoRef.current) return;
                            const container = e.currentTarget;
                            const rect = container.getBoundingClientRect();
                            const height = rect.height;
                            const y = e.clientY - rect.top;
                            // Calculate volume (0-1) based on click position, invert because 0 is bottom
                            const newVolume = Math.min(Math.max(1 - (y / height), 0), 1);
                            videoRef.current.volume = newVolume;
                            setVolume(newVolume);
                            if (newVolume === 0) setIsMuted(true);
                            else if (isMuted) setIsMuted(false);
                          }}
                        >
                          {/* Vertical slider track */}
                          <div className="h-full w-1.5 bg-gray-700 rounded-full relative">
                            {/* Filled portion */}
                            <div 
                              className="w-full bg-white rounded-full absolute bottom-0"
                              style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
                            ></div>

                            {/* Slider thumb */}
                            <div 
                              className="absolute w-3 h-3 bg-white rounded-full left-1/2 -translate-x-1/2 cursor-pointer"
                              style={{ bottom: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)` }}
                            ></div>
                          </div>

                          {/* Hidden input for accessibility */}
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="sr-only"
                            aria-label="Volume"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time display */}
                  <div className="text-white text-xs font-medium ml-1">
                    <span className="tabular-nums">{formatTime(videoRef.current?.currentTime || 0)}</span>
                    <span className="mx-1 text-white/70">/</span>
                    <span className="tabular-nums text-white/70">{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {/* YouTube styled buttons */}
                  <button
                    className="text-white p-2 hover:text-white/80 transition rounded-full"
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    aria-label="Settings"
                  >
                    <Settings size={20} />
                  </button>

                  {/* Fullscreen button */}
                  <button 
                    className="text-white p-2 hover:text-white/80 transition rounded-full" 
                    onClick={toggleFullScreen}
                    aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullScreen ? <Minimize size={22} /> : <Maximize size={22} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </AspectRatio>
      </div>

      {/* Episode navigation bar */}
      <div className="bg-black py-3 px-4 flex justify-between items-center border-t border-gray-800/30">
        <button 
          className="bg-gray-800/70 hover:bg-gray-700/70 transition px-4 py-2 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={onPreviousEpisode}
          disabled={!hasPrevious}
        >
          <SkipBack size={16} className="mr-1" /> Previous
        </button>

        <div className="text-sm text-gray-300">
          Episode <span className="font-bold">{episode.episode_number}</span>
        </div>

        <button 
          className="bg-gray-800/70 hover:bg-gray-700/70 transition px-4 py-2 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={onNextEpisode}
          disabled={!hasNext}
        >
          Next <SkipForward size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;