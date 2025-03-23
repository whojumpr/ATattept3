import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  ClipboardList, 
  Home,
  LayoutList,
  LogOut,
  Menu,
  Settings,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, icon, label, isActive, onClick }: NavItemProps) => {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors",
        isActive && "bg-gray-700"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      {/* Mobile header bar */}
      <div className="md:hidden bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-blue-500" />
          <h1 className="text-xl font-bold">TradeTrak</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="text-white"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Sidebar for both mobile and desktop */}
      <div
        className={cn(
          "bg-gray-800 text-white w-full md:w-64 flex-shrink-0 md:h-screen overflow-y-auto transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "fixed inset-0 z-50" : "hidden md:block"
        )}
      >
        <div className="p-4 flex items-center justify-between md:justify-center">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            <h1 className="text-xl font-bold">TradeTrak</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="md:hidden text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="px-4 py-2">
          <div className="flex flex-col space-y-1">
            <NavItem
              href="/dashboard"
              icon={<Home className="h-5 w-5" />}
              label="Dashboard"
              isActive={location === "/dashboard" || location === "/"}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/trades"
              icon={<LayoutList className="h-5 w-5" />}
              label="Trades"
              isActive={location === "/trades"}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/journal"
              icon={<ClipboardList className="h-5 w-5" />}
              label="Journal"
              isActive={location === "/journal"}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/analytics"
              icon={<BarChart3 className="h-5 w-5" />}
              label="Analytics"
              isActive={location === "/analytics"}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/calendar"
              icon={<Calendar className="h-5 w-5" />}
              label="Calendar"
              isActive={location === "/calendar"}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/settings"
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              isActive={location === "/settings"}
              onClick={closeMobileMenu}
            />
          </div>
        </div>
        
        <div className="mt-auto p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-gray-600 text-white">
                {getInitials(user?.name || user?.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user?.name || user?.username}</div>
              <div className="text-sm text-gray-400">Trader</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="ml-auto text-gray-400 hover:text-white hover:bg-gray-700"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
