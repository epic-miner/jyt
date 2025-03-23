import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import AnimeLazyImage from './AnimeLazyImage';
import TiltCard from './TiltCard';

interface ScrollableCardProps {
  id: string | number;
  title: string;
  imageUrl: string;
  subtitle?: string;
  className?: string;
  linkTo: string;
  index?: number;
}

const ScrollableCard = ({
  id,
  title,
  imageUrl,
  subtitle,
  className,
  linkTo,
  index = 0,
}: ScrollableCardProps) => {
  return (
    <motion.div
      className={cn(
        'flex-shrink-0 snap-start w-[180px] md:w-[220px]',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
    >
      <Link href={linkTo}>
        <a className="block w-full h-full cursor-pointer">
          <TiltCard 
            className="overflow-hidden rounded-xl ring-1 ring-primary/10 shadow-lg bg-black/30 backdrop-blur-sm"
            options={{ max: 10, scale: 1.02, speed: 500 }}
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-xl">
              <AnimeLazyImage
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                effect="blur"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            
            <div className="p-3">
              <h3 className="text-sm font-medium line-clamp-1 text-white/90">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {subtitle}
                </p>
              )}
            </div>
          </TiltCard>
        </a>
      </Link>
    </motion.div>
  );
};

export default ScrollableCard;