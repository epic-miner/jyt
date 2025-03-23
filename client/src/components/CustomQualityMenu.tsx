import React, { useState, useRef, useEffect } from 'react';
import { VideoQuality } from './TestFluidPlayer';

interface QualityOption {
  label: string;
  value: string;
}

interface CustomQualityMenuProps {
  player: any;
  videoElement: HTMLVideoElement | null;
  episode?: {
    video_url_max_quality: string;
    video_url_1080p?: string;
    video_url_720p?: string;
    video_url_480p?: string;
  };
  onQualityChange: (quality: VideoQuality) => void;
  selectedQuality: VideoQuality;
}

const CustomQualityMenu: React.FC<CustomQualityMenuProps> = ({
  player,
  videoElement,
  episode,
  onQualityChange,
  selectedQuality
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Build quality options based on available episode sources
  const qualityOptions: QualityOption[] = [
    { label: 'Auto', value: 'auto' }
  ];

  // Add available quality options based on episode data
  if (episode?.video_url_1080p) {
    qualityOptions.push({ label: '1080p', value: '1080p' });
  }

  if (episode?.video_url_720p) {
    qualityOptions.push({ label: '720p', value: '720p' });
  }

  if (episode?.video_url_480p) {
    qualityOptions.push({ label: '480p', value: '480p' });
  }

  const handleQualityClick = (quality: VideoQuality) => {
    // Log the quality selection for debugging
    console.log(`Quality selected: ${quality}`);
    
    // Get the correct URL based on quality
    let newSource = '';
    if (episode) {
      switch (quality) {
        case '1080p':
          newSource = episode.video_url_1080p || '';
          console.log(`1080p URL: ${newSource}`);
          break;
        case '720p':
          newSource = episode.video_url_720p || '';
          console.log(`720p URL: ${newSource}`);
          break;
        case '480p':
          newSource = episode.video_url_480p || '';
          console.log(`480p URL: ${newSource}`);
          break;
        case 'auto':
        default:
          newSource = episode.video_url_max_quality || '';
          console.log(`Auto/Max URL: ${newSource}`);
      }
    }

    // Only change quality if URL exists
    if (newSource) {
      if (videoElement) {
        // Store current playback state
        const currentTime = videoElement.currentTime;
        const wasPlaying = !videoElement.paused;
        
        // Set the new source
        videoElement.src = newSource;
        videoElement.load();
        
        // Restore playback state after source change
        videoElement.onloadeddata = () => {
          videoElement.currentTime = currentTime;
          if (wasPlaying) {
            videoElement.play().catch(e => console.error("Error playing after quality change:", e));
          }
        };
      }
      
      // Update quality state
      onQualityChange(quality);
    } else {
      console.warn(`No video URL available for quality: ${quality}`);
    }
    
    setShowMenu(false);
  };

  return (
    <div className="custom-quality-menu absolute bottom-14 right-4 z-40" ref={menuRef}>
      <button
        className="quality-button bg-black bg-opacity-70 text-white px-3 py-1 rounded-md flex items-center"
        onClick={() => setShowMenu(!showMenu)}
      >
        {selectedQuality === 'auto' ? 'Auto' : selectedQuality}
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={showMenu ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
          />
        </svg>
      </button>

      {showMenu && (
        <div className="quality-menu-dropdown absolute right-0 bottom-10 bg-black bg-opacity-90 rounded-md overflow-hidden w-32">
          {qualityOptions.map((option) => (
            <button
              key={option.value}
              className={`block w-full text-left text-white px-4 py-2 hover:bg-gray-700 transition-colors ${
                selectedQuality === option.value ? 'bg-gray-700' : ''
              }`}
              onClick={() => handleQualityClick(option.value as VideoQuality)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomQualityMenu;