
import { useLocation } from '@solidjs/router';

const Footer = () => {
  const [location] = useLocation();

  return (
    <footer className="footer-container bg-background/80 backdrop-blur-xl border-t border-border/40 p-6 w-full mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6">
          {/* Column 1 - Logo and Description */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center mb-3 transform hover:scale-105 transition-transform">
              <img src="/images/logo.webp" alt="9Anime Logo" className="h-10 w-10 mr-2 drop-shadow-glow" />
              <h3 className="text-2xl font-bold">
                <span className="text-primary">9</span>
                <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">Anime</span>
              </h3>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left leading-relaxed">
              Your ultimate destination for anime streaming. Watch your favorite anime shows and movies in HD quality.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-primary/90 to-purple-400 text-transparent bg-clip-text">Quick Links</h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2">
              <a href="/" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200 flex items-center">
                <span className="mr-2 text-xs">→</span>Home
              </a>
              <a href="/recently-watched" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200 flex items-center">
                <span className="mr-2 text-xs">→</span>Recently Watched
              </a>
              <a href="/action-anime" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200 flex items-center">
                <span className="mr-2 text-xs">→</span>Action Anime
              </a>
              <a href="/popular-anime" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200 flex items-center">
                <span className="mr-2 text-xs">→</span>Popular Anime
              </a>
            </div>
          </div>

          {/* Column 3 - Social Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-primary/90 to-purple-400 text-transparent bg-clip-text">Connect With Us</h3>
            <div className="flex items-center gap-5">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon-link group">
                <div className="bg-dark-700 p-3 rounded-full group-hover:bg-primary/20 transition-all duration-300 transform group-hover:scale-110">
                  <i className="fab fa-twitter text-lg text-muted-foreground group-hover:text-primary"></i>
                </div>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="social-icon-link group">
                <div className="bg-dark-700 p-3 rounded-full group-hover:bg-primary/20 transition-all duration-300 transform group-hover:scale-110">
                  <i className="fab fa-discord text-lg text-muted-foreground group-hover:text-primary"></i>
                </div>
              </a>
              <a href="https://t.me/nineanimeofchat" target="_blank" rel="noopener noreferrer" className="social-icon-link group">
                <div className="bg-dark-700 p-3 rounded-full group-hover:bg-primary/20 transition-all duration-300 transform group-hover:scale-110">
                  <i className="fab fa-telegram text-lg text-muted-foreground group-hover:text-primary"></i>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border/40 mt-4 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} 9Anime. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
