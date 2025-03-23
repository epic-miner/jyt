import { ReactNode, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScrollableRowProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  itemWidth?: number;
}

const ScrollableRow = ({
  children,
  className,
  title,
  subtitle,
  viewAllLink,
  itemWidth = 220,
}: ScrollableRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -itemWidth * 2,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: itemWidth * 2,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={cn('relative w-full', className)}>
      {/* Title and navigation */}
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent">
              {title}
            </h2>
            {subtitle && (
              <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-primary/20 hover:bg-primary/10 hover:border-primary/50"
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" 
              size="icon"
              className="rounded-full border-primary/20 hover:bg-primary/10 hover:border-primary/50"
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {viewAllLink && (
              <Button
                variant="link"
                className="ml-2 text-primary hover:text-primary/80"
                aria-label="View all"
              >
                View All
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Scrollable container */}
      <div className="relative group">
        <motion.div
          ref={scrollRef}
          className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide snap-x"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          whileTap={{ cursor: 'grabbing' }}
        >
          {children}
        </motion.div>

        {/* Scroll indicators/shadows */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default ScrollableRow;