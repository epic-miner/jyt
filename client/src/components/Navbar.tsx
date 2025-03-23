
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { IoMdTime } from 'react-icons/io';
import { BiCategoryAlt } from 'react-icons/bi';
import { MdOutlineContactSupport } from 'react-icons/md';
import { ThemeToggle } from './ThemeToggle';
import { SearchBox } from './SearchBox';
import { Logo } from './Logo';
import { RecentlyWatched } from './RecentlyWatched';
import { Contact } from './Contact';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-background shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <Logo />
            <SearchBox />
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="flex items-center text-foreground hover:text-primary">
              <FaHome className="mr-1" />
              <span>Home</span>
            </Link>
            <Link to="/genres" className="flex items-center text-foreground hover:text-primary">
              <BiCategoryAlt className="mr-1" />
              <span>Genres</span>
            </Link>
            <Link to="/recently-watched" className="flex items-center text-foreground hover:text-primary">
              <IoMdTime className="mr-1" />
              <span>Recently Watched</span>
            </Link>
            <Link to="/contact" className="flex items-center text-foreground hover:text-primary">
              <MdOutlineContactSupport className="mr-1" />
              <span>Contact</span>
            </Link>
            <ThemeToggle />
          </div>
          <div className="md:hidden flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden bg-background-secondary">
        <div className="flex justify-around py-2">
          <Link to="/" className="flex flex-col items-center text-foreground hover:text-primary">
            <FaHome />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/genres" className="flex flex-col items-center text-foreground hover:text-primary">
            <BiCategoryAlt />
            <span className="text-xs mt-1">Genres</span>
          </Link>
          <Link to="/recently-watched" className="flex flex-col items-center text-foreground hover:text-primary">
            <IoMdTime />
            <span className="text-xs mt-1">Recently</span>
          </Link>
          <Link to="/contact" className="flex flex-col items-center text-foreground hover:text-primary">
            <MdOutlineContactSupport />
            <span className="text-xs mt-1">Contact</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
