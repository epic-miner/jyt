import { Home, Search, LibraryBig, History, MessageCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = memo(({ href, icon, label, isActive }: NavItemProps) => {
  const className = useMemo(() => 
    cn(
      "flex flex-col items-center justify-center space-y-1",
      isActive ? "text-primary" : "text-slate-400 hover:text-slate-200"
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
      <motion.span
        className={className} 
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
      >
        <div className={cn(
          "flex items-center justify-center rounded-full w-10 h-10",
          isActive ? "bg-primary text-primary-foreground" : "text-slate-400"
        )}>
          {icon}
        </div>
        <span className="text-[10px] font-medium tracking-tight">
          {label}
        </span>
      </motion.span>
    </Link>
  );
});

NavItem.displayName = 'NavItem';

export const MobileNavBar = memo(() => {
  const [location] = useLocation();

  const navItems = useMemo(() => [
    { 
      href: "/", 
      icon: <Home className="w-5 h-5" />,
      label: "Home",
      isActive: location === "/"
    },
    {
      href: "/search",
      icon: <Search className="w-5 h-5" />,
      label: "Search",
      isActive: location.startsWith("/search")
    },
    {
      href: "/genre/all",
      icon: <LibraryBig className="w-5 h-5" />,
      label: "Genres",
      isActive: location.startsWith("/genre")
    },
    {
      href: "/recently-watched",
      icon: <History className="w-5 h-5" />,
      label: "History",
      isActive: location === "/recently-watched"
    },
    {
      href: "https://t.me/nineanimeofchat",
      icon: <MessageCircle className="w-5 h-5" />,
      label: "Contact",
      isActive: false
    }
  ], [location]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-slate-800 shadow-lg pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>
    </nav>
  );
});

MobileNavBar.displayName = 'MobileNavBar';