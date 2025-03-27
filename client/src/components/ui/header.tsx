import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Menu, Search, X, Film } from "lucide-react";
import { useLocation, useNavigate } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [location, navigate] = useLocation();
  
  // Fetch data for search
  const { data: movies } = useQuery({
    queryKey: ['/api/movies'],
  });
  
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Filter results based on search term
  const filteredMovies = movies 
    ? movies.filter((movie: any) => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (movie.director && movie.director.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (movie.genre && movie.genre.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 3)
    : [];
    
  const filteredUsers = users
    ? users.filter((user: any) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 3)
    : [];

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.length > 0);
  };

  // Navigate to movie or user detail page
  const navigateToResult = (type: string, id: number) => {
    setShowResults(false);
    setSearchTerm("");
    navigate(`/${type}s`);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setShowResults(false);
  };

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
          <div className="relative hidden md:block search-container">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search movies or users..." 
                className="rounded-full py-1 pl-9 pr-8 text-neutral-800 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm && setShowResults(true)}
              />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  onClick={clearSearch}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showResults && (searchTerm.length > 0) && (
              <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg z-50 py-1 max-h-96 overflow-auto">
                {filteredMovies.length === 0 && filteredUsers.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-neutral-500">No results found</div>
                ) : (
                  <>
                    {filteredMovies.length > 0 && (
                      <>
                        <div className="px-4 py-1 text-xs font-medium text-neutral-500 uppercase">Movies</div>
                        {filteredMovies.map((movie: any) => (
                          <div 
                            key={`movie-${movie.id}`}
                            className="px-4 py-2 hover:bg-neutral-100 cursor-pointer text-neutral-800"
                            onClick={() => navigateToResult('movie', movie.id)}
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-10 bg-neutral-200 rounded flex-shrink-0 mr-3 flex items-center justify-center">
                                <Film size={14} className="text-neutral-500" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{movie.title}</div>
                                <div className="text-xs text-neutral-500">
                                  {movie.director && `${movie.director} • `}
                                  {movie.year}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    
                    {filteredUsers.length > 0 && (
                      <>
                        <div className="px-4 py-1 text-xs font-medium text-neutral-500 uppercase mt-1">Users</div>
                        {filteredUsers.map((user: any) => (
                          <div 
                            key={`user-${user.id}`}
                            className="px-4 py-2 hover:bg-neutral-100 cursor-pointer text-neutral-800"
                            onClick={() => navigateToResult('user', user.id)}
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 mr-3 flex items-center justify-center text-white text-sm font-medium">
                                {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{user.name}</div>
                                <div className="text-xs text-neutral-500">{user.email}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
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
