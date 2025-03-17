import { Link, useLocation } from 'wouter';

const MobileNav = () => {
  const [location] = useLocation();
  
  return (
    <nav className="md:hidden bg-dark-800 border-t border-dark-700 py-2 sticky bottom-0 z-40">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center ${location === '/' ? 'text-white' : 'text-slate-300 hover:text-white'} pt-1`}>
            <i className="fas fa-home text-lg"></i>
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/search">
          <a className={`flex flex-col items-center ${location.startsWith('/search') ? 'text-white' : 'text-slate-300 hover:text-white'} pt-1`}>
            <i className="fas fa-search text-lg"></i>
            <span className="text-xs mt-1">Search</span>
          </a>
        </Link>
        <Link href="/genre/all">
          <a className={`flex flex-col items-center ${location.startsWith('/genre') ? 'text-white' : 'text-slate-300 hover:text-white'} pt-1`}>
            <i className="fas fa-bookmark text-lg"></i>
            <span className="text-xs mt-1">Genres</span>
          </a>
        </Link>
        <Link href="/recently-watched">
          <a className={`flex flex-col items-center ${location === '/recently-watched' ? 'text-white' : 'text-slate-300 hover:text-white'} pt-1`}>
            <i className="fas fa-history text-lg"></i>
            <span className="text-xs mt-1">Recent</span>
          </a>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNav;
