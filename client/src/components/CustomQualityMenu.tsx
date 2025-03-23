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
    console.log(`Quality selected: ${quality}`, episode);
    
    // Get the correct URL based on quality with smart fallbacks
    let newSource = '';
    
    // Verify we have an episode object to work with
    if (!episode) {
      console.warn('No episode data available for quality selection');
      onQualityChange(quality);
      setShowMenu(false);
      return;
    }
    
    console.log(`Available sources - 1080p: ${episode.video_url_1080p ? 'yes' : 'no'}, 720p: ${episode.video_url_720p ? 'yes' : 'no'}, 480p: ${episode.video_url_480p ? 'yes' : 'no'}`);
    
    // Determine the URL based on quality with smart fallbacks
    switch (quality) {
      case '1080p':
        // Try 1080p first, then fall back to lower qualities if unavailable
        if (episode.video_url_1080p) {
          newSource = episode.video_url_1080p;
          console.log('Using 1080p source:', newSource);
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
          console.log('Using 720p source:', newSource);
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
          console.log('Using 480p source:', newSource);
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

    // Only change quality if URL exists and video element is available
    if (!newSource) {
      console.warn(`No video URL available for quality: ${quality}`);
      onQualityChange(quality); // Still update the state
      setShowMenu(false);
      return;
    }
    
    if (!videoElement) {
      console.warn('Video element not available for quality change');
      onQualityChange(quality); // Still update the state
      setShowMenu(false);
      return;
    }
    
    try {
      // Store current playback state before making any changes
      const currentTime = videoElement.currentTime;
      const wasPlaying = !videoElement.paused;
      const currentVolume = videoElement.volume;
      
      console.log(`Applying quality change to ${quality}, URL: ${newSource}`);
      console.log(`Current state - Time: ${currentTime}, Playing: ${wasPlaying}, Volume: ${currentVolume}`);
      
      // Set the new source immediately
      videoElement.src = newSource;
      videoElement.load();
      
      // Restore playback state after source change
      videoElement.onloadeddata = () => {
        if (videoElement) {
          console.log(`Video loaded, restoring time to ${currentTime}`);
          
          // Restore position and volume
          videoElement.currentTime = currentTime;
          videoElement.volume = currentVolume;
          
          // Resume playback if it was playing
          if (wasPlaying) {
            console.log('Resuming playback');
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
      
      // Update quality state in parent component
      onQualityChange(quality);
    } catch (error) {
      console.error('Error during quality change:', error);
      onQualityChange(quality); // Still update the state even on error
    }
    
    // Always close the menu
    setShowMenu(false);
  };

  return (
    <div 
      className="custom-quality-menu absolute z-40" 
      style={{
        bottom: 'clamp(10px, 5vh, 60px)', 
        right: 'clamp(10px, 3vw, 30px)'
      }}
      ref={menuRef}
    >
      <button
        className="quality-button bg-black bg-opacity-70 text-white rounded-md flex items-center transition-all transform hover:bg-opacity-90 active:scale-95"
        style={{
          padding: 'clamp(0.25rem, 1vw, 0.75rem) clamp(0.5rem, 2vw, 1rem)',
          fontSize: 'clamp(0.75rem, 3vw, 1rem)'
        }}
        onClick={() => setShowMenu(!showMenu)}
      >
        {selectedQuality === 'auto' ? 'Auto' : selectedQuality}
        <svg
          className="ml-1"
          style={{
            width: 'clamp(0.75rem, 3vw, 1rem)',
            height: 'clamp(0.75rem, 3vw, 1rem)'
          }}
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
        <div 
          className="quality-menu-dropdown absolute right-0 bg-black bg-opacity-90 rounded-md overflow-hidden shadow-lg"
          style={{
            bottom: 'calc(100% + 0.5rem)',
            width: 'clamp(80px, 25vw, 150px)',
            maxHeight: 'clamp(120px, 30vh, 300px)',
            overflowY: 'auto'
          }}
        >
          {qualityOptions.map((option) => (
            <button
              key={option.value}
              className={`block w-full text-left text-white hover:bg-gray-700 transition-colors ${
                selectedQuality === option.value ? 'bg-gray-700' : ''
              }`}
              style={{
                padding: 'clamp(0.4rem, 1.5vw, 0.7rem) clamp(0.7rem, 2vw, 1.2rem)',
                fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)'
              }}
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