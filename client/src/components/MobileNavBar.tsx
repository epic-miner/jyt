import { Home, Search, Library, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export const MobileNavBar = () => {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-4">
          <Link href="/">
            <a className="relative flex flex-col items-center py-2.5 hover:text-primary transition-colors">
              <div className={cn(
                "flex flex-col items-center",
                location === "/" && "text-primary"
              )}>
                <Home className="w-5 h-5 mb-1" strokeWidth={1.5} />
                <span className="text-xs">Home</span>
              </div>
            </a>
          </Link>
          <Link href="/search">
            <a className="relative flex flex-col items-center py-2.5 hover:text-primary transition-colors">
              <div className={cn(
                "flex flex-col items-center",
                location === "/search" && "text-primary"
              )}>
                <Search className="w-5 h-5 mb-1" strokeWidth={1.5} />
                <span className="text-xs">Search</span>
              </div>
            </a>
          </Link>
          <Link href="/genres">
            <a className="relative flex flex-col items-center py-2.5 hover:text-primary transition-colors">
              <div className={cn(
                "flex flex-col items-center",
                location === "/genres" && "text-primary"
              )}>
                <Library className="w-5 h-5 mb-1" strokeWidth={1.5} />
                <span className="text-xs">Genres</span>
              </div>
            </a>
          </Link>
          <Link href="/profile">
            <a className="relative flex flex-col items-center py-2.5 hover:text-primary transition-colors">
              <div className={cn(
                "flex flex-col items-center",
                location === "/profile" && "text-primary"
              )}>
                <User className="w-5 h-5 mb-1" strokeWidth={1.5} />
                <span className="text-xs">Profile</span>
              </div>
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
};