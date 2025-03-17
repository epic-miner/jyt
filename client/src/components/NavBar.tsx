import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import SearchBar from './SearchBar';

const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu on location change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`bg-dark-900/95 backdrop-blur-md sticky top-0 z-50 ${scrolled ? 'shadow-md' : 'border-b border-dark-800/60'}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <div className="flex items-center space-x-1">
          <Link href="/" className="flex items-center">
            <div className="relative flex items-center">
              <span className="text-primary text-2xl font-bold mr-1">
                Anime<span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">Flix</span>
              </span>
              <div className="absolute -top-0.5 -right-2 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            </div>
          </Link>
        </div>

        {/* Search bar (desktop) */}
        <div className="hidden md:block flex-grow max-w-xl mx-6">
          <SearchBar />
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/">
            <div className={`flex items-center gap-2 ${location === '/' ? 'text-white font-medium' : 'text-slate-300 hover:text-white'}`}>
              <i className="fas fa-home text-sm mr-2 text-primary"></i>
              <span>Home</span>
            </div>
          </Link>
          <Link href="/genre/all">
            <div className={`flex items-center gap-2 ${location.startsWith('/genre') ? 'text-white font-medium' : 'text-slate-300 hover:text-white'}`}>
              <i className="fas fa-tags text-sm mr-2 text-primary"></i>
              <span>Genres</span>
            </div>
          </Link>
          <Link href="/recently-watched">
            <div className={`flex items-center gap-2 ${location === '/recently-watched' ? 'text-white font-medium' : 'text-slate-300 hover:text-white'}`}>
              <i className="fas fa-history text-sm mr-2 text-primary"></i>
              <span>Recently Watched</span>
            </div>
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white focus:outline-none p-2" 
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
        </button>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>

      {/* Mobile menu with smooth transition */}
      <div 
        className={`md:hidden bg-dark-800 border-t border-dark-700 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-48 py-3' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col space-y-3 px-4">
          <Link href="/">
            <div className={`flex items-center gap-2 ${location === '/' ? 'text-white font-medium' : 'text-slate-300 hover:text-white'} py-2`}>
              <i className="fas fa-home text-sm mr-3 text-primary"></i>
              <span>Home</span>
            </div>
          </Link>
          <Link href="/genre/all">
            <div className={`flex items-center gap-2 ${location.startsWith('/genre') ? 'text-white font-medium' : 'text-slate-300 hover:text-white'} py-2`}>
              <i className="fas fa-tags text-sm mr-3 text-primary"></i>
              <span>Genres</span>
            </div>
          </Link>
          <Link href="/recently-watched">
            <div className={`flex items-center gap-2 ${location === '/recently-watched' ? 'text-white font-medium' : 'text-slate-300 hover:text-white'} py-2`}>
              <i className="fas fa-history text-sm mr-3 text-primary"></i>
              <span>Recently Watched</span>
            </div>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;