import React, { useState, useRef, useEffect } from 'react';

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
}

const CustomQualityMenu: React.FC<CustomQualityMenuProps> = ({ player, videoElement, episode }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('auto');
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

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    setShowMenu(false);

    // Apply quality change logic here
    if (videoElement && episode) {
      // Save current time and play state
      const currentTime = videoElement.currentTime;
      const wasPlaying = !videoElement.paused;

      // Change source based on selected quality
      let newSource = '';

      switch (quality) {
        case '1080p':
          // Only use 1080p if it exists, otherwise don't fallback to other qualities
          newSource = episode.video_url_1080p || '';
          if (!newSource) {
            console.warn('1080p quality requested but not available');
            // If 1080p is explicitly requested but not available, don't change the source
            return;
          }
          break;
        case '720p':
          newSource = episode.video_url_720p || episode.video_url_max_quality;
          break;
        case '480p':
          newSource = episode.video_url_480p || episode.video_url_max_quality;
          break;
        default:
          // Auto or fallback
          newSource = episode.video_url_max_quality;
      }

      if (newSource) {
        videoElement.src = newSource;
        videoElement.load();

        // Add event listener to restore playback position and state
        const handleLoaded = () => {
          videoElement!.currentTime = currentTime;
          if (wasPlaying) {
            videoElement!.play().catch(e => console.error('Error playing after quality change', e));
          }
          videoElement!.removeEventListener('loadeddata', handleLoaded);
        };

        videoElement.addEventListener('loadeddata', handleLoaded);
      }
    }
  };

  return (
    <div className="custom-quality-control" ref={menuRef}>
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="control-button quality-button"
        aria-label="Video quality"
        style={{position: 'relative', bottom: '40px', left: '0'}} 
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
          <path d="M14,12H15.5V14.82L17.94,16.23L17.19,17.53L14,15.69V12M4,2H18A2,2 0 0,1 20,4V10.1C21.24,11.36 22,13.09 22,15A7,7 0 0,1 15,22C13.09,22 11.36,21.24 10.1,20H4A2,2 0 0,1 2,18V4A2,2 0 0,1 4,2M4,4V18H8.1C8.04,17.68 8,17.34 8,17A7,7 0 0,1 15,10C15.34,10 15.68,10.04 16,10.1V4H4M15,12A5,5 0 0,0 10,17A5,5 0 0,0 15,22A5,5 0 0,0 20,17A5,5 0 0,0 15,12Z" />
        </svg>
      </button>

      {showMenu && (
        <div className="quality-menu" style={{ bottom: '40px', left: '0' }}> 
          {qualityOptions.map(option => (
            <button
              key={option.value}
              className={`quality-option ${selectedQuality === option.value ? 'selected' : ''}`}
              onClick={() => handleQualityChange(option.value)}
            >
              {option.label}
              {selectedQuality === option.value && (
                <svg className="check-icon" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M9,16.2L4.8,12l-1.4,1.4L9,19L21,7l-1.4-1.4L9,16.2z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomQualityMenu;