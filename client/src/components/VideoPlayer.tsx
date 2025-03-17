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
    
    videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
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
  
  return (
    <div className="relative w-full flex-grow video-container bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        autoPlay
        playsInline
      >
        <source src={episode.video_url_max_quality} type="video/mp4" />
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
    </div>
  );
};

export default VideoPlayer;
