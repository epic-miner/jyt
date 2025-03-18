import { Home, Search, Library, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export const MobileNavBar = () => {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border z-50">
      <div className="flex items-center justify-around py-3">
        <Link href="/">
          <a className={`flex flex-col items-center space-y-1 ${location === "/" ? "text-primary" : "text-muted-foreground"}`}>
            <Home size={20} />
            <span className="text-xs">Home</span>
          </a>
        </Link>
        <Link href="/search">
          <a className={`flex flex-col items-center space-y-1 ${location === "/search" ? "text-primary" : "text-muted-foreground"}`}>
            <Search size={20} />
            <span className="text-xs">Search</span>
          </a>
        </Link>
        <Link href="/genres">
          <a className={`flex flex-col items-center space-y-1 ${location === "/genres" ? "text-primary" : "text-muted-foreground"}`}>
            <Library size={20} />
            <span className="text-xs">Genres</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex flex-col items-center space-y-1 ${location === "/profile" ? "text-primary" : "text-muted-foreground"}`}>
            <User size={20} />
            <span className="text-xs">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
};
