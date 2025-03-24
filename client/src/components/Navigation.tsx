import React from 'react';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-xl font-bold">AnimeStream</Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/test-player" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">Test Player</Link>
              <Link to="/home" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">Home</Link>
              <Link to="/search" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">Search</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;