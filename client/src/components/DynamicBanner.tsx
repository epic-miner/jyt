import { useEffect, useState } from 'react';

interface Banner {
  url: string;
  addedAt: string;
}

const DynamicBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const storedBanners = JSON.parse(localStorage.getItem('homeBanners') || '[]');
    setBanners(storedBanners);

    // Rotate banners every 5 seconds
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        prevIndex + 1 >= storedBanners.length ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (banners.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 animate-pulse">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <p className="text-gray-400">No banners available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner.addedAt}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={banner.url}
            alt={`Banner ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
        </div>
      ))}
      
      {/* Banner indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentBannerIndex ? 'bg-white w-4' : 'bg-white/50'
            }`}
            onClick={() => setCurrentBannerIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default DynamicBanner;
