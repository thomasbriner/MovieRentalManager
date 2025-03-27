import { Input } from "@/components/ui/input";
import { Menu } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="bg-primary text-white shadow-md z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="mr-4 lg:hidden focus:outline-none"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-medium">MovieRent</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Input 
              type="text" 
              placeholder="Search movies or users..." 
              className="rounded-full py-1 px-4 text-neutral-800 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
          <div className="rounded-full w-8 h-8 bg-primary-light flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-4 h-4"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
