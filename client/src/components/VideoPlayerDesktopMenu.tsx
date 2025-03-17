import { cn } from '@/lib/utils';

type VideoQuality = '1080p' | '720p' | '480p' | '360p' | '240p' | '144p' | 'auto';

interface VideoPlayerDesktopMenuProps {
  showQualityMenu: boolean;
  setShowQualityMenu: (show: boolean) => void;
  selectedQuality: VideoQuality;
  handleQualityChange: (quality: VideoQuality) => void;
  availableQualities: { quality: VideoQuality; url: string | undefined }[];
}

const VideoPlayerDesktopMenu = ({
  showQualityMenu,
  setShowQualityMenu,
  selectedQuality,
  handleQualityChange,
  availableQualities
}: VideoPlayerDesktopMenuProps) => {
  if (!showQualityMenu) return null;

  return (
    <div className="absolute right-0 top-10 bg-black/90 rounded-md overflow-hidden z-40 w-[250px] shadow-xl">
      {/* YouTube-style header with back button */}
      <div className="flex items-center px-4 py-2 border-b border-gray-800/50">
        <button
          className="mr-2 p-1 hover:bg-gray-700/50 rounded-full"
          onClick={() => setShowQualityMenu(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-white"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="text-sm font-medium text-white">Quality</span>
      </div>

      {/* Quality options */}
      <div className="py-1">
        {availableQualities.map(({ quality, url }) => (
          <button
            key={quality}
            className={cn(
              "w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-700/40 transition flex items-center justify-between",
              selectedQuality === quality && "bg-gray-700/20"
            )}
            onClick={() => handleQualityChange(quality)}
            disabled={!url}
          >
            <div className="flex items-center">
              {quality === '1080p' && (
                <>
                  <span className="mr-2 text-base">1080p Premium</span>
                  <span className="text-xs bg-white/20 px-1 rounded font-medium">HD</span>
                </>
              )}
              {quality === '1080p' ? (
                <span className="text-xs text-gray-400 ml-2">Enhanced bitrate</span>
              ) : (
                <div className="flex items-center">
                  {quality !== 'auto' ? (
                    <>
                      <span className="text-base">{quality}</span>
                      {quality === '720p' && (
                        <span className="text-xs bg-white/20 px-1 rounded font-medium ml-2">HD</span>
                      )}
                    </>
                  ) : (
                    <span className="text-base">Auto</span>
                  )}
                </div>
              )}
            </div>
            {selectedQuality === quality && (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white"
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