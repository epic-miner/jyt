import { Link, useLocation } from 'wouter';

const MobileNav = () => {
  const [location] = useLocation();
  
  return (
    <nav className="md:hidden bg-dark-800 border-t border-dark-700 py-2 sticky bottom-0 z-40">
      <div className="flex justify-around">
        <Link href="/">
          <div className={`flex flex-col items-center ${location === '/' ? 'text-white' : 'text-slate-300 hover:text-white'} pt-1`}>
            <i className="fas fa-home text-lg"></i>
            <span className="text-xs mt-1">Home</span>
          </div>
        </Link>
        <Link href="/search">
          <div className={`flex flex-col items-center ${location.startsWith('/search') ? 'text-white' : 'text-slate-300 hover:text-white'} pt-1`}>
            <i className="fas fa-search text-lg"></i>
            <span className="text-xs mt-1">Search</span>
          </div>
        </Link>
        <Link href="/genre/all">
          <div className={`flex flex-col items-center ${location.startsWith('/genre') ? 'text-white' : 'text-slate-300 hover:text-white'} pt-1`}>
            <i className="fas fa-bookmark text-lg"></i>
            <span className="text-xs mt-1">Genres</span>
          </div>
        </Link>
        <Link href="/recently-watched">
          <div className={`flex flex-col items-center ${location === '/recently-watched' ? 'text-white' : 'text-slate-300 hover:text-white'} pt-1`}>
            <i className="fas fa-history text-lg"></i>
            <span className="text-xs mt-1">Recent</span>
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNav;
