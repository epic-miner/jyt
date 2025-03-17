import { useState, useEffect, useRef } from 'react';
import { Episode, Anime } from '@shared/types';
import { updateWatchHistory } from '../lib/cookies';

interface VideoPlayerProps {
  anime: Anime;
  episode: Episode;
  onNextEpisode: () => void;
  onPreviousEpisode: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const VideoPlayer = ({ 
  anime, 
  episode, 
  onNextEpisode, 
  onPreviousEpisode, 
  hasNext, 
  hasPrevious 
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Update watch history every 5 seconds while playing
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Check if we have saved progress for this episode
    const savedHistoryItems = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const savedItem = savedHistoryItems.find(
      (item: any) => item.animeId === anime.id.toString() && item.episodeId === episode.id.toString()
    );
    
    if (savedItem && savedItem.progress > 0) {
      // Set video time to saved progress
      const durationSeconds = videoRef.current.duration;
      if (!isNaN(durationSeconds)) {
        const timeToSet = savedItem.progress * durationSeconds / 100;
        videoRef.current.currentTime = timeToSet;
      }
    }
    
    const handleTimeUpdate = () => {
      if (!videoRef.current) return;
      
      const currentVideoTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      
      if (!isNaN(duration) && duration > 0) {
        const progressPercent = (currentVideoTime / duration) * 100;
        setCurrentTime(progressPercent);
        
        // Save progress every 5 seconds
        if (Math.floor(currentVideoTime) % 5 === 0) {
          updateWatchHistory({
            animeId: anime.id.toString(),
            episodeId: episode.id.toString(),
            title: episode.title,
            episodeNumber: episode.episode_number,
            animeThumbnail: anime.thumbnail_url,
            animeTitle: anime.title,
            progress: progressPercent,
            timestamp: new Date().getTime()
          });
        }
      }
    };
    
    const handleVideoLoad = () => {
      setIsLoading(false);
    };
    
    const handleVideoError = () => {
      setIsLoading(false);
      setError('Failed to load video. The video might be unavailable or the format is not supported.');
    };
    
    const videoElement = videoRef.current;
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadeddata', handleVideoLoad);
    videoElement.addEventListener('error', handleVideoError);
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('loadeddata', handleVideoLoad);
        videoElement.removeEventListener('error', handleVideoError);
      }
    };
  }, [anime, episode]);
  
  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      const videoContainer = document.querySelector('.video-container') as HTMLElement;
      if (videoContainer && videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };
  
  // Determine video URL to use
  const videoUrl = episode.video_url_max_quality || 
                   episode.video_url_1080p || 
                   episode.video_url_720p || 
                   episode.video_url_480p;
  
  return (
    <div className="relative w-full flex-grow video-container bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white">Loading video...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="text-center max-w-md p-6 bg-dark-800 rounded-lg">
            <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
            <h3 className="text-xl font-bold mb-2">Video Error</h3>
            <p className="text-slate-300 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 transition px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        autoPlay
        playsInline
        controlsList="nodownload"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="absolute top-4 right-4 bg-dark-900/80 px-3 py-1.5 rounded-full text-white text-sm z-10">
        <span>{anime.title}</span> - <span>Episode {episode.episode_number}</span>
      </div>
      
      {/* Episode navigation */}
      <div className="bg-dark-900 py-3 px-4 flex justify-between items-center border-t border-dark-700">
        <button 
          className="bg-dark-800 hover:bg-dark-700 transition px-4 py-2 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onPreviousEpisode}
          disabled={!hasPrevious}
        >
          <i className="fas fa-step-backward mr-1"></i> Previous
        </button>
        
        <div className="text-sm text-slate-300">
          Episode <span className="font-bold">{episode.episode_number}</span>
        </div>
        
        <button 
          className="bg-dark-800 hover:bg-dark-700 transition px-4 py-2 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNextEpisode}
          disabled={!hasNext}
        >
          Next <i className="fas fa-step-forward ml-1"></i>
        </button>
      </div>
      
      {/* Custom video controls for better experience */}
      <div className="absolute bottom-16 left-0 right-0 z-10 px-4 hidden">
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: `${currentTime}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <button className="text-white p-2" onClick={toggleFullScreen}>
            <i className={`fas ${isFullScreen ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
