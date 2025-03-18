import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import SearchBar from './SearchBar';

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`bg-dark-900/95 backdrop-blur-md sticky top-0 z-40 ${scrolled ? 'shadow-md' : 'border-b border-dark-800/60'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="relative flex items-center">
              <span className="text-xl font-bold">
                <span className="text-primary">9</span>
                <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">anime</span>
              </span>
              <div className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-grow max-w-2xl mx-8">
            <SearchBar />
          </div>

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
        </div>
      </div>
    </header>
  );
};

export default NavBar;