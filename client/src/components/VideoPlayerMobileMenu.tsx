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
  playbackSpeed: number;
  handlePlaybackSpeedChange: (speed: number) => void;
  autoplayEnabled: boolean;
  toggleAutoplay: () => void;
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
  availableQualities,
  playbackSpeed,
  handlePlaybackSpeedChange,
  autoplayEnabled,
  toggleAutoplay,
}: VideoPlayerMobileMenuProps) => {
  if (!showSettingsMenu) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center settings-menu-responsive">
      {/* Overlay to close menu */}
      <div 
        className="absolute inset-0 bg-black/60" 
        onClick={() => {
          setShowSettingsMenu(false);
          setShowQualitySubmenu(false);
        }}
      ></div>

      {/* Settings Panel - Fully Responsive */}
      <div 
        className="relative mx-auto bg-black/95 overflow-hidden overflow-y-auto z-50 shadow-xl settings-panel-responsive"
        style={{
          width: 'clamp(300px, 90vw, 450px)', 
          maxHeight: 'clamp(50vh, 70vh, 80vh)',
          borderRadius: window.innerWidth < 768 
            ? '1rem 1rem 0 0' 
            : '1rem'
        }}
      >
        {/* Handle at top - YouTube mobile style */}
        <div 
          style={{
            width: 'clamp(2.5rem, 8vw, 3rem)',
            height: 'clamp(0.2rem, 0.5vw, 0.25rem)',
            margin: 'clamp(0.4rem, 1vw, 0.5rem) auto'
          }} 
          className="bg-gray-500 rounded-full"
        ></div>

        {showQualitySubmenu ? (
          // Quality Submenu - Fully Responsive
          <div style={{ padding: '0 clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)' }} className="pb-4 quality-submenu-responsive">
            {/* Header with back button - Responsive */}
            <div 
              className="flex items-center sticky top-0 bg-black/95"
              style={{
                padding: 'clamp(0.6rem, 2vw, 0.85rem) clamp(0.6rem, 2vw, 1rem)'
              }}
            >
              <button 
                className="rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
                style={{
                  marginRight: 'clamp(0.75rem, 2.5vw, 1rem)',
                  padding: 'clamp(0.3rem, 1vw, 0.5rem)'
                }}
                onClick={backToMainMenu}
              >
                <svg 
                  viewBox="0 0 24 24"
                  className="text-white"
                  style={{
                    width: 'clamp(1.2rem, 5vw, 1.5rem)',
                    height: 'clamp(1.2rem, 5vw, 1.5rem)'
                  }}
                >
                  <path 
                    fill="currentColor" 
                    d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" 
                  />
                </svg>
              </button>
              <span 
                className="text-white font-medium"
                style={{ fontSize: 'clamp(0.95rem, 4vw, 1.1rem)' }}
              >
                Quality
              </span>
            </div>

            {/* Quality options - Responsive */}
            <div style={{ marginTop: 'clamp(0.25rem, 0.75vw, 0.5rem)' }}>
              {availableQualities.map(({ quality, url }) => (
                <button
                  key={quality}
                  className={`w-full text-left flex items-center justify-between hover:bg-white/5 transition-colors rounded-md ${!url ? 'opacity-50' : ''} quality-option-responsive`}
                  style={{ 
                    padding: 'clamp(0.7rem, 2.25vw, 0.9rem) clamp(0.9rem, 3vw, 1.5rem)',
                    marginBottom: 'clamp(0.2rem, 0.5vw, 0.3rem)'
                  }}
                  onClick={() => handleQualityChange(quality)}
                  disabled={!url}
                >
                  <div className="flex items-center">
                    {quality === 'auto' ? (
                      <span 
                        className="text-white"
                        style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)' }}
                      >
                        Auto
                      </span>
                    ) : (
                      <div className="flex items-center">
                        {(quality === '1080p' || quality === '720p') && (
                          <span 
                            className="bg-white/20 rounded font-medium text-white"
                            style={{ 
                              fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)',
                              padding: 'clamp(0.1rem, 0.3vw, 0.15rem) clamp(0.25rem, 0.75vw, 0.35rem)',
                              marginRight: 'clamp(0.4rem, 1.25vw, 0.5rem)'
                            }}
                          >
                            HD
                          </span>
                        )}
                        <span 
                          className="text-white"
                          style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)' }}
                        >
                          {quality}
                        </span>
                        {quality === '1080p' && (
                          <span 
                            className="text-white"
                            style={{ 
                              fontSize: 'clamp(0.9rem, 3.5vw, 1rem)',
                              marginLeft: 'clamp(0.25rem, 0.75vw, 0.35rem)'
                            }}
                          >
                            Premium
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedQuality === quality && (
                    <svg 
                      viewBox="0 0 24 24"
                      className="text-white"
                      style={{
                        width: 'clamp(1.2rem, 5vw, 1.5rem)',
                        height: 'clamp(1.2rem, 5vw, 1.5rem)'
                      }}
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
          // Main Settings Menu - Fully Responsive
          <div style={{ padding: '0 clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)' }} className="pb-4 main-settings-menu-responsive">
            <p 
              className="text-gray-400 hidden md:block"
              style={{ 
                fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
                padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem) clamp(0.2rem, 0.5vw, 0.25rem)'
              }}
            >
              Settings
            </p>

            {/* Quality option - Responsive */}
            <button 
              className="w-full text-left flex items-center justify-between hover:bg-white/5 transition-colors rounded-md"
              style={{ 
                padding: 'clamp(0.7rem, 2vw, 0.9rem) clamp(0.75rem, 2vw, 1rem)',
                marginBottom: 'clamp(0.2rem, 0.5vw, 0.25rem)'
              }}
              onClick={openQualitySubmenu}
            >
              <div className="flex items-center">
                <svg 
                  className="text-white" 
                  viewBox="0 0 24 24"
                  style={{
                    width: 'clamp(1.2rem, 4vw, 1.5rem)',
                    height: 'clamp(1.2rem, 4vw, 1.5rem)',
                    marginRight: 'clamp(0.75rem, 2.5vw, 1rem)'
                  }}
                >
                  <path fill="currentColor" d="M14,12H15.5V14.82L17.94,16.23L17.19,17.53L14,15.69V12M4,2H18A2,2 0 0,1 20,4V10.1C21.24,11.36 22,13.09 22,15A7,7 0 0,1 15,22C13.09,22 11.36,21.24 10.1,20H4A2,2 0 0,1 2,18V4A2,2 0 0,1 4,2M4,4V18H8.1C8.04,17.68 8,17.34 8,17A7,7 0 0,1 15,10C15.34,10 15.68,10.04 16,10.1V4H4M15,12A5,5 0 0,0 10,17A5,5 0 0,0 15,22A5,5 0 0,0 20,17A5,5 0 0,0 15,12Z" />
                </svg>
                <span 
                  className="text-white"
                  style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}
                >
                  Quality
                </span>
              </div>

              <div className="flex items-center text-gray-400">
                <span 
                  style={{ 
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                    marginRight: 'clamp(0.35rem, 1vw, 0.5rem)'
                  }}
                >
                  {selectedQuality === 'auto' ? 'Auto' : selectedQuality}
                </span>
                <svg 
                  viewBox="0 0 24 24"
                  style={{
                    width: 'clamp(1rem, 3.5vw, 1.25rem)',
                    height: 'clamp(1rem, 3.5vw, 1.25rem)'
                  }}
                >
                  <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
              </div>
            </button>

            {/* Playback speed option - Responsive */}
            <button 
              className="w-full text-left flex items-center justify-between hover:bg-white/5 transition-colors rounded-md"
              style={{ 
                padding: 'clamp(0.7rem, 2vw, 0.9rem) clamp(0.75rem, 2vw, 1rem)',
                marginBottom: 'clamp(0.2rem, 0.5vw, 0.25rem)'
              }}
              onClick={() => handlePlaybackSpeedChange(playbackSpeed === 2 ? 1 : playbackSpeed + 0.25)}
            >
              <div className="flex items-center">
                <svg 
                  className="text-white" 
                  viewBox="0 0 24 24"
                  style={{
                    width: 'clamp(1.2rem, 4vw, 1.5rem)',
                    height: 'clamp(1.2rem, 4vw, 1.5rem)',
                    marginRight: 'clamp(0.75rem, 2.5vw, 1rem)'
                  }}
                >
                  <path fill="currentColor" d="M13,2.05V4.05C17.39,4.59 20.5,8.58 19.96,12.97C19.5,16.61 16.64,19.5 13,19.93V21.93C18.5,21.38 22.5,16.5 21.95,11C21.5,6.25 17.73,2.5 13,2.05M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />
                </svg>
                <span 
                  className="text-white"
                  style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}
                >
                  Playback speed
                </span>
              </div>

              <div className="flex items-center text-gray-400">
                <span 
                  style={{ 
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                    marginRight: 'clamp(0.35rem, 1vw, 0.5rem)'
                  }}
                >
                  {playbackSpeed}x
                </span>
                <svg 
                  viewBox="0 0 24 24"
                  style={{
                    width: 'clamp(1rem, 3.5vw, 1.25rem)',
                    height: 'clamp(1rem, 3.5vw, 1.25rem)'
                  }}
                >
                  <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
              </div>
            </button>

            {/* Captions option - Responsive */}
            <button 
              className="w-full text-left flex items-center justify-between hover:bg-white/5 transition-colors rounded-md"
              style={{ 
                padding: 'clamp(0.7rem, 2vw, 0.9rem) clamp(0.75rem, 2vw, 1rem)',
                marginBottom: 'clamp(0.2rem, 0.5vw, 0.25rem)'
              }}
            >
              <div className="flex items-center">
                <svg 
                  className="text-white" 
                  viewBox="0 0 24 24"
                  style={{
                    width: 'clamp(1.2rem, 4vw, 1.5rem)',
                    height: 'clamp(1.2rem, 4vw, 1.5rem)',
                    marginRight: 'clamp(0.75rem, 2.5vw, 1rem)'
                  }}
                >
                  <path fill="currentColor" d="M18,11H16.5V10.5H14.5V13.5H16.5V13H18V14A1,1 0 0,1 17,15H14A1,1 0 0,1 13,14V10A1,1 0 0,1 14,9H17A1,1 0 0,1 18,10M11,11H9.5V10.5H7.5V13.5H9.5V13H11V14A1,1 0 0,1 10,15H7A1,1 0 0,1 6,14V10A1,1 0 0,1 7,9H10A1,1 0 0,1 11,10M19,4H5C3.89,4 3,4.89 3,6V18A2,2 0 0,0 5,20H19A2,2 0 0,0 21,18V6C21,4.89 20.1,4 19,4Z" />
                </svg>
                <span 
                  className="text-white"
                  style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}
                >
                  Captions
                </span>
              </div>

              <div className="flex items-center text-gray-400">
                <span 
                  style={{ 
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                    marginRight: 'clamp(0.35rem, 1vw, 0.5rem)'
                  }}
                >
                  Off
                </span>
                <svg 
                  viewBox="0 0 24 24"
                  style={{
                    width: 'clamp(1rem, 3.5vw, 1.25rem)',
                    height: 'clamp(1rem, 3.5vw, 1.25rem)'
                  }}
                >
                  <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
              </div>
            </button>

            {/* Divider - Responsive */}
            <div className="bg-gray-800" 
              style={{ 
                height: '1px', 
                margin: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)' 
              }}
            ></div>

            {/* Autoplay toggle option - Responsive */}
            <button 
              className="w-full text-left flex items-center justify-between hover:bg-white/5 transition-colors rounded-md"
              style={{ 
                padding: 'clamp(0.7rem, 2vw, 0.9rem) clamp(0.75rem, 2vw, 1rem)',
                marginBottom: 'clamp(0.2rem, 0.5vw, 0.25rem)'
              }}
              onClick={toggleAutoplay}
            >
              <div className="flex items-center">
                <svg 
                  className="text-white" 
                  viewBox="0 0 24 24"
                  style={{
                    width: 'clamp(1.2rem, 4vw, 1.5rem)',
                    height: 'clamp(1.2rem, 4vw, 1.5rem)',
                    marginRight: 'clamp(0.75rem, 2.5vw, 1rem)'
                  }}
                >
                  <path fill="currentColor" d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" />
                </svg>
                <span 
                  className="text-white"
                  style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}
                >
                  Autoplay
                </span>
              </div>

              <div className="flex items-center text-gray-400">
                <span 
                  style={{ 
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                    marginRight: 'clamp(0.35rem, 1vw, 0.5rem)'
                  }}
                >
                  {autoplayEnabled ? 'On' : 'Off'}
                </span>
                <div 
                  className={`flex items-center rounded-full ${autoplayEnabled ? 'bg-red-600' : 'bg-gray-700'}`}
                  style={{
                    width: 'clamp(2.25rem, 8vw, 2.5rem)',
                    height: 'clamp(1.25rem, 4vw, 1.5rem)',
                    padding: 'clamp(0.15rem, 0.5vw, 0.25rem)'
                  }}
                >
                  <div 
                    className={`bg-white rounded-full shadow-md transform transition-transform duration-300`}
                    style={{
                      width: 'clamp(0.85rem, 3vw, 1rem)',
                      height: 'clamp(0.85rem, 3vw, 1rem)',
                      transform: autoplayEnabled ? 'translateX(clamp(1rem, 3.5vw, 1.25rem))' : 'translateX(0)'
                    }}
                  ></div>
                </div>
              </div>
            </button>

            {/* Lock screen option - Responsive */}
            <button 
              className="w-full text-left flex items-center justify-between hover:bg-white/5 transition-colors rounded-md"
              style={{ 
                padding: 'clamp(0.7rem, 2vw, 0.9rem) clamp(0.75rem, 2vw, 1rem)',
                marginBottom: 'clamp(0.2rem, 0.5vw, 0.25rem)'
              }}
            >
              <div className="flex items-center">
                <svg 
                  className="text-white" 
                  viewBox="0 0 24 24"
                  style={{
                    width: 'clamp(1.2rem, 4vw, 1.5rem)',
                    height: 'clamp(1.2rem, 4vw, 1.5rem)',
                    marginRight: 'clamp(0.75rem, 2.5vw, 1rem)'
                  }}
                >
                  <path fill="currentColor" d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                </svg>
                <span 
                  className="text-white"
                  style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}
                >
                  Lock screen
                </span>
              </div>
              <div className="flex items-center text-gray-400">
                <span 
                  style={{ 
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                    marginRight: 'clamp(0.35rem, 1vw, 0.5rem)'
                  }}
                >
                  Off
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Make sure all text elements have responsive classes before export
// This is a general update to ensure any text in the component uses our responsive classes

export default VideoPlayerMobileMenu;