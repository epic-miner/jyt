import { Link, useLocation } from 'wouter';
import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const Footer = () => {
  const [location] = useLocation();

  return (
    <footer className="footer-container bg-background/60 backdrop-blur-lg border-t border-border/40 p-4 w-full mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Column 1 - Logo and Description */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center mb-2">
              <img src="/images/logo.webp" alt="9Anime Logo" className="h-8 w-8 mr-2" />
              <h3 className="text-xl font-bold">
                <span className="text-primary">9</span>
                <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">Anime</span>
              </h3>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Your ultimate destination for anime streaming. Watch your favorite anime shows and movies in HD quality.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <nav className="flex flex-col items-center md:items-start space-y-2">
              <Link href="/">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</span>
              </Link>
              <Link href="/recently-watched">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors">Recently Watched</span>
              </Link>
              <Link href="/genre/action">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors">Action Anime</span>
              </Link>
              <Link href="/category/popular">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors">Popular Anime</span>
              </Link>
            </nav>
          </div>

          {/* Column 3 - Social Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-3">Connect With Us</h3>
            <div className="flex space-x-4 items-center">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-twitter text-lg"></i>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-discord text-lg"></i>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-github text-lg"></i>
              </a>
              <a href="https://t.me/nineanimeofchat" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-telegram text-lg"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border/40 mt-4 pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} 9Anime. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;