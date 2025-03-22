import { useEffect, useState } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import AnimeCard from '../components/AnimeCard';
import GenrePill from '../components/GenrePill';
import { fetchAllAnime, fetchAnimeByGenre } from '../lib/api';
import { Anime } from '@shared/types';

const GenrePage = () => {
  const [, params] = useRoute('/genre/:genre');
  const genre = params?.genre || 'all';
  const isAllGenres = genre === 'all';
  const [location, setLocation] = useLocation();
  
  const [genres, setGenres] = useState<string[]>([]);
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>([]);
  
  // Fetch all anime to extract genres
  const { data: allAnime, isLoading: isLoadingAll } = useQuery({
    queryKey: ['/api/anime'],
    queryFn: fetchAllAnime
  });
  
  // Fetch anime by genre if a specific genre is selected
  const { data: genreAnime, isLoading: isLoadingGenre } = useQuery({
    queryKey: ['/api/search', 'genre', genre],
    queryFn: () => fetchAnimeByGenre(genre),
    enabled: !isAllGenres && !!genre
  });
  
  useEffect(() => {
    if (allAnime) {
      // Extract unique genres using a regular object as a map for compatibility
      const genreMap: Record<string, boolean> = {};
      allAnime.forEach(anime => {
        anime.genre.split(',').forEach(g => {
          const trimmed = g.trim();
          if (trimmed) genreMap[trimmed] = true;
        });
      });
      setGenres(Object.keys(genreMap));
      
      // Set filtered anime based on genre or all anime
      if (isAllGenres) {
        setFilteredAnime(allAnime);
      }
    }
  }, [allAnime, isAllGenres]);
  
  useEffect(() => {
    if (!isAllGenres && genreAnime) {
      setFilteredAnime(genreAnime);
    }
  }, [genreAnime, isAllGenres]);
  
  const isLoading = isLoadingAll || (isLoadingGenre && !isAllGenres);

  // Sort genres alphabetically
  const sortedGenres = [...genres].sort((a, b) => a.localeCompare(b));
  
  return (
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Header with genre title */}
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-white">
          {isAllGenres ? 'Browse by Genre' : `${decodeURIComponent(genre)} Anime`}
        </h1>
        <p className="text-slate-400 text-sm">
          {isAllGenres 
            ? 'Explore anime across different genres' 
            : `Showing all anime in the ${decodeURIComponent(genre)} genre`}
        </p>
      </div>

      {/* Genre filters */}
      <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex flex-nowrap gap-2 min-w-max">
          <GenrePill 
            genre="All Genres" 
            isActive={isAllGenres} 
            asButton 
            onClick={() => setLocation('/genre/all')}
          />

          {sortedGenres.map(g => (
            <GenrePill 
              key={g}
              genre={g} 
              isActive={decodeURIComponent(genre) === g}
              asButton
              onClick={() => setLocation(`/genre/${encodeURIComponent(g)}`)}
            />
          ))}
        </div>
      </div>

      {/* Anime grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6">
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden glass-effect transition-all duration-300 hover:scale-[1.05]">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="p-2">
                <Skeleton className="h-4 w-3/4 mb-2 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6">
          {filteredAnime.map(anime => (
            <div key={anime.id} className="transition-all duration-300 hover:scale-[1.05] hover:shadow-lg hover:shadow-primary/20">
              <AnimeCard anime={anime} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 glass-effect rounded-lg border border-white/10 p-6">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No Anime Found</h3>
          <p className="text-slate-400 mb-6">We couldn't find any anime in the {decodeURIComponent(genre)} genre.</p>
          <Link href="/genre/all">
            <button className="bg-primary hover:bg-primary/90 transition px-6 py-2.5 rounded-lg text-white font-medium hover:scale-[1.02]">
              Browse All Genres
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default GenrePage;