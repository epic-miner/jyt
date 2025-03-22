
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
          controlBar: {
            autoHide: true,
            autoHideTimeout: 3,
            animated: true,
          },
        },
        vastOptions: {
          adList: [], // Remove ads for better performance if they're not needed
        },
        // Optimize for performance
        modules: {
          controls: true,
          subtitles: false, // Set to true if needed
          timeline: true,
          quality: false, // Set to true if multiple sources are available
          title: false,
          contextMenu: true,
        }
      });

      // Configure buffer settings
      if (videoRef.current) {
        try {
          // Set a reasonable buffer size (in seconds)
          if ('buffered' in videoRef.current) {
            // Set higher buffer for better playback
            videoRef.current.preload = 'auto';
          }

          // Lower quality for better buffering if needed
          // This would require multiple sources with different qualities
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

import { useRef, useEffect } from 'react';

// Define the window fluidPlayer property
declare global {
  interface Window {
    fluidPlayer: (target: string, options?: any) => any;
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
    const initPlayer = () => {
      console.log('window.fluidPlayer available:', typeof window.fluidPlayer === 'function');
      console.log('Video element available:', document.getElementById('test-player') !== null);

      if (typeof window.fluidPlayer !== 'function') {
        console.warn('Fluid Player not loaded yet, retrying in 200ms');
        setTimeout(initPlayer, 200);
        return;
      }

      if (!document.getElementById('test-player')) {
        console.warn('Video element not found, retrying in 200ms');
        setTimeout(initPlayer, 200);
        return;
      }
      
      // Check if player is already initialized
      if (playerInstanceRef.current) {
        console.log('Player already initialized, skipping');
        return;
      }

      console.log('Initializing fluid player with all features');
      const player = window.fluidPlayer('test-player', {
        layoutControls: {
          primaryColor: "#ef4444", // Match your theme's primary color
          fillToContainer: true,
          posterImage: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.jpg',
          playButtonShowing: true,
          playPauseAnimation: true,
          autoPlay: false,
          mute: false,
          keyboardControl: true,
          loop: false,
          allowTheatre: true,
          allowDownload: true,
          playbackRateEnabled: true,
          controlBar: {
            autoHide: true,
            autoHideTimeout: 3,
            animated: true
          },
          contextMenu: {
            controls: true,
            links: [
              {
                href: 'https://github.com/fluid-player/fluid-player',
                label: 'Fluid Player Github'
              }
            ]
          },
          logo: {
            imageUrl: '/assets/logo_optimized.png',
            position: 'top left',
            clickUrl: null,
            opacity: 0.8,
            mouseOverImageUrl: null,
            imageMargin: '10px',
            hideWithControls: true,
            showOverAds: true
          },
          htmlOnPauseBlock: {
            html: '<div class="fluid-player-pause-banner">Video is paused. Click play to continue.</div>',
            height: 50,
            width: 300
          },
          miniPlayer: {
            enabled: true,
            width: 400,
            height: 225,
            placeholderText: "Playing in mini player",
            position: "bottom-right"
          },
          timelinePreview: {
            file: null,
            type: 'VTT'
          },
          captions: {
            play: 'Play',
            pause: 'Pause',
            mute: 'Mute',
            unmute: 'Unmute',
            fullscreen: 'Fullscreen',
            exitFullscreen: 'Exit Fullscreen'
          }
        },
        vastOptions: {
          adList: [],
          adCTAText: false,
          adCTATextPosition: 'bottom right',
          adClickable: true,
          vastTimeout: 5000,
          showProgressbarMarkers: false,
          maxAllowedVastTagRedirects: 3,
          vastAdvanced: {
            vastLoadedCallback: () => console.log('VAST loaded'),
            noVastVideoCallback: () => console.log('No VAST video'),
            vastVideoSkippedCallback: () => console.log('VAST skipped'),
            vastVideoEndedCallback: () => console.log('VAST ended')
          }
        }
      });

      // Store player instance for cleanup and control
      playerInstanceRef.current = player;

      // Register event listeners
      player.on('play', () => console.log('Video played'));
      player.on('pause', () => console.log('Video paused'));
      player.on('timeupdate', (time) => console.log('Time update:', time));
      player.on('ended', () => console.log('Video ended'));
      player.on('seeked', () => console.log('Video seeked'));
      player.on('theatreModeOn', () => console.log('Theatre mode on'));
      player.on('theatreModeOff', () => console.log('Theatre mode off'));
      player.on('miniPlayerToggle', (event) => console.log('Mini player toggled:', event.detail.isToggledOn));

      console.log('Fluid player instance:', player);
    };

    initPlayer();

    return () => {
      // Cleanup on unmount
      console.log('TestFluidPlayer component unmounting');
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
          playerInstanceRef.current = null;
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
            preload="auto"
            playsInline
          >
            <source src={sampleVideoUrl} type="video/mp4" title="720p" />
            {/* Add additional source elements for different qualities */}
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