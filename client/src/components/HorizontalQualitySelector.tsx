import React from 'react';

export type VideoQuality = '1080p' | '720p' | '480p' | '360p' | '240p' | '144p' | 'auto' | 'max';

interface HorizontalQualitySelectorProps {
  availableQualities: { quality: VideoQuality; url: string | undefined }[];
  selectedQuality: VideoQuality;
  onQualityChange: (quality: VideoQuality) => void;
  isVisible: boolean;
}

const HorizontalQualitySelector: React.FC<HorizontalQualitySelectorProps> = ({
  availableQualities,
  selectedQuality,
  onQualityChange,
  isVisible
}) => {
  // Filter out qualities without URLs and ensure they're sorted properly
  const sortedQualities = React.useMemo(() => {
    const qualityOrder = ['144p', '240p', '360p', '480p', '720p', '1080p', 'max', 'auto'];
    
    return availableQualities
      .filter(q => q.url) // Only show available qualities
      .sort((a, b) => {
        const aIndex = qualityOrder.indexOf(a.quality);
        const bIndex = qualityOrder.indexOf(b.quality);
        return aIndex - bIndex;
      });
  }, [availableQualities]);

  // Find the index of the currently selected quality
  const currentIndex = React.useMemo(() => {
    return sortedQualities.findIndex(q => q.quality === selectedQuality);
  }, [sortedQualities, selectedQuality]);

  // Handle navigation between qualities
  const goToPreviousQuality = () => {
    if (sortedQualities.length === 0) return;
    
    const newIndex = currentIndex <= 0 
      ? sortedQualities.length - 1 
      : currentIndex - 1;
    
    onQualityChange(sortedQualities[newIndex].quality);
  };

  const goToNextQuality = () => {
    if (sortedQualities.length === 0) return;
    
    const newIndex = currentIndex >= sortedQualities.length - 1 
      ? 0 
      : currentIndex + 1;
    
    onQualityChange(sortedQualities[newIndex].quality);
  };

  if (!isVisible || sortedQualities.length <= 1) return null;

  // Format the quality label (Auto, MAX, or the resolution)
  const getDisplayLabel = (quality: VideoQuality) => {
    if (quality === 'auto') return 'Auto';
    if (quality === 'max') return 'MAX';
    return quality;
  };

  return (
    <div 
      className="quality-selector flex items-center justify-between bg-black/80 rounded border border-gray-700"
      style={{
        padding: 'clamp(0.25rem, 1vw, 0.5rem)',
        minWidth: 'clamp(100px, 25vw, 160px)',
      }}
    >
      <button 
        onClick={goToPreviousQuality}
        className="quality-nav-btn flex items-center justify-center text-white hover:text-gray-300 focus:outline-none transform active:scale-90 transition-transform"
        aria-label="Previous quality"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          style={{
            width: 'clamp(16px, 5vw, 24px)',
            height: 'clamp(16px, 5vw, 24px)',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <div 
        className="quality-label text-white text-center font-medium mx-1"
        style={{
          fontSize: 'clamp(0.85rem, 3vw, 1rem)',
          minWidth: 'clamp(60px, 12vw, 90px)',
        }}
      >
        {getDisplayLabel(selectedQuality)}
      </div>
      
      <button 
        onClick={goToNextQuality}
        className="quality-nav-btn flex items-center justify-center text-white hover:text-gray-300 focus:outline-none transform active:scale-90 transition-transform"
        aria-label="Next quality"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
          style={{
            width: 'clamp(16px, 5vw, 24px)',
            height: 'clamp(16px, 5vw, 24px)',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default HorizontalQualitySelector;