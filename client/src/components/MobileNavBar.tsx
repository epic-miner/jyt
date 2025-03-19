import { Home, Search, Library, History, MessageCircle } from "lucide-react";
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
      "flex flex-col items-center space-y-1 px-2 py-1.5",
      isActive ? "text-primary" : "text-muted-foreground hover:text-primary/80"
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
      <motion.a 
        className={className} 
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={isActive ? {
            scale: [1, 1.2, 1],
            rotate: [0, -10, 10, 0],
          } : {}}
          transition={{ 
            duration: 0.4,
            ease: "easeInOut"
          }}
        >
          {icon}
        </motion.div>
        <motion.span 
          className="text-[10px] font-medium tracking-tight"
          animate={isActive ? { y: [-2, 2, -2] } : {}}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {label}
        </motion.span>
      </motion.a>
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
      icon: <Library className="w-5 h-5" />,
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border shadow-lg pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>
    </nav>
  );
});

MobileNavBar.displayName = 'MobileNavBar';