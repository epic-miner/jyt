import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import SearchBar from './SearchBar';

const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu on location change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-1">
          <Link href="/" className="flex items-center">
            <span className="text-primary text-2xl font-bold">Anime<span className="text-white">Flix</span></span>
          </Link>
        </div>
        
        {/* Search bar (desktop) */}
        <div className="hidden md:block flex-grow max-w-xl mx-4">
          <SearchBar />
        </div>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className={`${location === '/' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>
            Home
          </Link>
          <Link href="/genre/all" className={`${location.startsWith('/genre') ? 'text-white' : 'text-slate-300 hover:text-white'}`}>
            Genres
          </Link>
          <Link href="/recently-watched" className={`${location === '/recently-watched' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>
            Recently Watched
          </Link>
        </nav>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white focus:outline-none" 
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
      </div>
      
      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden bg-dark-800 px-4 py-2 pb-3 border-t border-dark-700 ${mobileMenuOpen ? '' : 'hidden'}`}>
        <nav className="flex flex-col space-y-3">
          <Link href="/" className={`${location === '/' ? 'text-white' : 'text-slate-300 hover:text-white'} py-1`}>
            Home
          </Link>
          <Link href="/genre/all" className={`${location.startsWith('/genre') ? 'text-white' : 'text-slate-300 hover:text-white'} py-1`}>
            Genres
          </Link>
          <Link href="/recently-watched" className={`${location === '/recently-watched' ? 'text-white' : 'text-slate-300 hover:text-white'} py-1`}>
            Recently Watched
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
