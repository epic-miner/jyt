import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 bg-black/60 backdrop-blur-md border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Logo and description */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 mb-6 md:mb-0">
            <Link href="/" className="block mb-4">
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
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/home" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/trending" className="footer-link">
                  Trending
                </Link>
              </li>
              <li>
                <Link href="/movies" className="footer-link">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/tv-series" className="footer-link">
                  TV Series
                </Link>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div className="col-span-1">
            <h3 className="footer-heading">Genres</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/genre/action" className="footer-link">
                  Action
                </Link>
              </li>
              <li>
                <Link href="/genre/adventure" className="footer-link">
                  Adventure
                </Link>
              </li>
              <li>
                <Link href="/genre/comedy" className="footer-link">
                  Comedy
                </Link>
              </li>
              <li>
                <Link href="/genre/drama" className="footer-link">
                  Drama
                </Link>
              </li>
              <li>
                <Link href="/genre/fantasy" className="footer-link">
                  Fantasy
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="footer-heading">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="footer-link">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="footer-link">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="footer-link">
                  DMCA
                </Link>
              </li>
              <li>
                <Link href="/contact" className="footer-link">
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