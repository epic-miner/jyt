import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import AnimeCard from '../components/AnimeCard';
import { searchAnime } from '../lib/api';
import { cleanAnimeTitle } from '../utils/titleFormatter';

const SearchResults = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Extract search query from URL
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      
      // Update page title and meta description for SEO
      document.title = `Search Results for "${query}" | 9Anime - Watch Anime Online`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', `Search results for "${query}" - Find and watch your favorite anime online for free with English subtitles`);
      }
      
      // Update canonical URL to avoid duplicate content issues
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', `https://your-domain.com/search?q=${encodeURIComponent(query)}`);
      }
    }
  }, [location]);

  // Search for anime
  const { data: searchResults, isLoading, isError } = useQuery({
    queryKey: ['/api/search', searchQuery],
    queryFn: () => searchAnime(searchQuery),
    enabled: searchQuery.length > 0,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4 flex items-center">
        <i className="fas fa-search mr-2 text-primary"></i> Search Results
        {searchQuery && <span className="ml-2 text-sm font-normal text-slate-400">for "{searchQuery}"</span>}
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden glass-effect loading-shimmer">
              <Skeleton className="aspect-[2/3] w-full" />
              <div className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-10 glass-effect rounded-lg">
          <i className="fas fa-exclamation-circle text-slate-600 text-4xl mb-3"></i>
          <p className="text-slate-400">Error searching for anime. Please try again.</p>
        </div>
      ) : searchResults && searchResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {searchResults.map((anime) => (
            <AnimeCard 
              key={anime.id} 
              anime={{
                ...anime,
                title: cleanAnimeTitle(anime.title) // Remove tags from title
              }}
              rating={4.5}
              episodeCount={anime.episode_count}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 glass-effect rounded-lg">
          <i className="fas fa-search text-slate-600 text-4xl mb-3"></i>
          <p className="text-slate-400">No results found for "{searchQuery}"</p>
          <p className="text-sm text-slate-500 mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;