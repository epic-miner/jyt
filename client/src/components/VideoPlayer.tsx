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

interface VideoPlayerProps {
  anime: Anime;
  episode: Episode;
  onNextEpisode: () => void;
  onPreviousEpisode: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

type VideoQuality = '1080p' | '720p' | '480p' | 'auto';

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
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [timePreview, setTimePreview] = useState<{ time: number; position: number } | null>(null);

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

    const handleVideoError = () => {
      setIsLoading(false);
      setError('Failed to load video. The video might be unavailable or the format is not supported.');
    };

    const videoElement = videoRef.current;
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadeddata', handleVideoLoad);
    videoElement.addEventListener('error', handleVideoError);

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('loadeddata', handleVideoLoad);
        videoElement.removeEventListener('error', handleVideoError);
      }
    };
  }, [anime, episode]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (videoRef.current && videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleQualityChange = (quality: VideoQuality) => {
    setSelectedQuality(quality);
    setShowQualityMenu(false);

    // Workaround for React bug with video source changes
    if (videoRef.current) {
      videoRef.current.load();
    }
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
              onClick={togglePlay}
              controlsList="nodownload"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* YouTube-style Title overlay that fades out */}
            <div className={cn(
              "absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent text-white z-10 transition-opacity duration-500",
              !showControls && "opacity-0"
            )}>
              <h2 className="text-base font-semibold">{episode.title || `Episode ${episode.episode_number}`}</h2>
              <p className="text-sm text-gray-300">{anime.title}</p>
            </div>

            {/* Quality selector */}
            <div className={cn(
              "absolute top-4 left-4 z-10",
              !showControls && "opacity-0 transition-opacity duration-300"
            )}>
              <div className="relative inline-block">
                <button 
                  className="bg-dark-900/90 text-white px-2.5 py-1.5 rounded text-sm flex items-center gap-1 hover:bg-dark-800/90 transition"
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                >
                  <Settings size={16} className="text-white" />
                </button>

                {showQualityMenu && (
                  <div className="absolute top-full mt-1 left-0 bg-dark-900/95 rounded shadow-lg overflow-hidden z-20 w-60 border border-dark-700">
                    <div className="px-4 py-2 border-b border-dark-700 text-xs text-slate-400 font-medium uppercase">
                      Quality
                    </div>
                    {availableQualities.map(({ quality, url }) => (
                      <button
                        key={quality}
                        className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-dark-800/70 transition flex items-center justify-between ${selectedQuality === quality ? 'text-primary' : 'text-white'}`}
                        onClick={() => handleQualityChange(quality)}
                        disabled={!url}
                      >
                        <div className="flex items-center">
                          <span>{quality === 'auto' ? 'Auto (recommended)' : quality}</span>
                          {quality === 'auto' && selectedQuality !== 'auto' && (
                            <span className="ml-2 text-xs text-slate-400">Current: {selectedQuality}</span>
                          )}
                        </div>
                        {selectedQuality === quality && (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* YouTube-style custom controls overlay */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-4 px-4 z-10 transition-opacity duration-300",
              !showControls && "opacity-0 pointer-events-none"
            )}>
              {/* Progress bar - YouTube style with preview and buffer indicator */}
              <div 
                ref={progressBarRef}
                className="w-full h-10 group flex items-center cursor-pointer -mt-6 px-1"
                onClick={seekToPosition}
                onMouseMove={(e) => {
                  // This would handle showing time preview on hover in a real implementation
                  // For now it's just for visual effect
                }}
              >
                <div className="w-full relative">
                  {/* Background track */}
                  <div className="w-full bg-gray-600/50 h-1 group-hover:h-3 transition-all rounded-full overflow-hidden">
                    {/* Buffered progress - simulated */}
                    <div 
                      className="absolute bg-gray-400/30 h-full rounded-full" 
                      style={{ width: `${Math.min(100, currentTime + 15)}%` }}
                    ></div>
                    
                    {/* Actual progress */}
                    <div 
                      className="bg-red-500 h-full rounded-full relative" 
                      style={{ width: `${currentTime}%` }}
                    >
                      {/* Draggable thumb - only visible on hover */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 bg-red-500 rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Control buttons - YouTube style layout */}
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center space-x-2">
                  {/* Play/Pause button */}
                  <button 
                    className="text-white p-2 hover:text-white/80 transition rounded-full" 
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                  </button>
                  
                  {/* Previous/Next episode buttons */}
                  <button 
                    className="text-white p-2 hover:text-white/80 transition rounded-full disabled:opacity-50 disabled:hover:text-white"
                    onClick={onPreviousEpisode}
                    disabled={!hasPrevious}
                    aria-label="Previous episode"
                  >
                    <SkipBack size={22} />
                  </button>
                  
                  <button 
                    className="text-white p-2 hover:text-white/80 transition rounded-full disabled:opacity-50 disabled:hover:text-white"
                    onClick={onNextEpisode}
                    disabled={!hasNext}
                    aria-label="Next episode"
                  >
                    <SkipForward size={22} />
                  </button>
                  
                  {/* Volume control */}
                  <div className="relative flex items-center group">
                    <button 
                      className="text-white p-2 hover:text-white/80 transition rounded-full" 
                      onClick={toggleMute}
                      onMouseEnter={() => setShowVolumeSlider(true)}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX size={22} />
                      ) : volume < 0.5 ? (
                        <Volume1 size={22} />
                      ) : (
                        <Volume2 size={22} />
                      )}
                    </button>
                    
                    <div 
                      className={cn(
                        "hidden group-hover:block absolute bottom-full left-0 pb-2",
                        showVolumeSlider && "block"
                      )}
                      onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                      <div className="bg-dark-900/95 p-3 rounded shadow-lg border border-dark-700">
                        <div className="h-20 flex flex-col items-center justify-center relative">
                          {/* Vertical slider track */}
                          <div className="h-full w-1.5 bg-gray-700 rounded-full relative flex items-center justify-center">
                            {/* Filled portion of slider */}
                            <div 
                              className="w-full bg-red-500 rounded-full absolute bottom-0"
                              style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
                            ></div>
                            
                            {/* Slider thumb */}
                            <div 
                              className="absolute w-3 h-3 bg-red-500 rounded-full left-1/2 -translate-x-1/2 cursor-pointer"
                              style={{ bottom: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)` }}
                            ></div>
                          </div>
                          
                          {/* Hidden actual input for functionality */}
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
                  {/* Settings button (already implemented at top left) */}
                  
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
      <div className="bg-dark-900 py-3 px-4 flex justify-between items-center border-t border-dark-700">
        <button 
          className="bg-dark-800 hover:bg-dark-700 transition px-4 py-2 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={onPreviousEpisode}
          disabled={!hasPrevious}
        >
          <SkipBack size={16} className="mr-1" /> Previous
        </button>

        <div className="text-sm text-slate-300">
          Episode <span className="font-bold">{episode.episode_number}</span>
        </div>

        <button 
          className="bg-dark-800 hover:bg-dark-700 transition px-4 py-2 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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