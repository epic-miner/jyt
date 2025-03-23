import React, { useEffect, useRef, useState } from 'react';
import fluidPlayer from 'fluid-player';

// Placeholder for CustomQualityMenu - Replace with your actual implementation
const CustomQualityMenu = ({ player, videoElement }: { player: any; videoElement: HTMLVideoElement | null }) => {
  const [selectedQuality, setSelectedQuality] = useState('Auto (Max)');
  const qualities = ['Auto (Max)', '1080p', '720p', '480p'];

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    // Implement logic to change video quality using player API here.  This is a placeholder.
    console.log(`Selected quality: ${quality}`);
  };

  return (
    <div className="bg-gray-800 p-2 rounded">
      <select value={selectedQuality} onChange={(e) => handleQualityChange(e.target.value)}>
        {qualities.map((quality) => (
          <option key={quality} value={quality}>
            {quality}
          </option>
        ))}
      </select>
    </div>
  );
};


interface TestFluidPlayerProps {
  sampleVideoUrl: string;
}

const TestFluidPlayer: React.FC<TestFluidPlayerProps> = ({ sampleVideoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (videoRef.current && !playerInstanceRef.current) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      const mobileConfig = isMobile ? {
        controlBar: {
          autoHide: true,
          autoHideTimeout: 2,
          animated: true,
        },
        primaryColor: "#0066cc",
        layoutMode: 'browser',
        keyboardControl: false,
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
          posterImage: '',
          playButtonShowing: true,
          playPauseAnimation: true,
          autoPlay: false,
          preload: 'auto',
          mute: false,
          doubleclickFullscreen: true,
          allowTheatre: true,
          theatreSettings: {
            width: '100%',
            height: '100%',
            marginTop: 0,
            horizontalAlign: 'center'
          },
          theatreAdvanced: {
            theatreElement: 'fluid-player-container',
            classToApply: 'theater-mode'
          },
          controlBar: {
            autoHide: true,
            autoHideTimeout: isMobile ? 2 : 3,
            animated: true,
          },
          ...mobileConfig
        },
        vastOptions: {
          adList: [],
        },
        modules: {
          controls: true,
          subtitles: false,
          timeline: true,
          quality: false, //This line is crucial to allow custom quality control
          title: false,
          contextMenu: true,
        }
      });

      playerInstanceRef.current.on('playing', () => setPlayerReady(true));

      return () => {
        if (playerInstanceRef.current && playerInstanceRef.current.destroy) {
          playerInstanceRef.current.destroy();
        }
      };
    }
  }, []);


  useEffect(() => {
    if (videoRef.current && sampleVideoUrl.toLowerCase().endsWith('.mp4')) {
      const videoElement = videoRef.current;
      const bufferMonitor = () => {
        if (!videoElement) return;
        if (videoElement.buffered.length > 0) {
          try {
            const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
            const duration = videoElement.duration;
            if (duration > 0) {
              const bufferPercentage = (bufferedEnd / duration) * 100;
              console.log(`Buffer progress: ${bufferPercentage.toFixed(2)}%`);
              if (bufferPercentage < 15 && !videoElement.paused && playerInstanceRef.current) {
                const currentQuality = playerInstanceRef.current.getCurrentQuality?.();
                if (currentQuality && currentQuality !== 'low') {
                  console.log('Buffer low, reducing quality...');
                }
              }
            }
          } catch (e) {
            console.warn('Buffer monitoring error:', e);
          }
        }
      };

      const bufferInterval = setInterval(bufferMonitor, 3000);
      const handleStalled = () => {
        console.log('Video stalled, attempting recovery...');
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
            {sampleVideoUrl && sampleVideoUrl.includes('.mp4') && (
              <source src={sampleVideoUrl} type="video/mp4" title="480p" />
            )}
            <p>Your browser does not support HTML5 video.</p>
          </video>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-500">
        Use keyboard shortcuts: Space (play/pause), F (fullscreen), M (mute), T (theatre mode)
      </div>
      <div className="mt-2 flex space-x-2">
        <button onClick={() => playerInstanceRef.current?.play()} className="px-3 py-1 bg-blue-500 text-white rounded">
          Play
        </button>
        <button onClick={() => playerInstanceRef.current?.pause()} className="px-3 py-1 bg-blue-500 text-white rounded">
          Pause
        </button>
        <button onClick={() => playerInstanceRef.current?.toggleFullScreen()} className="px-3 py-1 bg-blue-500 text-white rounded">
          Toggle Fullscreen
        </button>
        <button onClick={() => playerInstanceRef.current?.toggleMiniPlayer()} className="px-3 py-1 bg-blue-500 text-white rounded">
          Toggle Mini Player
        </button>
      </div>
      {playerReady && <CustomQualityMenu player={playerInstanceRef.current} videoElement={videoRef.current} />}
    </div>
  );
};

export default TestFluidPlayer;