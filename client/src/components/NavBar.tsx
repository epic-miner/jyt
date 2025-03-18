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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`bg-dark-900/95 backdrop-blur-md sticky top-0 z-50 ${scrolled ? 'shadow-md' : 'border-b border-dark-800/60'}`}>
      <div className="container mx-auto px-4">
        {/* Top bar with logo and menu button */}
        <div className="flex items-center justify-between h-12 md:h-16">
          <Link href="/" className="flex items-center">
            <div className="relative flex items-center">
              <span className="text-xl md:text-2xl font-bold">
                <span className="text-primary">9</span>
                <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">anime</span>
              </span>
              <div className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
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

        {/* Search bar */}
        <div className="py-2 md:py-0 md:flex-grow md:mx-8">
          <SearchBar />
        </div>

        {/* Mobile Navigation Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-48 py-2' : 'max-h-0'
          }`}
        >
          <nav className="flex flex-col space-y-2">
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
      </div>
    </header>
  );
};

export default NavBar;