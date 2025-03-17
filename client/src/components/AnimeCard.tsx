import React from 'react';
import { Link } from 'react-router-dom';

interface AnimeCardProps {
  id: string;
  title: string;
  image: string;
  episodeNumber?: string;
  progress?: number;
}

export default function AnimeCard({ id, title, image, episodeNumber, progress }: AnimeCardProps) {
  return (
    <Link to={`/anime/${id}`} className="block">
      <div className="rounded-lg overflow-hidden bg-dark-800 transition hover:scale-105 cursor-pointer">
        <div className="relative h-40">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover"
          />
          {episodeNumber && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
              EP {episodeNumber}
            </div>
          )}
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <div className="p-2">
          <h3 className="font-medium text-sm line-clamp-2">{title}</h3>
          {episodeNumber && (
            <p className="text-xs text-slate-400">Episode {episodeNumber}</p>
          )}
        </div>
      </div>
    </Link>
  );
}