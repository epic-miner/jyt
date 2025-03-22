import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import AnimeCard from '../components/AnimeCard';
import { fetchAllAnime } from '../lib/api';
import { Anime } from '@shared/types';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';

const CategoryPage = () => {
  const [, params] = useRoute('/category/:type');
  const categoryType = params?.type || '';
  
  // Fetch all anime
  const { data: allAnime, isLoading } = useQuery({
    queryKey: ['/api/anime'],
    queryFn: fetchAllAnime
  });
  
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>([]);
  const [categoryTitle, setCategoryTitle] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  
  useEffect(() => {
    if (allAnime) {
      let filtered: Anime[] = [];
      let title = '';
      let description = '';
      
      switch (categoryType) {
        case 'trending':
          // For demo, assuming we sort by ID for trending (newest)
          filtered = [...allAnime].sort((a, b) => b.id - a.id);
          title = 'Trending Anime';
          description = 'The hottest and most popular anime right now';
          break;
          
        case 'popular':
          // For demo, sorting based on episode count (if available) for popularity
          filtered = [...allAnime].sort((a, b) => {
            const aEpisodes = a.episode_count || 0;
            const bEpisodes = b.episode_count || 0;
            return bEpisodes - aEpisodes;
          });
          title = 'Popular Anime';
          description = 'The most watched anime series of all time';
          break;
          
        case 'recent':
          // For demo, assuming we sort by ID for recent additions
          filtered = [...allAnime].sort((a, b) => b.id - a.id).slice(0, 12);
          title = 'Recently Added';
          description = 'Fresh new anime added to our collection';
          break;
          
        default:
          filtered = allAnime;
          title = 'All Anime';
          description = 'Browse our complete anime collection';
          break;
      }
      
      setFilteredAnime(filtered);
      setCategoryTitle(title);
      setCategoryDescription(description);
    }
  }, [allAnime, categoryType]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  
  return (
    <>
      <SEO title={categoryTitle} description={categoryDescription} />
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-1">{categoryTitle}</h1>
          <p className="text-slate-400 text-sm">{categoryDescription}</p>
        </motion.div>
        
        {/* Anime Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6">
            {Array(18).fill(0).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden glass-effect transition-all duration-300 hover:scale-[1.05]">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="p-2">
                  <Skeleton className="h-4 w-3/4 mb-2 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredAnime.map((anime) => (
              <motion.div 
                key={anime.id} 
                className="transition-all duration-300 hover:scale-[1.05] hover:shadow-lg hover:shadow-primary/20"
                variants={itemVariants}
              >
                <AnimeCard 
                  anime={anime} 
                  episodeCount={anime.episode_count}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Empty state */}
        {!isLoading && filteredAnime.length === 0 && (
          <div className="text-center py-10 glass-effect rounded-lg border border-white/10 p-6">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Anime Found</h3>
            <p className="text-slate-400 mb-6">We couldn't find any anime in this category.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryPage;