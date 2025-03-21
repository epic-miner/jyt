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
    <div className="absolute right-0 top-10 bg-black/90 rounded-md overflow-hidden z-40 w-56 shadow-xl">
      {/* YouTube-style header with back button */}
      <div className="flex items-center px-2 py-1.5 border-b border-gray-800/50">
        <button
          className="mr-1.5 p-1 hover:bg-gray-700/50 rounded-full"
          onClick={() => setShowQualityMenu(false)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            className="text-white"
          >
            <path 
              fill="currentColor" 
              strokeWidth="1"
              d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z" 
            />
          </svg>
        </button>
        <span className="text-sm font-medium text-white">Settings</span>
      </div>
      
      {/* Autoplay option - YouTube style */}
      <div className="border-b border-gray-800/50">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Autoplay</span>
            <button 
              className="relative inline-flex h-5 w-10 items-center rounded-full"
              onClick={toggleAutoplay}
            >
              <span 
                className={`absolute mx-1 inline-block h-4 w-8 rounded-full ${autoplayEnabled ? 'bg-red-600' : 'bg-gray-700'}`}
              ></span>
              <span 
                className={`absolute h-3 w-3 transform rounded-full bg-white transition-transform ${autoplayEnabled ? 'translate-x-5' : 'translate-x-1'}`}
              ></span>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">When autoplay is enabled, a suggested video will automatically play next</p>
        </div>
      </div>

      {/* Quality section header */}
      <div className="px-4 py-2 border-b border-gray-800/50">
        <span className="text-sm font-medium text-white">Quality</span>
      </div>

      {/* Quality options - exactly matching YouTube's style */}
      <div className="py-1 max-h-80 overflow-y-auto">
        {allQualities.map(({ quality, label, hdBadge, extra }) => (
          <button
            key={quality + (extra ? '-premium' : '')}
            className={cn(
              "w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700/40 transition flex items-center justify-between",
              selectedQuality === quality && "bg-gray-700/20"
            )}
            onClick={() => handleQualityChange(quality)}
            disabled={!availableQualities.some(q => q.quality === quality)}
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center">
                <span className="text-sm">{label}</span>
                {hdBadge && (
                  <span className="text-[10px] bg-white/20 px-1 rounded font-medium ml-1.5">HD</span>
                )}
              </div>
              {extra && (
                <span className="text-[10px] text-gray-400">{extra}</span>
              )}
            </div>
            {selectedQuality === quality && (
              <svg
                width="18"
                height="18"
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
  );
};

export default VideoPlayerDesktopMenu;