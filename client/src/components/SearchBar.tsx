import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useDebouncedCallback } from 'use-debounce';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (value.trim().length > 0) {
      setLocation(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  }, 300);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length > 0) {
      setLocation(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  
  const handleClear = () => {
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

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

  return (
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
      
      <button 
        type="submit" 
        className="absolute right-0 top-0 h-full px-4 bg-primary rounded-r-full hidden" 
        aria-label="Search"
      >
        <i className="fas fa-search text-white"></i>
      </button>
    </form>
  );
};

export default SearchBar;
