
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 bg-black/60 backdrop-blur-md border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="block mb-4">
              <img src="/images/logo.webp" alt="9Anime" className="h-8" />
            </Link>
            <p className="text-sm text-slate-400 mb-4">
              Watch your favorite anime online for free with English subtitles in HD quality.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <i className="fas fa-discord"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <i className="fas fa-twitter"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <i className="fas fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-span-1">
            <h3 className="text-white font-medium mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/home" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/trending" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Trending
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/tv-series" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  TV Series
                </Link>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div className="col-span-1">
            <h3 className="text-white font-medium mb-4 text-lg">Genres</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/genre/action" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Action
                </Link>
              </li>
              <li>
                <Link to="/genre/adventure" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Adventure
                </Link>
              </li>
              <li>
                <Link to="/genre/comedy" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Comedy
                </Link>
              </li>
              <li>
                <Link to="/genre/drama" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Drama
                </Link>
              </li>
              <li>
                <Link to="/genre/fantasy" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Fantasy
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-white font-medium mb-4 text-lg">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/dmca" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  DMCA
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} 9Anime. All rights reserved.
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Disclaimer: This site does not store any files on its server. All contents are provided by non-affiliated third parties.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
