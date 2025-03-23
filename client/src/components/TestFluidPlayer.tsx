import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Episode } from '../../../shared/types';
import CustomQualityMenu from './CustomQualityMenu';

// Define the quality types
export type VideoQuality = '1080p' | '720p' | '480p' | 'auto';

interface TestFluidPlayerProps {
  episode: Episode | null;
  onClose: () => void;
}

const TestFluidPlayer: React.FC<TestFluidPlayerProps> = ({ episode, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('auto');
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize the player when the component mounts
  useEffect(() => {
    if (videoRef.current && episode) {
      // Set the initial source to max quality
      const initialSource = episode.video_url_max_quality;
      videoRef.current.src = initialSource;

      // Load the video
      videoRef.current.load();
      setIsLoaded(true);
    }
  }, [episode]);

  // Handle quality change
  const handleQualityChange = (quality: VideoQuality) => {
    setSelectedQuality(quality);

    console.log(`TestFluidPlayer: Quality changed to ${quality}`);

    // Get the specific URL for the selected quality without fallbacks
    let videoUrl = '';

    if (episode) {
      switch(quality) {
        case '1080p':
          videoUrl = episode.video_url_1080p || '';
          break;
        case '720p':
          videoUrl = episode.video_url_720p || '';
          break;
        case '480p':
          videoUrl = episode.video_url_480p || '';
          break;
        case 'auto':
          videoUrl = episode.video_url_max_quality || '';
          break;
      }

      console.log(`URL for ${quality}: ${videoUrl}`);

      // Only use fallbacks if the specific quality URL is not available
      if (!videoUrl) {
        console.log(`${quality} not available, falling back to max quality`);
        videoUrl = episode.video_url_max_quality || '';
      }
    }

    if (videoRef.current && videoUrl) {
      // Store current playback position and state
      const currentTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;

      // Update video source
      videoRef.current.src = videoUrl;
      videoRef.current.load();

        // Restore playback position and state after source change
        videoRef.current.onloadeddata = () => {
          videoRef.current.currentTime = currentTime;

          if (wasPlaying) {
            videoRef.current.play().catch(error => {
              console.error("Error playing video after quality change:", error);
            });
          }
        };
      } else {
        console.warn(`No video URL available for quality: ${quality}`);
      }
  };

  // Log player events for debugging
  const logVideoEvent = (eventName: string) => {
    console.log(`Video event: ${eventName}`);
  };

  return (
    <div className="fluid-player-wrapper w-full relative">
      {/* Video element */}
      <video 
        ref={videoRef}
        className="w-full h-auto"
        controls
        autoPlay
        onPlay={() => { setIsPlaying(true); logVideoEvent('play'); }}
        onPause={() => { setIsPlaying(false); logVideoEvent('pause'); }}
        onTimeUpdate={() => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); }}
        onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
        onError={(e) => console.error('Video error:', e)}
      >
        Your browser does not support the video tag.
      </video>

      {/* Quality menu */}
      {isLoaded && episode && (
        <CustomQualityMenu
          player={null}
          videoElement={videoRef.current}
          episode={episode}
          onQualityChange={handleQualityChange}
          selectedQuality={selectedQuality}
        />
      )}
    </div>
  );
};

export default TestFluidPlayer;