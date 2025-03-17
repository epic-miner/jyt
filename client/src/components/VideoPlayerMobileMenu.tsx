import { Cog, Volume2, Volume1, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerMobileMenuProps {
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

const VideoPlayerMobileMenu = ({
  playbackSpeed,
  onPlaybackSpeedChange,
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle
}: VideoPlayerMobileMenuProps) => {
  const handlePlaybackSpeedChange = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    onPlaybackSpeedChange(speeds[nextIndex]);
  };

  return (
    <div className="bg-black/95 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
      {/* Menu header */}
      <div className="p-4 flex items-center space-x-3">
        <Cog className="w-6 h-6 text-white" />
        <span className="text-white text-lg font-medium">Settings</span>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-800 mx-4"></div>

      {/* Menu items */}
      <div className="py-2">
        {/* Volume control */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <button onClick={onMuteToggle} className="mr-3">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-6 h-6 text-white" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-6 h-6 text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white" />
                )}
              </button>
              <span className="text-white">Volume</span>
            </div>
            <span className="text-gray-400">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

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
      </div>
    </div>
  );
};

export default VideoPlayerMobileMenu;