import { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import AnimeCard from '../components/AnimeCard';
import GenrePill from '../components/GenrePill';
import { fetchAllAnime, fetchAnimeByGenre } from '../lib/api';

const GenrePage = () => {
  const [, params] = useRoute('/genre/:genre');
  const genre = params?.genre || 'all';
  const isAllGenres = genre === 'all';
  
  const [genres, setGenres] = useState<string[]>([]);
  const [filteredAnime, setFilteredAnime] = useState<any[]>([]);
  
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
      // Extract unique genres
      const uniqueGenres = [...new Set(allAnime.map(anime => anime.genre.split(',').map(g => g.trim())).flat())];
      setGenres(uniqueGenres);
      
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
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">
        {isAllGenres ? 'All Genres' : `${decodeURIComponent(genre)} Anime`}
      </h1>
      
      {/* Genre filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/genre/all">
          <GenrePill genre="All" isActive={isAllGenres} />
        </Link>
        
        {genres.map(g => (
          <Link key={g} href={`/genre/${encodeURIComponent(g)}`}>
            <GenrePill 
              genre={g} 
              isActive={decodeURIComponent(genre) === g}
            />
          </Link>
        ))}
      </div>
      
      {/* Anime grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-2">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredAnime.map(anime => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-slate-400">No anime found in this genre.</p>
          <Link href="/genre/all">
            <button className="mt-4 bg-dark-800 hover:bg-dark-700 transition px-4 py-2 rounded-lg">
              View All Genres
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default GenrePage;
