import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { useDebouncedCallback } from 'use-debounce';
import { useQuery } from '@tanstack/react-query';
import { searchAnime } from '../lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    staleTime: 30000,
  });

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
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className={cn(
          "relative flex items-center w-full transition-all duration-200",
          "bg-background/10 backdrop-blur-lg",
          "rounded-2xl overflow-hidden shadow-lg",
          "border border-border/50",
          isFocused && "ring-2 ring-primary/60 border-transparent"
        )}>
          <Search className="w-5 h-5 absolute left-4 text-muted-foreground" />
          <input 
            type="text"
            ref={inputRef}
            value={searchTerm}
            onChange={handleSearch}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search anime by title, genre..." 
            className={cn(
              "w-full bg-transparent",
              "py-3 pl-12 pr-4",
              "text-base placeholder:text-muted-foreground/70",
              "outline-none focus:outline-none",
              "transition-colors duration-200"
            )}
            autoComplete="off"
          />
          {searchTerm && (
            <button 
              type="button" 
              onClick={handleClear}
              className={cn(
                "absolute right-3",
                "p-1.5 rounded-full",
                "text-muted-foreground hover:text-foreground",
                "bg-muted/50 hover:bg-muted",
                "transition-colors duration-200"
              )}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {showResults && (
        <div 
          ref={resultsRef}
          className={cn(
            "absolute top-full left-0 right-0 mt-2",
            "bg-background/95 backdrop-blur-lg",
            "rounded-xl shadow-xl",
            "border border-border/50",
            "max-h-[70vh] overflow-y-auto z-50",
            "animate-in fade-in-0 slide-in-from-top-2 duration-200"
          )}
        >
          {isLoading ? (
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
          ) : !hasResults ? (
            <div className="p-6 text-center">
              {searchTerm.trim().length > 2 ? (
                <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
              ) : (
                <p className="text-muted-foreground">Type at least 3 characters to search</p>
              )}
            </div>
          ) : (
            <div>
              <div className="p-3 bg-muted/30 flex justify-between items-center">
                <span className="text-sm text-muted-foreground px-2">
                  {searchResults.length} results for "{searchTerm}"
                </span>
                <Link href={`/search?q=${encodeURIComponent(searchTerm)}`}>
                  <span 
                    className="text-sm text-primary hover:underline px-2 cursor-pointer"
                    onClick={handleItemClick}
                  >
                    View all
                  </span>
                </Link>
              </div>
              <div className="divide-y divide-border/50">
                {searchResults.slice(0, 5).map((result) => (
                  <Link href={`/anime/${result.id}`} key={result.id}>
                    <div 
                      className={cn(
                        "flex items-center p-3",
                        "hover:bg-muted/30 active:bg-muted/50",
                        "transition-colors duration-200 cursor-pointer"
                      )}
                      onClick={handleItemClick}
                    >
                      <img 
                        src={result.thumbnail_url} 
                        alt={result.title} 
                        className="w-16 h-16 object-cover rounded-lg mr-3"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/placeholder.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-medium truncate mb-1">{result.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{result.genre}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {searchResults.length > 5 && (
                <div className="p-4 bg-muted/30 text-center">
                  <Link href={`/search?q=${encodeURIComponent(searchTerm)}`}>
                    <button 
                      className={cn(
                        "text-sm text-primary hover:text-primary/80",
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
};

export default SearchBar;