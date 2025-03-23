import React, { useMemo, memo } from "react";
import { Home, Search, LibraryBig, History, MessageCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
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

  const iconContainerClass = useMemo(() =>
    cn(
      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
      isActive ? "bg-primary text-white shadow-lg scale-110" : "text-slate-400 hover:bg-black/30"
    ),
    [isActive]
  );


  return (
    <Link href={href}>
      <motion.span
        className={className}
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
      >
        <div className={iconContainerClass}>
          {React.cloneElement(icon, { className: "w-6 h-6" })} {/* Increased icon size */}
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
      icon: <Home />,
      label: "Home",
      isActive: location === "/"
    },
    {
      href: "/search",
      icon: <Search />,
      label: "Search",
      isActive: location.startsWith("/search")
    },
    {
      href: "/genre/all",
      icon: <LibraryBig />,
      label: "Genres",
      isActive: location.startsWith("/genre")
    },
    {
      href: "/recently-watched",
      icon: <History />,
      label: "History",
      isActive: location === "/recently-watched"
    },
    {
      href: "https://t.me/nineanimeofchat",
      icon: <MessageCircle />,
      label: "Contact",
      isActive: false
    }
  ], [location]);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-slate-800 shadow-lg pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>
    </nav>
  );
});

MobileNavBar.displayName = 'MobileNavBar';