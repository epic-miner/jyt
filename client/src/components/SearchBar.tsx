import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useLocation, Link } from 'wouter';
import { useDebouncedCallback } from 'use-debounce';
import { useQuery } from '@tanstack/react-query';
import { searchAnime } from '../lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Anime } from '@shared/types';

interface SearchBarProps {
  autoFocus?: boolean;
}

// Memoized search result item to prevent unnecessary re-renders
const SearchResultItem = memo(({ 
  result, 
  onClick 
}: { 
  result: Anime; 
  onClick: () => void;
}) => {
  // Memoize sanitized title
  const sanitizedTitle = useMemo(() => 
    result.title.replace(/\(T\)|\(LR\)|\(P\)/g, ''), 
    [result.title]
  );

  // Handle image error with useCallback to prevent recreating on each render
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/images/placeholder.jpg';
  }, []);

  return (
    <Link href={`/anime/${result.id}`}>
      <div
        className={cn(
          "flex items-center p-3",
          "hover:bg-muted/30 active:bg-muted/50",
          "transition-colors duration-200 cursor-pointer"
        )}
        onClick={onClick}
      >
        <img
          src={result.thumbnail_url}
          alt={sanitizedTitle}
          className="w-16 h-16 object-cover rounded-lg mr-3"
          onError={handleImageError}
          loading="lazy"
          width="64"
          height="64"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-medium truncate mb-1">
            {sanitizedTitle}
          </h4>
          <p className="text-sm text-muted-foreground truncate">
            {result.genre}
          </p>
        </div>
      </div>
    </Link>
  );
});

SearchResultItem.displayName = 'SearchResultItem';

// Memoized loading skeletons to prevent unnecessary re-renders
const LoadingSkeletons = memo(() => (
  <div className="p-4 space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>
    ))}
  </div>
));

LoadingSkeletons.displayName = 'LoadingSkeletons';

// Main search bar component
const SearchBar = memo(({ autoFocus = false }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Optimized with staleTime and cache time for better performance
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search', searchTerm],
    queryFn: () => searchAnime(searchTerm),
    enabled: searchTerm.trim().length > 2,
    staleTime: 30000,
    gcTime: 60000, // Keep in cache for 1 minute
    refetchOnWindowFocus: false,
  });

  // Debounced navigation to prevent excessive route changes
  const debouncedNavigation = useDebouncedCallback((value: string) => {
    if (value.trim().length > 0) {
      setLocation(`/search?q=${encodeURIComponent(value.trim())}`);
      setShowResults(false);
    }
  }, 600);

  // Optimized handlers with useCallback to prevent recreating functions on each render
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length > 0) {
      setLocation(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowResults(false);
    }
  }, [searchTerm, setLocation]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (searchTerm.trim().length > 2) {
      setShowResults(true);
    }
  }, [searchTerm]);

  const handleBlur = useCallback(() => {
    // Use setTimeout to allow click events to complete before hiding results
    setTimeout(() => {
      setIsFocused(false);
      setShowResults(false);
    }, 150);
  }, []);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setShowResults(false);
    inputRef.current?.focus();
  }, []);

  const handleItemClick = useCallback(() => {
    setShowResults(false);
  }, []);

  // Optimize click outside handler using a stable callback
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

    // Passive event listener for better performance
    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize search term from URL only once on component mount
  useEffect(() => {
    if (window.location.pathname === '/search') {
      const searchParams = new URLSearchParams(window.location.search);
      const query = searchParams.get('q');
      if (query) {
        setSearchTerm(query);
      }
    }
  }, []);

  // Memoize computed values
  const hasResults = useMemo(() => 
    searchResults && searchResults.length > 0 && searchTerm.trim().length > 2,
    [searchResults, searchTerm]
  );

  const trimmedSearchTerm = useMemo(() => searchTerm.trim(), [searchTerm]);
  const searchTermEncoded = useMemo(() => 
    encodeURIComponent(trimmedSearchTerm), 
    [trimmedSearchTerm]
  );

  // Memoize class names to avoid recomputing on every render
  const containerClasses = useMemo(() => cn(
    "relative flex items-center w-full transition-all duration-200",
    "bg-background/10 backdrop-blur-lg",
    "rounded-2xl overflow-hidden shadow-lg",
    "border border-border/50",
    isFocused && "ring-2 ring-primary/60 border-transparent"
  ), [isFocused]);

  const inputClasses = useMemo(() => cn(
    "w-full bg-transparent",
    "py-2.5 pl-12 pr-4",
    "text-base placeholder:text-muted-foreground/70",
    "outline-none focus:outline-none",
    "transition-colors duration-200"
  ), []);

  const clearButtonClasses = useMemo(() => cn(
    "absolute right-3",
    "p-1.5 rounded-full",
    "text-muted-foreground hover:text-foreground",
    "bg-muted/50 hover:bg-muted",
    "transition-colors duration-200"
  ), []);

  const resultsContainerClasses = useMemo(() => cn(
    "absolute top-full left-0 right-0 mt-2",
    "bg-background/95 backdrop-blur-lg",
    "rounded-xl shadow-xl",
    "border border-border/50",
    "max-h-[70vh] overflow-y-auto z-50",
    "animate-in fade-in-0 slide-in-from-top-2 duration-200",
    "will-change-transform" // Hint for GPU acceleration
  ), []);

  // Render truncated list for better performance
  const visibleResults = useMemo(() => 
    searchResults?.slice(0, 5) || [], 
    [searchResults]
  );

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className={containerClasses}>
          <Search className="w-5 h-5 absolute left-4 text-muted-foreground" />
          <input
            type="text"
            ref={inputRef}
            value={searchTerm}
            onChange={handleSearch}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search anime by title, genre..."
            className={inputClasses}
            autoComplete="off"
            autoFocus={autoFocus}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className={clearButtonClasses}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {showResults && (
        <div ref={resultsRef} className={resultsContainerClasses}>
          {isLoading ? (
            <LoadingSkeletons />
          ) : !hasResults ? (
            <div className="p-6 text-center">
              {trimmedSearchTerm.length > 2 ? (
                <p className="text-muted-foreground">No results found for "{trimmedSearchTerm}"</p>
              ) : (
                <p className="text-muted-foreground">Type at least 3 characters to search</p>
              )}
            </div>
          ) : (
            <div>
              <div className="p-3 bg-muted/30 flex justify-between items-center">
                <span className="text-sm text-muted-foreground px-2">
                  {searchResults!.length} results for "{trimmedSearchTerm}"
                </span>
                <Link href={`/search?q=${searchTermEncoded}`}>
                  <span
                    className="text-sm text-primary hover:underline px-2 cursor-pointer"
                    onClick={handleItemClick}
                  >
                    View all
                  </span>
                </Link>
              </div>
              <div className="divide-y divide-border/50">
                {visibleResults.map((result) => (
                  <SearchResultItem 
                    key={result.id} 
                    result={result} 
                    onClick={handleItemClick} 
                  />
                ))}
              </div>
              {searchResults && searchResults.length > 5 && (
                <div className="p-4 bg-muted/30 text-center">
                  <Link href={`/search?q=${searchTermEncoded}`}>
                    <button
                      className={cn(
                        "text-xs sm:text-sm text-primary hover:text-primary/80",
                        "transition-colors duration-200"
                      )}
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
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;