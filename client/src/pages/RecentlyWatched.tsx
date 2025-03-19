import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import AnimeCard from '../components/AnimeCard';
import { getRecentlyWatchedAnime, getWatchHistory } from '../lib/cookies';
import { WatchHistoryItem, RecentlyWatchedAnime } from '@shared/types';

const RecentlyWatched = () => {
  const [continueWatching, setContinueWatching] = useState<WatchHistoryItem[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<RecentlyWatchedAnime[]>([]);
  
  useEffect(() => {
    // Get watch history and recently watched from cookies
    const history = getWatchHistory();
    const recents = getRecentlyWatchedAnime();
    
    setContinueWatching(history);
    setRecentlyWatched(recents);
  }, []);
  
  const hasNoHistory = continueWatching.length === 0 && recentlyWatched.length === 0;
  
  if (hasNoHistory) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <i className="fas fa-history text-slate-600 text-5xl mb-4"></i>
        <h1 className="text-2xl font-bold mb-2">No Watch History</h1>
        <p className="text-slate-400 mb-6">You haven't watched any anime yet.</p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90">
            Browse Anime
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Watch Activity</h1>
      
      {/* Continue watching section */}
      {continueWatching.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <i className="fas fa-history mr-2 text-primary"></i> Continue Watching
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {continueWatching.map((item) => (
              <a href={`/watch/${item.animeId}/${item.episodeId}`} key={`${item.animeId}-${item.episodeId}`} className="block">
                <div className="rounded-lg overflow-hidden bg-dark-800 transition hover:scale-105 cursor-pointer">
                  <div className="relative h-40">
                    <img 
                      src={item.animeThumbnail} 
                      alt={item.animeTitle.replace(/\(T\)|\(LR\)|\(P\)/g, '')} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                      EP {item.episodeNumber}
                    </div>
                  </div>
                  <div className="p-2">
                    <h3 className="font-medium text-sm">{item.animeTitle.replace(/\(T\)|\(LR\)|\(P\)/g, '')}</h3>
                    <p className="text-xs text-slate-400">Episode {item.episodeNumber}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
      
      {/* Recently watched anime section */}
      {recentlyWatched.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <i className="fas fa-clock mr-2 text-primary"></i> Recently Viewed
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recentlyWatched.map((anime) => (
              <AnimeCard 
                key={anime.id} 
                anime={{
                  id: parseInt(anime.id),
                  title: anime.title.replace(/\(T\)|\(LR\)|\(P\)/g, ''),
                  thumbnail_url: anime.thumbnail_url,
                  genre: anime.genre,
                  description: ''
                }} 
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default RecentlyWatched;
