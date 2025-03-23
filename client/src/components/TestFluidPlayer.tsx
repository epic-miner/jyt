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
    if (!episode || !videoRef.current) return;

    // Save current time and play state
    const currentTime = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;

    // Set the quality selection state
    setSelectedQuality(quality);

    // Get the appropriate URL based on the selected quality
    let newSource = '';

    switch (quality) {
      case '1080p':
        if (episode.video_url_1080p) {
          newSource = episode.video_url_1080p;
        } else {
          console.warn('1080p quality requested but not available');
          return; // Don't change if not available
        }
        break;
      case '720p':
        if (episode.video_url_720p) {
          newSource = episode.video_url_720p;
        } else {
          newSource = episode.video_url_max_quality;
        }
        break;
      case '480p':
        if (episode.video_url_480p) {
          newSource = episode.video_url_480p;
        } else {
          newSource = episode.video_url_max_quality;
        }
        break;
      default: // 'auto'
        newSource = episode.video_url_max_quality;
    }

    if (newSource) {
      // Update video source
      videoRef.current.src = newSource;
      videoRef.current.load();

      // Restore time and play state
      videoRef.current.addEventListener('loadedmetadata', function onceLoaded() {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
          if (wasPlaying) {
            videoRef.current.play().catch(err => console.error('Failed to resume playback:', err));
          }
          videoRef.current.removeEventListener('loadedmetadata', onceLoaded);
        }
      });
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