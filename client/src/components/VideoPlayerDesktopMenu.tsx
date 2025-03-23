import { cn } from '@/lib/utils';

type VideoQuality = '1080p' | '720p' | '480p' | '360p' | '240p' | '144p' | 'auto';

interface VideoPlayerDesktopMenuProps {
  showQualityMenu: boolean;
  setShowQualityMenu: (show: boolean) => void;
  selectedQuality: VideoQuality;
  handleQualityChange: (quality: VideoQuality) => void;
  availableQualities: { quality: VideoQuality; url: string | undefined }[];
  playbackSpeed: number;
  handlePlaybackSpeedChange: (speed: number) => void;
  autoplayEnabled: boolean;
  toggleAutoplay: () => void;
}

const VideoPlayerDesktopMenu = ({
  showQualityMenu,
  setShowQualityMenu,
  selectedQuality,
  handleQualityChange,
  availableQualities,
  playbackSpeed,
  handlePlaybackSpeedChange,
  autoplayEnabled,
  toggleAutoplay,
}: VideoPlayerDesktopMenuProps) => {
  if (!showQualityMenu) return null;

  // Extended list of qualities for YouTube-like interface
  const allQualities = [
    { quality: '1080p' as VideoQuality, label: '1080p Premium', hdBadge: true, extra: 'Enhanced bitrate' },
    { quality: '1080p' as VideoQuality, label: '1080p', hdBadge: true },
    { quality: '720p' as VideoQuality, label: '720p', hdBadge: true },
    { quality: '480p' as VideoQuality, label: '480p' },
    { quality: '360p' as VideoQuality, label: '360p' },
    { quality: '240p' as VideoQuality, label: '240p' },
    { quality: '144p' as VideoQuality, label: '144p' },
    { quality: 'auto' as VideoQuality, label: 'Auto' }
  ].filter(q => {
    // Only show qualities that are available in our video
    if (q.quality === 'auto') return true;
    return availableQualities.some(aq => aq.quality === q.quality);
  });

  return (
    <div 
      className="absolute right-0 bg-black/90 rounded-md overflow-hidden z-40 shadow-xl"
      style={{
        top: 'calc(100% + 0.5rem)',
        width: 'clamp(200px, 24vw, 280px)',
        maxHeight: 'clamp(250px, 40vh, 500px)'
      }}
    >
      {/* YouTube-style header with back button - Responsive */}
      <div className="flex items-center border-b border-gray-800/50"
        style={{ 
          padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 1.5vw, 0.75rem)'
        }}
      >
        <button
          className="hover:bg-gray-700/50 rounded-full flex items-center justify-center"
          style={{ 
            marginRight: 'clamp(0.25rem, 1vw, 0.5rem)', 
            padding: 'clamp(0.2rem, 0.5vw, 0.3rem)',
          }}
          onClick={() => setShowQualityMenu(false)}
        >
          <svg
            viewBox="0 0 24 24"
            className="text-white"
            style={{
              width: 'clamp(10px, 1.2vw, 14px)',
              height: 'clamp(10px, 1.2vw, 14px)'
            }}
          >
            <path 
              fill="currentColor" 
              strokeWidth="1"
              d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z" 
            />
          </svg>
        </button>
        <span 
          className="font-medium text-white"
          style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
        >
          Settings
        </span>
      </div>
      
      {/* Autoplay option - YouTube style - Responsive */}
      <div className="border-b border-gray-800/50">
        <div style={{ 
          padding: 'clamp(0.5rem, 1.5vw, 1rem) clamp(0.75rem, 2vw, 1rem)'
        }}>
          <div className="flex items-center justify-between">
            <span 
              className="text-white"
              style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
            >
              Autoplay
            </span>
            <button 
              className="relative inline-flex items-center rounded-full"
              style={{
                height: 'clamp(1.25rem, 1.5vw, 1.5rem)',
                width: 'clamp(2.25rem, 3vw, 2.5rem)'
              }}
              onClick={toggleAutoplay}
            >
              <span 
                className={`absolute inline-block rounded-full ${autoplayEnabled ? 'bg-red-600' : 'bg-gray-700'}`}
                style={{
                  marginLeft: 'clamp(0.15rem, 0.25vw, 0.25rem)',
                  marginRight: 'clamp(0.15rem, 0.25vw, 0.25rem)',
                  height: 'clamp(0.8rem, 1.25vw, 1rem)',
                  width: 'clamp(1.75rem, 2.5vw, 2rem)'
                }}
              ></span>
              <span 
                className={`absolute rounded-full bg-white transition-transform ${autoplayEnabled ? 'translate-x-5' : 'translate-x-1'}`}
                style={{
                  height: 'clamp(0.65rem, 1vw, 0.75rem)',
                  width: 'clamp(0.65rem, 1vw, 0.75rem)',
                  transform: autoplayEnabled ? 'translateX(clamp(1rem, 1.5vw, 1.25rem))' : 'translateX(clamp(0.2rem, 0.4vw, 0.25rem))'
                }}
              ></span>
            </button>
          </div>
          <p 
            className="text-gray-400 mt-1"
            style={{ fontSize: 'clamp(0.65rem, 0.8vw, 0.75rem)' }}
          >
            When autoplay is enabled, a suggested video will automatically play next
          </p>
        </div>
      </div>

      {/* Quality section header - Responsive */}
      <div className="border-b border-gray-800/50"
        style={{ 
          padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)' 
        }}
      >
        <span 
          className="font-medium text-white"
          style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
        >
          Quality
        </span>
      </div>

      {/* Quality options - Responsive */}
      <div className="overflow-y-auto" style={{ maxHeight: 'clamp(150px, 30vh, 300px)' }}>
        {allQualities.map(({ quality, label, hdBadge, extra }) => (
          <button
            key={quality + (extra ? '-premium' : '')}
            className={cn(
              "w-full text-left text-white hover:bg-gray-700/40 transition flex items-center justify-between",
              selectedQuality === quality && "bg-gray-700/20"
            )}
            style={{ 
              padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.6rem, 1.5vw, 0.75rem)'
            }}
            onClick={() => handleQualityChange(quality)}
            disabled={!availableQualities.some(q => q.quality === quality)}
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center">
                <span style={{ fontSize: 'clamp(0.7rem, 0.9vw, 0.875rem)' }}>{label}</span>
                {hdBadge && (
                  <span 
                    className="bg-white/20 rounded font-medium ml-1.5"
                    style={{ 
                      fontSize: 'clamp(0.6rem, 0.7vw, 0.625rem)',
                      padding: 'clamp(0.05rem, 0.15vw, 0.1rem) clamp(0.15rem, 0.3vw, 0.25rem)'
                    }}
                  >
                    HD
                  </span>
                )}
              </div>
              {extra && (
                <span 
                  className="text-gray-400"
                  style={{ fontSize: 'clamp(0.6rem, 0.7vw, 0.625rem)' }}
                >
                  {extra}
                </span>
              )}
            </div>
            {selectedQuality === quality && (
              <svg
                viewBox="0 0 24 24"
                className="text-white"
                style={{
                  width: 'clamp(14px, 1.5vw, 18px)',
                  height: 'clamp(14px, 1.5vw, 18px)'
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
  );
};

export default VideoPlayerDesktopMenu;