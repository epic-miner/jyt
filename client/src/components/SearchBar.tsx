import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useDebouncedCallback } from 'use-debounce';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
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
    <form onSubmit={handleSubmit} className="relative">
      <input 
        type="text"
        ref={inputRef}
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search anime..." 
        className="w-full bg-dark-700 rounded-full py-2 px-4 pl-10 outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
      />
      <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
    </form>
  );
};

export default SearchBar;
