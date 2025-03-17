import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { useDebouncedCallback } from 'use-debounce';
import { useQuery } from '@tanstack/react-query';
import { searchAnime } from '../lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search', searchTerm],
    queryFn: () => searchAnime(searchTerm),
    enabled: searchTerm.trim().length > 2,
    staleTime: 30000, // 30 seconds
  });

  // Debounce navigation to avoid excessive navigation
  const debouncedNavigation = useDebouncedCallback((value: string) => {
    if (value.trim().length > 0) {
      setLocation(`/search?q=${encodeURIComponent(value.trim())}`);
      setShowResults(false);
    }
  }, 600);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length > 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length > 0) {
      setLocation(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowResults(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (searchTerm.trim().length > 2) {
      setShowResults(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding results to allow for clicks on the results
    setTimeout(() => {
      setIsFocused(false);
      setShowResults(false);
    }, 150);
  };

  const handleClear = () => {
    setSearchTerm('');
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleItemClick = () => {
    setShowResults(false);
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) && 
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Extract search query from URL if on search page
    if (window.location.pathname === '/search') {
      const searchParams = new URLSearchParams(window.location.search);
      const query = searchParams.get('q');
      if (query) {
        setSearchTerm(query);
      }
    }
  }, []);

  const hasResults = searchResults && searchResults.length > 0 && searchTerm.trim().length > 2;

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className={`
          relative flex items-center w-full transition-all duration-200
          ${isFocused ? 'bg-dark-800 ring-2 ring-primary/60' : 'bg-dark-800/70'}
          rounded-full overflow-hidden shadow-inner
        `}>
          <i className="fas fa-search text-sm absolute left-3.5 text-gray-400"></i>
          <input 
            type="text"
            ref={inputRef}
            value={searchTerm}
            onChange={handleSearch}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search anime by title, genre..." 
            className="w-full bg-transparent py-2.5 pl-10 pr-4 outline-none text-sm placeholder:text-gray-500" 
            autoComplete="off"
          />
          {searchTerm && (
            <button 
              type="button" 
              onClick={handleClear}
              className="absolute right-3 text-gray-400 hover:text-white"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          )}
        </div>
      </form>

      {/* Search results dropdown */}
      {showResults && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-dark-800 rounded-lg shadow-lg border border-dark-700/50 max-h-[70vh] overflow-y-auto z-50"
        >
          {isLoading ? (
            <div className="p-3">
              <div className="flex items-center space-x-3 mb-3">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              </div>
              <div className="flex items-center space-x-3 mb-3">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              </div>
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center">
              {searchTerm.trim().length > 2 ? (
                <p className="text-slate-400">No results found for "{searchTerm}"</p>
              ) : (
                <p className="text-slate-400">Type at least 3 characters to search</p>
              )}
            </div>
          ) : (
            <div>
              <div className="p-2 bg-dark-900/50 flex justify-between items-center">
                <span className="text-xs text-slate-400 px-2">
                  {searchResults.length} results for "{searchTerm}"
                </span>
                <Link href={`/search?q=${encodeURIComponent(searchTerm)}`}>
                  <span 
                    className="text-xs text-primary hover:underline px-2 cursor-pointer"
                    onClick={handleItemClick}
                  >
                    View all results
                  </span>
                </Link>
              </div>
              <div className="divide-y divide-dark-700/30">
                {searchResults.slice(0, 5).map((result) => (
                  <Link href={`/anime/${result.id}`} key={result.id}>
                    <div 
                      className="flex items-center p-2 hover:bg-dark-700/30 transition-colors cursor-pointer"
                      onClick={handleItemClick}
                    >
                      <img 
                        src={result.thumbnail_url} 
                        alt={result.title} 
                        className="w-12 h-12 object-cover rounded mr-3"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Image';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{result.title}</h4>
                        <p className="text-xs text-slate-400 truncate">{result.genre}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {searchResults.length > 5 && (
                <div className="p-3 bg-dark-900/50 text-center">
                  <Link href={`/search?q=${encodeURIComponent(searchTerm)}`}>
                    <button 
                      className="text-sm text-primary hover:underline"
                      onClick={handleItemClick}
                    >
                      See all {searchResults.length} results
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;