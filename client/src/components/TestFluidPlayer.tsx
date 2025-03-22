import React, { useEffect, useRef } from 'react';
import fluidPlayer from 'fluid-player';

interface TestFluidPlayerProps {
  sampleVideoUrl: string;
}

const TestFluidPlayer: React.FC<TestFluidPlayerProps> = ({ sampleVideoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (videoRef.current && !playerInstanceRef.current) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Mobile-specific configuration
      const mobileConfig = isMobile ? {
        // Mobile-specific settings
        controlBar: {
          autoHide: true,
          autoHideTimeout: 2, // Faster hide on mobile
          animated: true,
        },
        // Reduce playback quality on mobile for better buffering
        primaryColor: "#0066cc", // More visible on mobile
        layoutMode: 'browser', // Better for mobile
        keyboardControl: false, // Disable on mobile
        // Enable mini-player for a better mobile experience
        miniPlayer: {
          enabled: true,
          width: 240,
          height: 135,
          position: 'bottom-right'
        }
      } : {};

      playerInstanceRef.current = fluidPlayer(videoRef.current.id, {
        layoutControls: {
          fillToContainer: true,
          posterImage: '', // Add poster image URL if available
          playButtonShowing: true,
          playPauseAnimation: true,
          autoPlay: false,
          preload: 'auto',
          mute: false,
          doubleclickFullscreen: true,
          // Apply mobile-specific controls if detected
          controlBar: {
            autoHide: true,
            autoHideTimeout: isMobile ? 2 : 3,
            animated: true,
          },
          ...mobileConfig
        },
        vastOptions: {
          adList: [], // Remove ads for better performance
        },
        // Optimize for performance
        modules: {
          controls: true,
          subtitles: false,
          timeline: true,
          quality: false,
          title: false,
          contextMenu: true,
        }
      });

      // Configure buffer settings with mobile optimizations
      if (videoRef.current) {
        try {
          // Set optimal buffer size based on device
          if ('buffered' in videoRef.current) {
            videoRef.current.preload = 'auto';

            // Additional mobile optimizations
            if (isMobile) {
              // Set appropriate buffer size for mobile
              videoRef.current.addEventListener('canplay', () => {
                // Start playing at slightly lower quality initially on mobile
                if (videoRef.current && videoRef.current.playbackRate) {
                  videoRef.current.playbackRate = 1.0;
                }
              });

              // Add mobile tap controls for quick skipping
              const playerWrapper = document.querySelector('.fluid_video_wrapper');
              if (playerWrapper) {
                // Left side - back 10 seconds
                const leftSide = document.createElement('div');
                leftSide.style.position = 'absolute';
                leftSide.style.left = '0';
                leftSide.style.width = '30%';
                leftSide.style.height = '70%';
                leftSide.style.top = '15%';
                leftSide.style.zIndex = '10';

                leftSide.addEventListener('click', (e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                    playerWrapper.classList.add('tapped-left');
                    setTimeout(() => playerWrapper.classList.remove('tapped-left'), 500);
                  }
                });

                // Right side - forward 10 seconds
                const rightSide = document.createElement('div');
                rightSide.style.position = 'absolute';
                rightSide.style.right = '0';
                rightSide.style.width = '30%';
                rightSide.style.height = '70%';
                rightSide.style.top = '15%';
                rightSide.style.zIndex = '10';

                rightSide.addEventListener('click', (e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.min(
                      videoRef.current.duration, 
                      videoRef.current.currentTime + 10
                    );
                    playerWrapper.classList.add('tapped-right');
                    setTimeout(() => playerWrapper.classList.remove('tapped-right'), 500);
                  }
                });

                playerWrapper.appendChild(leftSide);
                playerWrapper.appendChild(rightSide);
              }
            }
          }
        } catch (error) {
          console.error('Error configuring video buffer:', error);
        }
      }

      // Clean up on unmount
      return () => {
        if (playerInstanceRef.current && playerInstanceRef.current.destroy) {
          playerInstanceRef.current.destroy();
        }
      };
    }
  }, []);

  // Monitor buffering for MP4 files
  useEffect(() => {
    if (videoRef.current && sampleVideoUrl.toLowerCase().endsWith('.mp4')) {
      const videoElement = videoRef.current;

      // Create a buffer monitor
      const bufferMonitor = () => {
        if (!videoElement) return;

        // Add buffer progress monitoring
        if (videoElement.buffered.length > 0) {
          try {
            const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
            const duration = videoElement.duration;
            if (duration > 0) {
              const bufferPercentage = (bufferedEnd / duration) * 100;
              console.log(`Buffer progress: ${bufferPercentage.toFixed(2)}%`);

              // If buffering is low and video is playing, reduce quality
              if (bufferPercentage < 15 && !videoElement.paused && playerInstanceRef.current) {
                // Attempt to switch to lower quality if available
                const currentQuality = playerInstanceRef.current.getCurrentQuality?.();
                if (currentQuality && currentQuality !== 'low') {
                  console.log('Buffer low, reducing quality...');
                  // This would use FluidPlayer's quality switching API if available
                }
              }
            }
          } catch (e) {
            console.warn('Buffer monitoring error:', e);
          }
        }
      };

      const bufferInterval = setInterval(bufferMonitor, 3000);

      // Handle stalled/waiting events specifically for MP4
      const handleStalled = () => {
        console.log('Video stalled, attempting recovery...');
        // Force a small seek to recover playback
        if (!videoElement.paused && videoElement.currentTime > 0) {
          const currentTime = videoElement.currentTime;
          videoElement.currentTime = currentTime - 0.1;
        }
      };

      videoElement.addEventListener('stalled', handleStalled);
      videoElement.addEventListener('waiting', handleStalled);

      return () => {
        clearInterval(bufferInterval);
        videoElement.removeEventListener('stalled', handleStalled);
        videoElement.removeEventListener('waiting', handleStalled);
      };
    }
  }, [sampleVideoUrl]);

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
            preload="auto"
            playsInline
          >
            <source src={sampleVideoUrl} type="video/mp4" title="720p" data-fluid-hd />
            {/* Lower quality fallback for better buffering */}
            {sampleVideoUrl && sampleVideoUrl.includes('.mp4') && (
              <>
                {/* This will use the same URL but indicate to the player it's a lower quality option */}
                <source src={sampleVideoUrl} type="video/mp4" title="480p" />
              </>
            )}
            <p>Your browser does not support HTML5 video.</p>
          </video>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-500">
        Use keyboard shortcuts: Space (play/pause), F (fullscreen), M (mute), T (theatre mode)
      </div>
      <div className="mt-2 flex space-x-2">
        <button 
          onClick={() => playerInstanceRef.current?.play()} 
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Play
        </button>
        <button 
          onClick={() => playerInstanceRef.current?.pause()} 
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Pause
        </button>
        <button 
          onClick={() => playerInstanceRef.current?.toggleFullScreen()} 
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Toggle Fullscreen
        </button>
        <button 
          onClick={() => playerInstanceRef.current?.toggleMiniPlayer()} 
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Toggle Mini Player
        </button>
      </div>
    </div>
  );
};

export default TestFluidPlayer;