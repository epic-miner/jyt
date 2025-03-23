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
    
    // Get the correct URL based on quality with smart fallbacks
    let newSource = '';
    if (episode) {
      switch (quality) {
        case '1080p':
          // Try 1080p first, then fall back to lower qualities if unavailable
          if (episode.video_url_1080p) {
            newSource = episode.video_url_1080p;
          } else {
            // Fall back through other qualities
            newSource = episode.video_url_720p || 
                       episode.video_url_480p || 
                       episode.video_url_max_quality || '';
            
            console.log(`1080p not available, falling back to: ${newSource}`);
          }
          break;
          
        case '720p':
          // Try 720p first, then fall back to other qualities
          if (episode.video_url_720p) {
            newSource = episode.video_url_720p;
          } else {
            // Try lower quality first, then higher if not available
            newSource = episode.video_url_480p || 
                       episode.video_url_1080p || 
                       episode.video_url_max_quality || '';
                       
            console.log(`720p not available, falling back to: ${newSource}`);
          }
          break;
          
        case '480p':
          // Try 480p first, then fall back to higher qualities
          if (episode.video_url_480p) {
            newSource = episode.video_url_480p;
          } else {
            newSource = episode.video_url_720p || 
                       episode.video_url_1080p || 
                       episode.video_url_max_quality || '';
                       
            console.log(`480p not available, falling back to: ${newSource}`);
          }
          break;
          
        case 'auto':
        default:
          // Use max quality for auto, with fallbacks
          newSource = episode.video_url_max_quality || 
                     episode.video_url_1080p || 
                     episode.video_url_720p || 
                     episode.video_url_480p || '';
          console.log(`Auto/Max quality selected: ${newSource}`);
      }
    }

    // Only change quality if URL exists
    if (newSource) {
      if (videoElement) {
        try {
          // Store current playback state
          const currentTime = videoElement.currentTime;
          const wasPlaying = !videoElement.paused;
          const volume = videoElement.volume;
          
          // Set the new source
          videoElement.src = newSource;
          videoElement.load();
          
          // Restore playback state after source change
          videoElement.onloadeddata = () => {
            if (videoElement) {
              // Restore position and volume
              videoElement.currentTime = currentTime;
              videoElement.volume = volume;
              
              // Resume playback if it was playing
              if (wasPlaying) {
                const playPromise = videoElement.play();
                
                if (playPromise !== undefined) {
                  playPromise.catch(error => {
                    console.error("Error playing after quality change:", error);
                  });
                }
              }
            }
          };
          
          // Handle loading errors
          videoElement.onerror = () => {
            console.error('Error loading video with quality:', quality);
            
            // Try falling back to max quality as a last resort
            if (quality !== 'auto' && episode?.video_url_max_quality) {
              console.log('Error occurred, falling back to max quality');
              videoElement.src = episode.video_url_max_quality;
              videoElement.load();
              
              videoElement.onloadeddata = () => {
                if (videoElement) {
                  videoElement.currentTime = currentTime;
                  if (wasPlaying) {
                    videoElement.play().catch(e => console.error("Error playing fallback quality:", e));
                  }
                }
              };
            }
          };
        } catch (error) {
          console.error('Error during quality change:', error);
        }
      }
      
      // Update quality state in parent component
      onQualityChange(quality);
    } else {
      console.warn(`No video URL available for quality: ${quality}`);
    }
    
    // Always close the menu
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