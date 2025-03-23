import React, { useState, useRef, useEffect } from 'react';

interface CustomQualityMenuProps {
  player: any;
  videoElement: HTMLVideoElement | null;
}

const CustomQualityMenu: React.FC<CustomQualityMenuProps> = ({ player, videoElement }) => {
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

  // Handle quality change
  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    setShowMenu(false);

    // Here we would implement the actual quality change
    // This would depend on how your player works with different sources
    if (player && videoElement) {
      // For demo purposes, just log it
      console.log(`Changed quality to: ${quality}`);

      // If the player has quality switching API, you would call it here
      // Example: player.setQuality(quality);
    }
  };

  // Quality options - matching the options in the screenshot
  const qualityOptions = [
    { value: '1080', label: '1080p' },
    { value: '720', label: '720p' },
    { value: '480', label: '480p' },
    { value: 'auto', label: 'Auto (Max)' }
  ];

  return (
    <div className="custom-quality-control" ref={menuRef}>
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="control-button quality-button"
        aria-label="Video quality"
        style={{position: 'relative', bottom: '40px', right: '0'}} //Added style to position the button
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
          <path d="M14,12H15.5V14.82L17.94,16.23L17.19,17.53L14,15.69V12M4,2H18A2,2 0 0,1 20,4V10.1C21.24,11.36 22,13.09 22,15A7,7 0 0,1 15,22C13.09,22 11.36,21.24 10.1,20H4A2,2 0 0,1 2,18V4A2,2 0 0,1 4,2M4,4V18H8.1C8.04,17.68 8,17.34 8,17A7,7 0 0,1 15,10C15.34,10 15.68,10.04 16,10.1V4H4M15,12A5,5 0 0,0 10,17A5,5 0 0,0 15,22A5,5 0 0,0 20,17A5,5 0 0,0 15,12Z" />
        </svg>
      </button>

      {showMenu && (
        <div className="quality-menu" style={{ bottom: '40px', right: '0' }}> {/* Kept this change as it pertains to the menu */}
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