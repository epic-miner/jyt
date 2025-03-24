import { useState, useEffect, useRef, memo, useCallback } from 'react';
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

// Add event listener to prevent keyboard shortcuts in the video player
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Prevent Ctrl+Shift+I (Developer tools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
      e.preventDefault();
      return false;
    }
    // Prevent F12 (Developer tools)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
  };

  window.addEventListener('keydown', handleKeyDown, true);
  return () => {
    window.removeEventListener('keydown', handleKeyDown, true);
  };
}, []);

import VideoPlayerMobileMenu from './VideoPlayerMobileMenu';
import { initializeSecurity } from '../lib/security';
import { cleanAnimeTitle } from '../utils/titleFormatter';

// Type definitions for Web APIs that TypeScript doesn't fully recognize
interface WakeLockSentinel extends EventTarget {
  released: boolean;
  type: 'screen';
  release(): Promise<void>;
}

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
  const seekDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const bufferingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Basic video player states
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
  const [isHovering, setIsHovering] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // YouTube-like features
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    try {
      // Default to true, but check localStorage for saved preference
      const savedAutoplay = localStorage.getItem('videoAutoplay');
      return savedAutoplay === null ? true : savedAutoplay === 'true';
    } catch (err) {
      // If localStorage access fails, default to true
      return true;
    }
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<{src: string; position: number} | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [miniPlayerMode, setMiniPlayerMode] = useState(false);
  const [showPlaybackSpeedMenu, setShowPlaybackSpeedMenu] = useState(false);

  // Chapter markers
  const [chapters, setChapters] = useState<{time: number; title: string}[]>([
    {time: 0, title: "Introduction"},
    {time: 120, title: "Chapter 1"},
    {time: 300, title: "Chapter 2"},
    {time: 550, title: "Ending"}
  ]);
  const [activeChapter, setActiveChapter] = useState(0);
  const isMobile = useIsMobile();
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);


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
      if (!videoRef.current || !anime?.id || !episode?.id) return;

      const currentVideoTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;

      if (!isNaN(duration) && duration > 0) {
        const progressPercent = (currentVideoTime / duration) * 100;
        setCurrentTime(progressPercent);

        // Save progress every 5 seconds
        if (Math.floor(currentVideoTime) % 5 === 0) {
          updateWatchHistory({
            animeId: String(anime.id),
            episodeId: String(episode.id),
            title: episode.title || '',
            episodeNumber: episode.episode_number,
            animeThumbnail: anime.thumbnail_url || '',
            animeTitle: cleanAnimeTitle(anime.title),
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
          const bufferPercentage = (bufferedEnd / duration) * 100;
          setBufferProgress(bufferPercentage);
          
          // Update current time again to ensure progress bar is in sync
          setCurrentTime(videoRef.current.currentTime);
        }
      }
    };

    const handleWaiting = () => {
      setIsBuffering(true);
      if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
      bufferingTimeoutRef.current = setTimeout(() => setIsBuffering(false), 1000); // Hide buffering after 1 second
    };

    const handlePlaying = () => {
      setIsBuffering(false);
    };

    const videoElement = videoRef.current;
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadeddata', handleVideoLoad);
    videoElement.addEventListener('error', handleVideoError);
    videoElement.addEventListener('progress', handleProgress);
    videoElement.addEventListener('waiting', handleWaiting); // Add waiting event listener
    videoElement.addEventListener('playing', handlePlaying); // Add playing event listener

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('loadeddata', handleVideoLoad);
        videoElement.removeEventListener('error', handleVideoError);
        videoElement.removeEventListener('progress', handleProgress);
        videoElement.removeEventListener('waiting', handleWaiting); // Remove waiting event listener
        videoElement.removeEventListener('playing', handlePlaying); // Remove playing event listener
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

  // Add isLandscape helper function at the top of the component
  const isLandscapeMode = () => {
    const orientation = window.screen?.orientation;
    return orientation?.type?.includes('landscape') ||
           (window.orientation !== undefined && Math.abs(window.orientation as number) === 90);
  };

  // Handle screen orientation lock for fullscreen on mobile
  const requestOrientationLock = async () => {
    try {
      // Check if the Screen Orientation API is available with type guards
      if (isMobile && 
          'orientation' in window.screen && 
          window.screen.orientation) {
        const screenOrientation = window.screen.orientation as any;
        // Try to lock to landscape orientation using the Screen Orientation API
        if (typeof screenOrientation.lock === 'function') {
          // Try both primary landscape orientations in case one fails
          try {
            await screenOrientation.lock('landscape-primary');
          } catch (e) {
            try {
              await screenOrientation.lock('landscape');
            } catch (e2) {
              console.warn('Both landscape lock attempts failed');
            }
          }
          return true;
        }
      }
    } catch (err) {
      console.warn('Orientation lock failed:', err);
      // Continue anyway even if orientation lock fails
    }
    return false;
  };

  // Improved toggleFullScreen function that works on mobile regardless of orientation
  const toggleFullScreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        // Request fullscreen
        if (playerContainerRef.current) {
          // On mobile devices, force landscape orientation when entering fullscreen
          if (isMobile) {
            // First, add the landscape-fullscreen class to prepare for orientation change
            playerContainerRef.current.classList.add('landscape-fullscreen');

            // Try to lock orientation to landscape
            await requestOrientationLock();
          }

          // Enter fullscreen
          await playerContainerRef.current.requestFullscreen();
          setIsFullScreen(true);

          // After entering fullscreen on mobile, force a reflow to apply proper sizing
          if (isMobile && playerContainerRef.current) {
            setTimeout(() => {
              if (playerContainerRef.current) {
                // Force a reflow
                playerContainerRef.current.style.display = 'none';
                void playerContainerRef.current.offsetHeight; // trigger reflow
                playerContainerRef.current.style.display = '';
              }
            }, 300);
          }
        }
      } else {
        // Exit fullscreen
        await document.exitFullscreen();
        setIsFullScreen(false);

        // Remove landscape-fullscreen class after exiting fullscreen
        if (playerContainerRef.current) {
          playerContainerRef.current.classList.remove('landscape-fullscreen');
        }

        // On mobile, try to unlock orientation if we're exiting fullscreen
        if (isMobile && 
            'orientation' in window.screen && 
            window.screen.orientation && 
            typeof window.screen.orientation.unlock === 'function') {
          try {
            window.screen.orientation.unlock();
          } catch (err) {
            console.warn('Failed to unlock orientation:', err);
          }
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
      setError('Unable to enter fullscreen mode. Try rotating your device manually.');
      setTimeout(() => setError(null), 3000);
    }
  }, [isMobile]);

  // Update orientation change handler
  useEffect(() => {
    const handleOrientationChange = async () => {
      try {
        if (!playerContainerRef.current) return;

        const isLandscape = isLandscapeMode();

        // Only allow fullscreen in landscape mode on mobile
        if (isMobile) {
          if (isLandscape) {
            // Auto-enter fullscreen when rotating to landscape
            if (!document.fullscreenElement) {
              await playerContainerRef.current.requestFullscreen();
            }
          } else {
            // Auto-exit fullscreen when rotating to portrait
            if (document.fullscreenElement) {
              await document.exitFullscreen();
            }
          }
        }
      } catch (error) {
        console.error('Orientation/Fullscreen error:', error);
      }
    };

    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      setIsFullScreen(isFullscreen);

      // Handle class changes on fullscreen change
      if (playerContainerRef.current) {
        if (isFullscreen) {
          playerContainerRef.current.classList.add('landscape-fullscreen');
          // Force screen to landscape on mobile when entering fullscreen
          if (isMobile && !isLandscapeMode()) {
            requestOrientationLock().catch(err => {
              console.warn('Failed to lock orientation on fullscreen change:', err);
            });
          }
        } else {
          playerContainerRef.current.classList.remove('landscape-fullscreen');
          // Unlock orientation when exiting fullscreen
          if (isMobile && 
              'orientation' in window.screen && 
              window.screen.orientation &&
              typeof window.screen.orientation.unlock === 'function') {
            try {
              window.screen.orientation.unlock();
            } catch (err) {
              console.warn('Failed to unlock orientation:', err);
            }
          }
        }
      }

      // Show controls when entering fullscreen on mobile
      if (isFullscreen && isMobile) {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
          if (!isHovering) {
            setShowControls(false);
          }
        }, 3000);
      }
    };

    // Add orientation change listener with compatibility check
    if (window.screen?.orientation?.addEventListener) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    } else {
      // Fallback for older devices
      window.addEventListener('orientationchange', handleOrientationChange);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      // Cleanup listeners
      if (window.screen?.orientation?.removeEventListener) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      } else {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);

      // Exit fullscreen if in portrait mode
      if (document.fullscreenElement && isMobile && !isLandscapeMode()) {
        document.exitFullscreen().catch(() => {
          // Ignore errors during cleanup
        });
      }
    };
  }, [isMobile, isHovering]);

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
          skipBackward();
          break;

        case 'ArrowRight': // Fast forward 5 seconds
          e.preventDefault();
          skipForward();
          break;

        case 'ArrowUp': // Volume up
          e.preventDefault();
          adjustVolume(0.05);
          break;

        case 'ArrowDown': // Volume down
          e.preventDefault();
          adjustVolume(-0.05);
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
          seekToPercentage(parseInt(e.key) * 10);
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
          videoRef.current.play().catch(e => {
            // Ignore abort errors from pause interruptions
            if (e.name !== 'AbortError') {
              console.error('Error playing video after quality change:', e);
            }
          });
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

  // Initialize security measures
  useEffect(() => {
    if (playerContainerRef.current) {
      initializeSecurity(playerContainerRef.current);
    }
  }, []);

  // State for autoplay countdown
  const [showAutoplayCountdown, setShowAutoplayCountdown] = useState(false);
  const [autoplayCountdown, setAutoplayCountdown] = useState(5);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reference to store wake lock
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Handle video end for autoplay feature
  useEffect(() => {
    if (!videoRef.current) return;

    const handleVideoEnd = () => {
      // If autoplay is enabled and there's a next episode available, go to it
      if (autoplayEnabled && hasNext) {
        // Show autoplay countdown UI
        setShowControls(true);
        setShowAutoplayCountdown(true);
        setAutoplayCountdown(5);

        // Create countdown timer
        let countdown = 5;
        const countdownInterval = setInterval(() => {
          countdown -= 1;
          setAutoplayCountdown(countdown);

          if (countdown <= 0) {
            clearInterval(countdownInterval);
          }
        }, 1000);

        // Set a timeout to navigate to the next episode
        autoplayTimerRef.current = setTimeout(() => {
          onNextEpisode();
          clearInterval(countdownInterval);
          setShowAutoplayCountdown(false);
        }, 5000); // 5 second delay before autoplay, like YouTube

        return () => {
          clearTimeout(autoplayTimerRef.current!);
          clearInterval(countdownInterval);
        };
      }
    };

    const videoElement = videoRef.current;
    videoElement.addEventListener('ended', handleVideoEnd);

    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
      videoElement.removeEventListener('ended', handleVideoEnd);
    };
  }, [autoplayEnabled, hasNext, onNextEpisode]);


  const handleQualityChange = (quality: VideoQuality) => {
    // Store current playback state before changing quality
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;
      const currentVolume = videoRef.current.volume;
      
      // Set loading state first
      setIsLoading(true);
      
      // Update quality selection and close menus
      setSelectedQuality(quality);
      setShowQualitySubmenu(false);
      setShowSettingsMenu(false);
      
      // Apply the quality change immediately by getting the new URL
      // We'll use the new quality immediately rather than using state
      let newSource = '';
      
      // Directly determine the URL for the selected quality
      if (quality === 'auto') {
        newSource = episode.video_url_max_quality ||
                   episode.video_url_1080p ||
                   episode.video_url_720p ||
                   episode.video_url_480p || '';
      } else if (quality === '1080p' && episode.video_url_1080p) {
        newSource = episode.video_url_1080p;
      } else if (quality === '720p' && episode.video_url_720p) {
        newSource = episode.video_url_720p;
      } else if (quality === '480p' && episode.video_url_480p) {
        newSource = episode.video_url_480p;
      } else {
        // If selected quality doesn't exist, use smart fallback
        console.log(`Selected quality ${quality} not available, using fallback`);
        if (quality === '1080p') {
          newSource = episode.video_url_720p || episode.video_url_480p || episode.video_url_max_quality || '';
        } else if (quality === '720p') {
          newSource = episode.video_url_480p || episode.video_url_1080p || episode.video_url_max_quality || '';
        } else if (quality === '480p') {
          newSource = episode.video_url_720p || episode.video_url_1080p || episode.video_url_max_quality || '';
        } else {
          // Fallback to max quality
          newSource = episode.video_url_max_quality || '';
        }
      }
      
      console.log(`Applying quality change to ${quality}, URL: ${newSource}`);
      
      // Apply the new source immediately
      if (newSource) {
        // Update source and reload the player
        videoRef.current.src = newSource;
        videoRef.current.load();
        
        // After loading new source, restore playback position
        videoRef.current.onloadeddata = () => {
          if (videoRef.current) {
            // Restore playback position and volume
            videoRef.current.currentTime = currentTime;
            videoRef.current.volume = currentVolume;
            
            // Restore play state if it was playing
            if (wasPlaying) {
              videoRef.current.play()
                .catch(error => console.error('Error resuming playback after quality change:', error));
            }
            
            // Reset loading state
            setIsLoading(false);
          }
        };
        
        // Add error handling for source loading failures
        videoRef.current.onerror = () => {
          console.error('Failed to load video with selected quality:', quality);
          setIsLoading(false);
          
          // If the new quality fails, try falling back to max quality
          if (quality !== 'auto' && episode?.video_url_max_quality) {
            console.log('Falling back to max quality after quality selection error');
            videoRef.current!.src = episode.video_url_max_quality;
            videoRef.current!.load();
            
            // Restore playback state after fallback
            videoRef.current!.onloadeddata = () => {
              if (videoRef.current) {
                videoRef.current.currentTime = currentTime;
                if (wasPlaying) {
                  videoRef.current.play().catch(e => {
                    console.error('Error playing fallback quality:', e);
                  });
                }
              }
            };
          }
        };
      } else {
        console.error('No valid source URL found for quality:', quality);
        setIsLoading(false);
      }
    } else {
      // Just update quality if video ref isn't available
      setSelectedQuality(quality);
      setShowQualitySubmenu(false);
      setShowSettingsMenu(false);
    }
  };

  // Toggle autoplay feature
  const toggleAutoplay = () => {
    const newValue = !autoplayEnabled;
    setAutoplayEnabled(newValue);

    // If turning off autoplay and countdown is active, cancel it
    if (!newValue && showAutoplayCountdown) {
      setShowAutoplayCountdown(false);
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    }

    // Save autoplay preference to local storage
    try {
      localStorage.setItem('videoAutoplay', newValue.toString());
    } catch (err) {
      console.error('Could not save autoplay preference:', err);
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

  // Determine video URL to use based on selected quality with smart fallbacks
  const getVideoUrl = (): string => {
    // Check if the episode data is available
    if (!episode) return '';
    
    // Smart fallback system - if selected quality isn't available, try the next best option
    if (selectedQuality === 'auto') {
      // In auto mode, use max quality first, then fall back through available qualities
      return episode.video_url_max_quality ||
             episode.video_url_1080p ||
             episode.video_url_720p ||
             episode.video_url_480p || '';
    }
    
    // For specific quality selections with fallbacks
    if (selectedQuality === '1080p') {
      // If 1080p is selected but not available, fall back through lower qualities
      if (episode.video_url_1080p) {
        return episode.video_url_1080p;
      } else {
        console.log('1080p not available, falling back to next best quality');
        return episode.video_url_720p || 
               episode.video_url_480p || 
               episode.video_url_max_quality || '';
      }
    }
    
    if (selectedQuality === '720p') {
      // If 720p is selected but not available, fall back to next best options
      if (episode.video_url_720p) {
        return episode.video_url_720p;
      } else {
        console.log('720p not available, falling back to next best quality');
        // Try lower quality first, then higher if lower isn't available
        return episode.video_url_480p || 
               episode.video_url_1080p || 
               episode.video_url_max_quality || '';
      }
    }
    
    if (selectedQuality === '480p') {
      // If 480p is selected but not available, fall back to higher qualities
      if (episode.video_url_480p) {
        return episode.video_url_480p;
      } else {
        console.log('480p not available, falling back to next best quality');
        return episode.video_url_720p || 
               episode.video_url_1080p || 
               episode.video_url_max_quality || '';
      }
    }
    
    // Fallback to max quality if no match or if something unexpected happens
    console.log('Using default max quality');
    return episode.video_url_max_quality || 
           episode.video_url_1080p || 
           episode.video_url_720p || 
           episode.video_url_480p || '';
  };

  // Additional player functions
  const togglePlay = async () => {
    if (!videoRef.current) return;
    try {
      if (isPlaying) {
        await videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      // Handle any play/pause errors gracefully
      console.warn('Video playback state change failed:', error);
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

  // Screen wake lock effect to prevent screen timeout during playback
  useEffect(() => {
    // Only request wake lock when the video is playing
    const requestWakeLock = async () => {
      try {
        // Check if the Wake Lock API is supported with proper type guards
        if ('wakeLock' in navigator && navigator.wakeLock) {
          // Release any existing wake lock first
          if (wakeLockRef.current) {
            await wakeLockRef.current.release();
            wakeLockRef.current = null;
          }

          // Request a screen wake lock using type assertion for TS compatibility
          const navWakeLock = navigator.wakeLock as any;
          wakeLockRef.current = await navWakeLock.request('screen');
          console.log('Wake Lock is active');

          // Add a listener to handle case when wake lock is released
          if (wakeLockRef.current) {
            wakeLockRef.current.addEventListener('release', () => {
              console.log('Wake Lock was released');
              wakeLockRef.current = null;
            });
          }
        } else {
          console.log('Wake Lock API not supported');
        }
      } catch (err) {
        // Handle errors (e.g. when user denies permission or browser restrictions)
        console.error('Error requesting wake lock:', err);
      }
    };

    // Release wake lock when not playing
    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake Lock released');
        } catch (err) {
          console.error('Error releasing wake lock:', err);
        }
      }
    };

    // Request wake lock when playing, release when paused
    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Clean up on unmount
    return () => {
      releaseWakeLock();
    };
  }, [isPlaying]);

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

    const hideControls = () => {
      if (isPlaying && !showSettingsMenu && (!isHovering || isMobile)) {
        setShowControls(false);
      }
    };

    const resetControlsTimeout = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(hideControls, 3000);
    };

    const showControlsTemporarily = () => {
      setShowControls(true);
      resetControlsTimeout();
    };

    const playerContainer = playerContainerRef.current;
    if (playerContainer) {
      // Mouse events for desktop
      if (!isMobile) {
        playerContainer.addEventListener('mousemove', showControlsTemporarily);
        playerContainer.addEventListener('mouseenter', () => {
          setShowControls(true);
          setIsHovering(true);
          if (timeout) clearTimeout(timeout);
        });
        playerContainer.addEventListener('mouseleave', () => {
          setIsHovering(false);
          resetControlsTimeout();
        });
      }

      // Define YouTube-like skip functions
      const skipBackwardFunc = () => {
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          showControlsTemporarily();
        }
      };

      const skipForwardFunc = () => {
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration,
            videoRef.current.currentTime + 10
          );
          showControlsTemporarily();
        }
      };

      // YouTube-like controls for mobile
      const cleanupTouchHandlers = setupYouTubeControls(
        playerContainer,
        skipBackwardFunc,
        skipForwardFunc,
        togglePlay,
        setShowControls,
        showControlsTemporarily,
        isMobile
      );

      // Standard touch events for showing controls during scroll
      playerContainer.addEventListener('touchmove', showControlsTemporarily);
    }

    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      setIsFullScreen(isFullscreen);
      if (isFullscreen) {
        showControlsTemporarily();
      }
    };

    const handleMouseEnter = () => {
      setShowControls(true);
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      resetControlsTimeout();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    if (playerContainer) {
      if (!isMobile) {
        playerContainer.addEventListener('mousemove', showControlsTemporarily);
        playerContainer.addEventListener('mouseenter', handleMouseEnter);
        playerContainer.addEventListener('mouseleave', handleMouseLeave);
      }
      playerContainer.addEventListener('touchmove', showControlsTemporarily);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);

      if (playerContainer) {
        if (!isMobile) {
          playerContainer.removeEventListener('mousemove', showControlsTemporarily);
          playerContainer.removeEventListener('mouseenter', handleMouseEnter);
          playerContainer.removeEventListener('mouseleave', handleMouseLeave);
        }
        playerContainer.removeEventListener('touchmove', showControlsTemporarily);

        if (typeof cleanupTouchHandlers === 'function') {
          cleanupTouchHandlers();
        }
      }

      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isPlaying, isMobile]);

  const videoUrl = getVideoUrl();

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * videoRef.current.duration;

    // Clear any pending seek operations
    if (seekDebounceRef.current) {
      clearTimeout(seekDebounceRef.current);
    }

    // Debounce seeking to prevent rapid consecutive seeks
    seekDebounceRef.current = setTimeout(() => {
      if (videoRef.current) {
        const wasPlaying = !videoRef.current.paused;
        videoRef.current.currentTime = newTime;

                // Force immediate buffering
        if (wasPlaying) {
          videoRef.current.play().catch(() => {});
        }
            }
    }, 50);
  };


  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              console.error("Error playing video:", error);
              setIsPlaying(false);
            });
        } else {
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }

    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettingsMenu && (!isHovering || isMobile)) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying, showSettingsMenu, isHovering, isMobile]);

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
      showControlsTemporarily();
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration,
        videoRef.current.currentTime + 10
      );
      showControlsTemporarily();
    }
  };

  return (<div className="w-full flex flex-col bg-black">
      {/* Main video container with 16:9 aspect ratio */}
      <div
        ref={playerContainerRef}
        className={cn(
          "relative w-full bg-black overflow-hidden video-player-container",
          isFullScreen ? "fixed inset-0 z-50 fullscreen" : ""
        )}
        data-fullscreen={isFullScreen ? "true" : "false"}
      >
        <AspectRatio ratio={16 / 9} className="w-full h-full">
          <div className="w-full h-full relative flex justify-center items-center overflow-hidden"> {/* Centered videowith overflow hidden */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-white text-responsive">Loading video...</p>
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

            {/* YouTube-style autoplay countdown UI */}
            {showAutoplayCountdown && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 flex flexcol items-center">
                <div className="bg-black/90 rounded-lg p-6 flex flex-col items-center w-80">
                  <div className="flex items-center mb-4">
                    <div className="relative mr-4">
                      {/* Circular countdown animation */}
                      <svg className="w-12 h-12" viewBox="0 0 48 48">
                        <circle 
                          cx="24" 
                          cy="24" 
                          r="20" 
                          fill="transparent" 
                          stroke="#666" 
                          strokeWidth="4"
                        />
                        <circle 
                          cx="24" 
                          cy="24" 
                          r="20" 
                          fill="transparent" 
                          stroke="#f00" 
                          strokeWidth="4"
                          strokeDasharray="126"
                          strokeDashoffset={126 - (126 * autoplayCountdown / 5)}
                          transform="rotate(-90 24 24)"
                          style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                        <text 
                          x="24" 
                          y="28" 
                          fill="white" 
                          fontSize="16" 
                          textAnchor="middle"
                        >
                          {autoplayCountdown}
                        </text>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Up next</p>
                      <p className="text-gray-400 text-xs">
                        {hasNext ? `Episode ${episode.episode_number + 1}` : 'Playlist ended'}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full justify-between">
                    <button 
                      className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded text-sm"
                      onClick={() => {
                        setShowAutoplayCountdown(false);
                        if (autoplayTimerRef.current) {
                          clearTimeout(autoplayTimerRef.current);
                        }
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm"
                      onClick={() => {
                        if (autoplayTimerRef.current) {
                          clearTimeout(autoplayTimerRef.current);
                        }
                        onNextEpisode();
                      }}
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video element */}
            <video
              ref={videoRef}
              className="w-full h-full object-contain max-w-full max-h-full video-element"
              autoPlay
              playsInline
              preload="auto"
              onClick={togglePlay}
              controlsList="nodownload"
              onLoadedData={() => setIsLoading(false)}
              onCanPlayThrough={() => setIsLoading(false)}
              x-webkit-airplay="allow"
              data-fast-seek
              crossOrigin="anonymous"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* YouTube-like play overlay when paused */}
            {!isPlaying && !isLoading && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 cursor-pointer"
                onClick={togglePlay}
              >
                <div className="rounded-full bg-black/50 p-4 transform transition-transform hover:scale-110">
                  <Play size={isMobile ? 40 : 48} className="text-white" />
                </div>
              </div>
            )}

            {/* YouTube-like tap indicator for mobile */}
            {isMobile && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
                <div id="tap-indicator-left" className="absolute left-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0">
                  <div className="bg-white/20 rounded-full p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </div>
                </div>
                <div id="tap-indicator-right" className="absolute right-1/4 top-1/2 transform translate-x-1/2 -translate-y-1/2 opacity-0">
                  <div className="bg-white/20 rounded-full p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* YouTube-style Title overlay at top */}
            <div className={cn(
              "absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent text-white z-10 transition-opacity duration-500",
              !showControls && "opacity-0"
            )}>
              <h2 className="text-base font-semibold">{episode.title || `Episode ${episode.episode_number}`}</h2>
              <p className="text-sm text-gray-300">{cleanAnimeTitle(anime.title)}</p>
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
                    autoplayEnabled={autoplayEnabled}
                    toggleAutoplay={toggleAutoplay}
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
                    autoplayEnabled={autoplayEnabled}
                    toggleAutoplay={toggleAutoplay}
                  />
                )}
              </div>
            </div>

            {/* YouTube-style custom controls overlay */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent z-10 transition-opacity duration-300",
              !showControls && "opacity-0 pointer-events-none",
              isMobile && isFullScreen ? "pb-16 pt-4" : "pb-6 pt-8"
            )}>
              {/* Progress bar - YouTube style (thin line with hover effect) */}
              <div
                ref={progressBarRef}
                className={cn(
                  "relative w-full cursor-pointer flex items-center group",
                  isMobile ? "h-8 px-2 mb-0.5" : "h-2 px-4 mb-0" // Even larger touch target height on mobile for better interaction
                )}
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
                onClick={(e) => {
                  if (!progressBarRef.current || !videoRef.current) return;

                  const progressBar = progressBarRef.current;
                  const bounds = progressBar.getBoundingClientRect();
                  const x = e.clientX - bounds.left;
                  const width = bounds.width;
                  const percentage = x / width;
                  const newTime = duration * percentage;

                  // Update video time
                  videoRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
                onTouchMove={(e) => {
                  if (!progressBarRef.current || !videoRef.current) return;
                  e.stopPropagation();

                  // Get touch position
                  const touch = e.touches[0];
                  const progressBar = progressBarRef.current;
                  const bounds = progressBar.getBoundingClientRect();
                  const x = touch.clientX - bounds.left;
                  const width = bounds.width;

                  // Clamp x within bounds
                  const clampedX = Math.max(0, Math.min(x, width));
                  const percentage = clampedX / width;

                  const hoverTimeInSeconds = duration * percentage;
                  setTimePreview({
                    time: hoverTimeInSeconds,
                    position: clampedX
                  });
                }}
                onTouchEnd={(e) => {
                  if (!progressBarRef.current || !videoRef.current || !timePreview) return;

                  const newTime = timePreview.time;
                  videoRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                  setTimePreview(null);
                }}
              >
                {/* YouTube-style progress bar */}
                <div className="yt-progress-bar">
                  {/* Buffer progress */}
                  <div
                    className="yt-buffer-filled"
                    style={{ width: `${Math.min(bufferProgress, 100)}%` }}
                  ></div>

                  {/* Playback progress */}
                  <div
                    className="yt-progress-filled"
                    style={{ 
                      width: `${Math.min((currentTime / (duration || 1)) * 100, 100)}%`,
                      backgroundColor: 'var(--yt-red)',
                      opacity: 1
                    }}
                  ></div>

                  {/* Playback handle/thumb */}
                  <div
                    className="yt-progress-handle"
                    style={{ 
                      left: `${Math.min((currentTime / (duration || 1)) * 100, 100)}%`,
                      transform: 'translate(-50%, -50%) scale(1)' 
                    }}
                  ></div>
                </div>

                {/* Preview time tooltip */}
                {timePreview && (
                  <div 
                    className="yt-time-tooltip"
                    style={{ left: `${timePreview.position}px` }}
                  >
                    {formatTime(timePreview.time)}
                  </div>
                )}
              </div>

              {/* Control buttons row */}
              <div className={cn(
                "flex justify-between items-center text-white",
                isMobile ? "px-2 py-1 mb-0.5" : "px-4 mb-2" // More compact spacing on mobile for better alignment
              )}>
                {/* Left controls */}
                <div className={cn(
                  "flex items-center",
                  isMobile ? "space-x-2" : "space-x-2" // Adjusted spacing on mobile
                )}>
                  {/* Play/Pause button */}
                  <button
                    className={cn(
                      "text-white hover:text-white/80 transition rounded-full",
                      isMobile ? "p-1.5 mr-1" : "p-2" // Added margin-right on mobile
                    )}
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={isMobile ? 20 : 22} /> : <Play size={isMobile ? 20 : 22} />}
                  </button>

                  {/* Previous/Next episode buttons */}
                  <button
                    className={cn(
                      "text-white hover:text-white/80 transition rounded-full disabled:opacity-50 disabled:cursor-not-allowed",
                      isMobile ? "p-1.5" : "p-2" // Smaller padding on mobile
                    )}
                    onClick={onPreviousEpisode}
                    disabled={!hasPrevious}
                    aria-label="Previous episode"
                  >
                    <SkipBack size={isMobile ? 20 : 22} />
                  </button>

                  <button
                    className={cn(
                      "text-white hover:text-white/80 transition rounded-full disabled:opacity-50 disabled:cursor-not-allowed",
                      isMobile ? "p-1.5" : "p-2" // Smaller padding on mobile
                    )}
                    onClick={onNextEpisode}
                    disabled={!hasNext}
                    aria-label="Next episode"
                  >
                    <SkipForward size={isMobile ? 20 : 22} />
                  </button>

                  {/* Volume control - YouTube style */}
                  <div className="relative flex items-center group">
                    <button
                      className={cn(
                        "text-white hover:text-white/80 transition rounded-full flex items-center",
                        isMobile ? "p-1.5" : "p-2" // Smaller padding on mobile
                      )}
                      onClick={toggleMute}
                      onMouseEnter={() => setShowVolumeSlider(true)}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      <div className="flex items-center justify-center w-6 h-6">
                        {isMuted || volume === 0 ? (
                          <VolumeX size={isMobile ? 20 : 22} />
                        ) : volume < 0.5 ? (
                          <Volume1 size={isMobile ? 20 : 22} />
                        ) : (
                          <Volume2 size={isMobile ? 20 : 22} />
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
                      <div className="w-8 h-24 bg-black/95 py-3 rounded shadow-lg border border-gray-800 flex flex-col items-center relative volume-slider-responsive">
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
                            const newVolumeValue = Math.min(Math.max(1 - (y /height), 0), 1);
                            videoRef.current.volume = newVolumeValue;
                            setVolume(newVolumeValue);
                            if (newVolumeValue === 0) setIsMuted(true);
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
                  <div className="text-white ml-1 xs:ml-2 time-display-responsive">
                    <span className="tabular-nums">{formatTime(videoRef.current?.currentTime || 0)}</span>
                    <span className="mx-0.5 text-white/70">/</span>
                    <span className="tabular-nums text-white/70">{formatTime(duration)}</span>
                  </div>
                </div>

                <div className={cn(
                  "flex items-center",
                  isMobile ? "space-x-2" : "space-x-2" // Consistent spacing
                )}>
                  {/* YouTube styled buttons */}
                  <button
                    className={cn(
                      "text-white hover:text-white/80 transition rounded-full",
                      isMobile ? "p-1.5" : "p-2" // Smaller padding on mobile
                    )}
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    aria-label="Settings"
                  >
                    <Settings size={isMobile ? 18 : 20} />
                  </button>

                  {/* Fullscreen button */}
                  <button
                    className={cn(
                      "text-white hover:text-white/80 transition rounded-full",
                      isMobile ? "p-1.5" : "p-2" // Smaller padding on mobile
                    )}
                    onClick={toggleFullScreen}
                    aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullScreen ? <Minimize size={isMobile ? 18 : 22} /> : <Maximize size={isMobile ? 18 : 22} />}
                  </button>
                </div>
              </div>
            </div>
            {/* Center play/pause button - YouTube style (only shows when paused/hovering) */}
            <div 
              className={cn(
                "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 transition-opacity duration-300",
                (!isPlaying || isHovering) ? "opacity-100" : "opacity-0"
              )}
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
            >
              <button
                className="bg-black/70 backdrop-blur-sm rounded-full p-4 transition-transform hover:scale-110"
                type="button"
              >
                {isPlaying ? (
                  <Pause size={isMobile ? 24 : 32} className="text-white" />
                ) : (
                  <Play size={isMobile ? 24 : 32} className="text-white" />
                )}
              </button>
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
          className="bg-gray-800/70 hover:bg-gray-700/70 transition px-4 py-2 rounded-full text-mobile-optimized disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={onNextEpisode}
          disabled={!hasNext}
        >
          Next <SkipForward size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

// Optimize with memo to prevent unnecessary re-renders
export default memo(VideoPlayer);

const QUALITY_OPTIONS = {
  'auto': 'Auto',
  '1080p': '1080p',
  '720p': '720p',
  '480p': '480p'
};

const setupYouTubeControls = (
  playerContainer: HTMLDivElement | null,
  skipBackward: () => void,
  skipForward: () => void,
  togglePlayPause: () => void,
  setShowControls: (show: boolean) => void,
  showControlsTemporarily: () => void,
  isMobileDevice: boolean
): (() => void) | undefined => {
  if (!playerContainer || !isMobileDevice) return;

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    const rect = playerContainer.getBoundingClientRect();

    if (touch.clientX < rect.width / 2) {
      showTapIndicator('left');
      skipBackward();
    } else {
      showTapIndicator('right');
      skipForward();
    }

    setShowControls(true);
  };

  playerContainer.addEventListener('touchstart', handleTouchStart);

  return () => {
    playerContainer.removeEventListener('touchstart', handleTouchStart);
  };
};

const showTapIndicator = (side: 'left' | 'right') => {
  const indicator = document.getElementById(`tap-indicator-${side}`);
  if (indicator) {
    indicator.classList.add('animate-tap-indicator');
    setTimeout(() => {
      indicator.classList.remove('animate-tap-indicator');
    }, 500);
  }
};

const adjustVolume = (amount: number) => {
  if (!videoRef.current) return;
  const newVolume = Math.min(1, Math.max(0, volume + amount));
  videoRef.current.volume = newVolume;
  setVolume(newVolume);
  setIsMuted(newVolume === 0);
};


const seekToPercentage = (percentage: number) => {
  if (!videoRef.current) return;
  videoRef.current.currentTime = videoRef.current.duration * (percentage / 100);
};