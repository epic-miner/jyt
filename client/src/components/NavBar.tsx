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
    <header 
      className={cn(
        "sticky top-0 z-40",
        "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-b border-border/50",
        scrolled && "shadow-sm"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center h-14">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center flex-shrink-0">
              <div className="relative flex items-center">
                <span className="text-xl font-bold">
                  <span className="text-primary">9</span>
                  <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">anime</span>
                </span>
                <div className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              </div>
            </a>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-grow max-w-2xl mx-8">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className={cn(
                "flex items-center gap-2 transition-colors",
                location === "/" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              )}>
                <i className="fas fa-home text-sm text-primary"></i>
                <span>Home</span>
              </a>
            </Link>
            <Link href="/genres">
              <a className={cn(
                "flex items-center gap-2 transition-colors",
                location === "/genres" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              )}>
                <i className="fas fa-tags text-sm text-primary"></i>
                <span>Genres</span>
              </a>
            </Link>
            <Link href="/recently-watched">
              <a className={cn(
                "flex items-center gap-2 transition-colors",
                location === "/recently-watched" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              )}>
                <i className="fas fa-history text-sm text-primary"></i>
                <span>Recent</span>
              </a>
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 ml-auto md:hidden">
            <button
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSearchVisible(!searchVisible)}
            >
              {searchVisible ? (
                <X className="w-5 h-5" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
            <button
              className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-200",
          searchVisible ? "max-h-16 py-2" : "max-h-0"
        )}>
          <SearchBar autoFocus={searchVisible} />
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden fixed inset-y-0 right-0 w-64 bg-background/95 backdrop-blur-lg border-l border-border/50",
        "transform transition-transform duration-200 ease-in-out z-50",
        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col p-4">
          <Link href="/">
            <a className={cn(
              "flex items-center gap-3 py-3 transition-colors",
              location === "/" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            )}>
              <i className="fas fa-home text-sm text-primary"></i>
              <span>Home</span>
            </a>
          </Link>
          <Link href="/genres">
            <a className={cn(
              "flex items-center gap-3 py-3 transition-colors",
              location === "/genres" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            )}>
              <i className="fas fa-tags text-sm text-primary"></i>
              <span>Genres</span>
            </a>
          </Link>
          <Link href="/recently-watched">
            <a className={cn(
              "flex items-center gap-3 py-3 transition-colors",
              location === "/recently-watched" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            )}>
              <i className="fas fa-history text-sm text-primary"></i>
              <span>Recent</span>
            </a>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default NavBar;