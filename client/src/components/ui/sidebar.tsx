import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  ClipboardList, 
  Settings, 
  HelpCircle 
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  closeSidebar: () => void;
}

export default function Sidebar({ open, closeSidebar }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`w-64 bg-white shadow-md fixed top-0 left-0 h-full pt-14 transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 lg:transform-none lg:static z-10`}
      >
        <div className="py-4 px-2">
          <div className="p-2 mb-4">
            <div className="text-neutral-700 text-sm font-medium uppercase tracking-wider px-2 mb-2">
              Main Menu
            </div>
            
            <NavItem 
              href="/" 
              label="Dashboard" 
              icon={<LayoutDashboard size={18} />} 
              active={isActive("/")} 
              onClick={closeSidebar}
            />
            
            <NavItem 
              href="/movies" 
              label="Movies" 
              icon={<Film size={18} />} 
              active={isActive("/movies")} 
              onClick={closeSidebar}
            />
            
            <NavItem 
              href="/users" 
              label="Users" 
              icon={<Users size={18} />} 
              active={isActive("/users")} 
              onClick={closeSidebar}
            />
            
            <NavItem 
              href="/rentals" 
              label="Rentals" 
              icon={<ClipboardList size={18} />} 
              active={isActive("/rentals")} 
              onClick={closeSidebar}
            />
          </div>
          
          <div className="p-2">
            <div className="text-neutral-700 text-sm font-medium uppercase tracking-wider px-2 mb-2">
              System
            </div>
            
            <NavItem 
              href="#" 
              label="Settings" 
              icon={<Settings size={18} />} 
              active={false} 
              onClick={closeSidebar}
            />
            
            <NavItem 
              href="#" 
              label="Help" 
              icon={<HelpCircle size={18} />} 
              active={false} 
              onClick={closeSidebar}
            />
          </div>
        </div>
      </div>
    </>
  );
}

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function NavItem({ href, label, icon, active, onClick }: NavItemProps) {
  return (
    <Link href={href}>
      <a 
        className={`flex items-center gap-3 px-2 py-2 rounded-md ${
          active 
            ? "bg-primary/10 text-primary border-l-4 border-primary" 
            : "text-neutral-700 hover:bg-neutral-100 border-l-4 border-transparent"
        } transition-colors`}
        onClick={onClick}
      >
        <span className="text-inherit">{icon}</span>
        <span>{label}</span>
      </a>
    </Link>
  );
}
