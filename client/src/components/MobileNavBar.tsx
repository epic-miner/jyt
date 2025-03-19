import { Home, Search, Library, History } from "lucide-react";
import { Link, useLocation } from "wouter";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

// Define a reusable nav item component for better performance
interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = memo(({ href, icon, label, isActive }: NavItemProps) => {
  // Memoize the class string to avoid recalculating on every render
  const className = useMemo(() => 
    cn(
      "flex flex-col items-center space-y-1 px-2 py-1 transition-colors duration-200",
      isActive ? "text-primary" : "text-muted-foreground hover:text-muted-foreground/80"
    ), 
    [isActive]
  );

  const handleClick = (e: React.MouseEvent) => {
    if (href.startsWith('https://')) {
      e.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Link href={href}>
      <a className={className} onClick={handleClick}>
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </a>
    </Link>
  );
});

NavItem.displayName = 'NavItem';

export const MobileNavBar = memo(() => {
  const [location] = useLocation();

  // Memoize active state calculations to prevent recalculations on each render
  const isHomeActive = useMemo(() => location === "/", [location]);
  const isSearchActive = useMemo(() => location === "/search" || location.startsWith("/search?"), [location]);
  const isGenresActive = useMemo(() => location === "/genre/all" || location.startsWith("/genre/"), [location]);
  const isHistoryActive = useMemo(() => location === "/recently-watched", [location]);

  // Memoize nav container classes
  const navClasses = useMemo(() => 
    cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", 
      "border-t border-border shadow-lg will-change-transform",
      // Add safe area inset padding for iPhone X and newer
      "pb-safe"
    ),
    []
  );

  return (
    <nav className={navClasses}>
      <div className="flex items-center justify-around py-2">
        <NavItem 
          href="/" 
          icon={<Home size={20} strokeWidth={isHomeActive ? 2.5 : 2} />} 
          label="Home" 
          isActive={isHomeActive} 
        />
        <NavItem 
          href="/search" 
          icon={<Search size={20} strokeWidth={isSearchActive ? 2.5 : 2} />} 
          label="Search" 
          isActive={isSearchActive} 
        />
        <NavItem 
          href="/genre/all" 
          icon={<Library size={20} strokeWidth={isGenresActive ? 2.5 : 2} />} 
          label="Genres" 
          isActive={isGenresActive} 
        />
        <NavItem 
          href="/recently-watched" 
          icon={<History size={20} strokeWidth={isHistoryActive ? 2.5 : 2} />} 
          label="History" 
          isActive={isHistoryActive} 
        />
        <NavItem 
          href="https://t.me/nineanimeofchat"
          icon={<MessageCircle size={20} strokeWidth={2} />}
          label="Contact"
          isActive={false}
        />
      </div>
    </nav>
  );
});

MobileNavBar.displayName = 'MobileNavBar';
