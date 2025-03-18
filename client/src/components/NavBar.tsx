import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import SearchBar from './SearchBar';
import { Menu, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchVisible(false);
  }, [location]);

  return (
    <header className={cn(
      "sticky top-0 z-40",
      "bg-background/90 backdrop-blur-md",
      "border-b border-border/50",
      scrolled && "shadow-sm"
    )}>
      <div className="container mx-auto px-4">
        {/* Main Navigation Bar */}
        <div className="flex items-center h-14">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center">
              <span className="text-xl font-bold">
                <span className="text-primary">9</span>
                <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">anime</span>
              </span>
              <div className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            </a>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-grow max-w-2xl mx-8">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 ml-auto">
            <Link href="/">
              <a className={cn(
                "flex items-center gap-2 transition-colors",
                location === "/" 
                  ? "text-foreground font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              )}>
                <i className="fas fa-home text-sm text-primary"></i>
                <span>Home</span>
              </a>
            </Link>
            <Link href="/genres">
              <a className={cn(
                "flex items-center gap-2 transition-colors",
                location === "/genres" 
                  ? "text-foreground font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              )}>
                <i className="fas fa-tags text-sm text-primary"></i>
                <span>Genres</span>
              </a>
            </Link>
            <Link href="/recently-watched">
              <a className={cn(
                "flex items-center gap-2 transition-colors",
                location === "/recently-watched" 
                  ? "text-foreground font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              )}>
                <i className="fas fa-history text-sm text-primary"></i>
                <span>Recent</span>
              </a>
            </Link>
          </nav>

          {/* Mobile Navigation Controls */}
          <div className="flex items-center gap-2 ml-auto md:hidden">
            <button
              onClick={() => setSearchVisible(!searchVisible)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {searchVisible ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          searchVisible ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="py-2">
            <SearchBar autoFocus={searchVisible} />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-all duration-300",
        "md:hidden",
        mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        {/* Close button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Mobile Menu Items */}
        <nav className="flex flex-col items-center justify-center h-full space-y-8">
          <Link href="/">
            <a onClick={() => setMobileMenuOpen(false)} className={cn(
              "flex items-center gap-3 text-lg transition-colors",
              location === "/" 
                ? "text-foreground font-medium" 
                : "text-muted-foreground hover:text-foreground"
            )}>
              <i className="fas fa-home text-primary"></i>
              <span>Home</span>
            </a>
          </Link>
          <Link href="/genres">
            <a onClick={() => setMobileMenuOpen(false)} className={cn(
              "flex items-center gap-3 text-lg transition-colors",
              location === "/genres" 
                ? "text-foreground font-medium" 
                : "text-muted-foreground hover:text-foreground"
            )}>
              <i className="fas fa-tags text-primary"></i>
              <span>Genres</span>
            </a>
          </Link>
          <Link href="/recently-watched">
            <a onClick={() => setMobileMenuOpen(false)} className={cn(
              "flex items-center gap-3 text-lg transition-colors",
              location === "/recently-watched" 
                ? "text-foreground font-medium" 
                : "text-muted-foreground hover:text-foreground"
            )}>
              <i className="fas fa-history text-primary"></i>
              <span>Recent</span>
            </a>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;