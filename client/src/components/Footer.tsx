
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-4 sm:py-6 bg-black/60 backdrop-blur-md border-t border-white/10">
      <div className="container mx-auto px-4">
        {/* Mobile optimized grid with better spacing */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
          {/* Logo and description - full width on mobile */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 mb-4 md:mb-0">
            <Link to="/" className="block mb-2 md:mb-4">
              <img src="/images/logo.webp" alt="9Anime" className="h-6 sm:h-8" />
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 mb-3">
              Watch your favorite anime online for free with English subtitles in HD quality.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors text-sm">
                <i className="fas fa-discord"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors text-sm">
                <i className="fas fa-twitter"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors text-sm">
                <i className="fas fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Quick links - symmetrical columns */}
          <div className="col-span-1">
            <h3 className="text-white font-medium mb-2 sm:mb-3 text-base sm:text-lg">Quick Links</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link to="/home" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/trending" className="footer-link">
                  Trending
                </Link>
              </li>
              <li>
                <Link to="/movies" className="footer-link">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/tv-series" className="footer-link">
                  TV Series
                </Link>
              </li>
            </ul>
          </div>

          {/* Genres - symmetrical with Quick Links */}
          <div className="col-span-1">
            <h3 className="text-white font-medium mb-2 sm:mb-3 text-base sm:text-lg">Genres</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link to="/genre/action" className="footer-link">
                  Action
                </Link>
              </li>
              <li>
                <Link to="/genre/adventure" className="footer-link">
                  Adventure
                </Link>
              </li>
              <li>
                <Link to="/genre/comedy" className="footer-link">
                  Comedy
                </Link>
              </li>
              <li>
                <Link to="/genre/drama" className="footer-link">
                  Drama
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal - move to bottom on mobile */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h3 className="text-white font-medium mb-2 sm:mb-3 text-base sm:text-lg">Legal</h3>
            <ul className="space-y-1 sm:space-y-2 grid grid-cols-2 md:grid-cols-1 gap-1">
              <li>
                <Link to="/terms" className="footer-link">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="footer-link">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/dmca" className="footer-link">
                  DMCA
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Optimized copyright footer */}
        <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-white/5 text-center">
          <p className="text-xs sm:text-sm text-slate-500">
            &copy; {new Date().getFullYear()} 9Anime. All rights reserved.
          </p>
          <p className="text-xs text-slate-600 mt-1 sm:mt-2 px-2 sm:px-0">
            Disclaimer: This site does not store any files on its server. All contents are provided by non-affiliated third parties.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
