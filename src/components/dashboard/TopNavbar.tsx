import { Bell, ChevronDown, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import api from "@/api/axios";

interface TopNavbarProps {
  onMenuClick?: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userData, setUserData] = useState({
    name: "Admin",
    role: "Administrator",
    avatarUrl: ""
  });

  useEffect(() => {
    fetchProfile();

    // Scroll handler
    const handleScroll = () => {
      const scrollContainer = document.querySelector('[class*="overflow-y-auto"]');
      if (scrollContainer) {
        setIsScrolled(scrollContainer.scrollTop > 20);
      } else {
        setIsScrolled(window.scrollY > 20);
      }
    };

    const scrollContainer = document.querySelector('[class*="overflow-y-auto"]');
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/admin/auth/profile');
      const data = response.data.data;
      setUserData({
        name: data.name || "Admin",
        role: data.role || "Administrator",
        avatarUrl: data.avatarUrl || ""
      });
    } catch (error) {
      console.error("Failed to fetch header profile:", error);
    }
  };

  // Helper for initials
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-card border-b border-border flex items-center justify-between px-3 sm:px-4 md:px-6 transition-all duration-300 ${isScrolled ? "h-14 shadow-sm" : "h-16 md:h-20"
        }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Greeting */}
        <div className="hidden sm:block min-w-0">
          <h1 className={`font-semibold text-foreground truncate transition-all duration-300 ${isScrolled ? "text-lg" : "text-[22px]"
            }`}>
            Welcome back, {userData.name.split(" ")[0]}
          </h1>
          <p className={`text-muted-foreground truncate transition-all duration-300 ${isScrolled ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto text-sm mt-0.5"
            }`}>
            Business performance overview
          </p>
        </div>
        <div className="sm:hidden">
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">


        {/* Notifications */}
        <Link to="/notifications" className="relative p-2 sm:p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors shrink-0">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full" />
        </Link>

        {/* Profile */}
        <Link to="/profile" className="flex items-center gap-1 sm:gap-2 md:gap-3 pl-1 sm:pl-2 md:pl-3 pr-1 sm:pr-2 py-1 sm:py-1.5 rounded-lg hover:bg-muted transition-colors shrink-0">
          <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
            <AvatarImage src={userData.avatarUrl} className="object-cover" />
            <AvatarFallback className="text-xs sm:text-sm bg-primary/10 text-primary">
              {getInitials(userData.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-foreground">{userData.name}</p>
            <p className="text-xs text-muted-foreground">{userData.role}</p>
          </div>
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground hidden md:block" />
        </Link>
      </div>
    </header>
  );
}
