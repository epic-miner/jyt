import { Link, useLocation } from 'wouter';

const MobileNav = () => {
  const [location] = useLocation();
  
  return (
    <nav className="md:hidden bg-dark-900/95 backdrop-blur-md border-t border-dark-700/50 py-2 sticky bottom-0 z-40 shadow-lg">
      <div className="container mx-auto flex justify-around px-2">
        <NavItem 
          href="/" 
          icon="home" 
          label="Home" 
          isActive={location === '/'}
        />
        <NavItem 
          href="/search" 
          icon="search" 
          label="Search" 
          isActive={location.startsWith('/search')}
        />
        <NavItem 
          href="/genre/all" 
          icon="tags" 
          label="Genres" 
          isActive={location.startsWith('/genre')}
        />
        <NavItem 
          href="/recently-watched" 
          icon="history" 
          label="Recent" 
          isActive={location === '/recently-watched'}
        />
      </div>
    </nav>
  );
};

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
}

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center w-16">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${isActive ? 'bg-primary text-white shadow-md' : 'text-slate-400'}
        `}>
          <i className={`fas fa-${icon} ${isActive ? 'text-md' : 'text-sm'}`}></i>
        </div>
        <span className={`
          text-xs mt-1 font-medium
          ${isActive ? 'text-white' : 'text-slate-400'}
        `}>{label}</span>
      </div>
    </Link>
  );
};

export default MobileNav;
