import { Link, useLocation } from 'wouter';
import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
}

// Memoized NavItem component to prevent unnecessary re-renders
const NavItem = memo(({ href, icon, label, isActive }: NavItemProps) => {
  // Memoize class strings to prevent recalculation on every render
  const iconContainerClass = useMemo(() => 
    cn(
      "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200",
      isActive ? "bg-primary text-white shadow-md" : "text-slate-400"
    ), 
    [isActive]
  );

  const iconClass = useMemo(() => 
    cn(
      "fas", 
      `fa-${icon}`,
      isActive ? "text-md" : "text-sm"
    ), 
    [icon, isActive]
  );

  const labelClass = useMemo(() => 
    cn(
      "text-xs mt-1 font-medium transition-colors duration-200",
      isActive ? "text-white" : "text-slate-400"
    ), 
    [isActive]
  );

  return (
    <Link href={href}>
      <div className="flex flex-col items-center w-16">
        <div className={iconContainerClass}>
          <i className={iconClass}></i>
        </div>
        <span className={labelClass}>{label}</span>
      </div>
    </Link>
  );
});

NavItem.displayName = 'NavItem';

// Main component with memoization
const MobileNav = memo(() => {
  const [location] = useLocation();

  // Memoize active state checks
  const isHomeActive = useMemo(() => location === '/', [location]);
  const isSearchActive = useMemo(() => location.startsWith('/search'), [location]);
  const isGenresActive = useMemo(() => location.startsWith('/genre'), [location]);
  const isRecentActive = useMemo(() => location === '/recently-watched', [location]);

  // Memoize container class to avoid string concatenation on every render
  const navClass = useMemo(() => 
    cn(
      "md:hidden bg-dark-900/95 backdrop-blur-md border-t border-dark-700/50",
      "py-2 sticky bottom-0 z-40 shadow-lg will-change-transform"
    ),
    []
  );
  
  return (
    <nav className={navClass}>
      <div className="container mx-auto flex justify-around px-2">
        <NavItem 
          href="/" 
          icon="home" 
          label="Home" 
          isActive={isHomeActive}
        />
        <NavItem 
          href="/search" 
          icon="search" 
          label="Search" 
          isActive={isSearchActive}
        />
        <NavItem 
          href="/genre/all" 
          icon="tags" 
          label="Genres" 
          isActive={isGenresActive}
        />
        <NavItem 
          href="/recently-watched" 
          icon="history" 
          label="Recent" 
          isActive={isRecentActive}
        />
      </div>
    </nav>
  );
});

MobileNav.displayName = 'MobileNav';

export default MobileNav;
