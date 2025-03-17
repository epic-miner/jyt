type VideoQuality = '1080p' | '720p' | '480p' | '360p' | '240p' | '144p' | 'auto';

interface VideoPlayerMobileMenuProps {
  showSettingsMenu: boolean;
  setShowSettingsMenu: (show: boolean) => void;
  showQualitySubmenu: boolean;
  setShowQualitySubmenu: (show: boolean) => void;
  selectedQuality: VideoQuality;
  handleQualityChange: (quality: VideoQuality) => void;
  backToMainMenu: () => void;
  openQualitySubmenu: () => void;
  availableQualities: { quality: VideoQuality; url: string | undefined }[];
}

const VideoPlayerMobileMenu = ({
  showSettingsMenu,
  setShowSettingsMenu,
  showQualitySubmenu,
  setShowQualitySubmenu,
  selectedQuality,
  handleQualityChange,
  backToMainMenu,
  openQualitySubmenu,
  availableQualities
}: VideoPlayerMobileMenuProps) => {
  if (!showSettingsMenu) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Overlay to close menu */}
      <div 
        className="absolute inset-0 bg-black/60" 
        onClick={() => {
          setShowSettingsMenu(false);
          setShowQualitySubmenu(false);
        }}
      ></div>
      
      {/* Settings Panel */}
      <div className="relative w-full max-w-md mx-auto bg-black/95 rounded-t-xl overflow-hidden z-50 shadow-xl">
        {/* Handle at top - YouTube mobile style */}
        <div className="w-12 h-1 bg-gray-500 rounded-full mx-auto my-2"></div>
        
        {showQualitySubmenu ? (
          // Quality Submenu
          <div className="px-2 pb-4">
            {/* Header with back button */}
            <div className="flex items-center py-3 px-4">
              <button 
                className="mr-4"
                onClick={backToMainMenu}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24"
                  className="text-white"
                >
                  <path 
                    fill="currentColor" 
                    d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" 
                  />
                </svg>
              </button>
              <span className="text-white text-base font-medium">Quality</span>
            </div>
            
            {/* Quality options */}
            <div className="mt-2">
              {availableQualities.map(({ quality, url }) => (
                <button
                  key={quality}
                  className="w-full text-left px-6 py-3.5 flex items-center justify-between"
                  onClick={() => handleQualityChange(quality)}
                  disabled={!url}
                >
                  <div className="flex items-center">
                    {quality === 'auto' ? (
                      <span className="text-white text-base">Auto</span>
                    ) : (
                      <div className="flex items-center">
                        {(quality === '1080p' || quality === '720p') && (
                          <span className="text-xs bg-white/20 px-1 rounded font-medium mr-2 text-white">HD</span>
                        )}
                        <span className="text-white text-base">{quality}</span>
                        {quality === '1080p' && <span className="text-white text-base ml-1">Premium</span>}
                      </div>
                    )}
                  </div>
                  
                  {selectedQuality === quality && (
                    <svg 
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      className="text-white"
                    >
                      <path 
                        fill="currentColor" 
                        d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" 
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Main Settings Menu
          <div className="px-2 pb-4">
            {/* Quality option */}
            <button 
              className="w-full text-left px-4 py-4 flex items-center justify-between"
              onClick={openQualitySubmenu}
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-6 text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M14,12H15.5V14.82L17.94,16.23L17.19,17.53L14,15.69V12M4,2H18A2,2 0 0,1 20,4V10.1C21.24,11.36 22,13.09 22,15A7,7 0 0,1 15,22C13.09,22 11.36,21.24 10.1,20H4A2,2 0 0,1 2,18V4A2,2 0 0,1 4,2M4,4V18H8.1C8.04,17.68 8,17.34 8,17A7,7 0 0,1 15,10C15.34,10 15.68,10.04 16,10.1V4H4M15,12A5,5 0 0,0 10,17A5,5 0 0,0 15,22A5,5 0 0,0 20,17A5,5 0 0,0 15,12Z" />
                </svg>
                <span className="text-white text-base">Quality</span>
              </div>
              
              <div className="flex items-center text-gray-400">
                <span className="mr-2">Auto {selectedQuality !== 'auto' ? `(${selectedQuality})` : ''}</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
              </div>
            </button>
            
            {/* Divider */}
            <div className="h-px bg-gray-800 mx-4"></div>
            
            {/* Playback speed option */}
            <button 
              className="w-full text-left px-4 py-4 flex items-center justify-between"
              onClick={handlePlaybackSpeedChange}
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-6 text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M13,2.05V4.05C17.39,4.59 20.5,8.58 19.96,12.97C19.5,16.61 16.64,19.5 13,19.93V21.93C18.5,21.38 22.5,16.5 21.95,11C21.5,6.25 17.73,2.5 13,2.05M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />
                </svg>
                <span className="text-white text-base">Playback speed</span>
              </div>
              
              <div className="flex items-center text-gray-400">
                <span className="mr-2">{playbackSpeed}x</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
              </div>
            </button>
            
            {/* Divider */}
            <div className="h-px bg-gray-800 mx-4"></div>
            
            {/* Captions option */}
            <button className="w-full text-left px-4 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-6 text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M18,11H16.5V10.5H14.5V13.5H16.5V13H18V14A1,1 0 0,1 17,15H14A1,1 0 0,1 13,14V10A1,1 0 0,1 14,9H17A1,1 0 0,1 18,10M11,11H9.5V10.5H7.5V13.5H9.5V13H11V14A1,1 0 0,1 10,15H7A1,1 0 0,1 6,14V10A1,1 0 0,1 7,9H10A1,1 0 0,1 11,10M19,4H5C3.89,4 3,4.89 3,6V18A2,2 0 0,0 5,20H19A2,2 0 0,0 21,18V6C21,4.89 20.1,4 19,4Z" />
                </svg>
                <span className="text-white text-base">Captions</span>
              </div>
              
              <div className="flex items-center text-gray-400">
                <span className="mr-2">Off</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
              </div>
            </button>
            
            {/* Divider */}
            <div className="h-px bg-gray-800 mx-4"></div>
            
            {/* Lock screen option */}
            <button className="w-full text-left px-4 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-6 text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                </svg>
                <span className="text-white text-base">Lock screen</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerMobileMenu;