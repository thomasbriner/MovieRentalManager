import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import MovieModal from "@/components/ui/movie-modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import MovieCard from "@/components/ui/movie-card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Movies() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<any>(null);
  const [movieToDelete, setMovieToDelete] = useState<any>(null);

  // Fetch movies
  const { data: movies, isLoading } = useQuery({
    queryKey: ['/api/movies'],
  });

  // Delete movie mutation
  const deleteMovieMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/movies/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Movie deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Cannot delete movie with active rentals",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  // Handle opening the edit modal
  const handleEditMovie = (movie: any) => {
    setMovieToEdit(movie);
    setIsModalOpen(true);
  };

  // Handle opening the create modal
  const handleAddMovie = () => {
    setMovieToEdit(null);
    setIsModalOpen(true);
  };

  // Handle opening the delete confirmation
  const handleDeleteMovie = (movie: any) => {
    setMovieToDelete(movie);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirming deletion
  const confirmDeleteMovie = () => {
    if (movieToDelete) {
      deleteMovieMutation.mutate(movieToDelete.id);
    }
  };

  // Filter movies based on search term and availability filter
  const filteredMovies = movies
    ? movies.filter((movie: any) => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (movie.director && movie.director.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (movie.genre && movie.genre.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesSearch && (!availableOnly || movie.available);
      })
    : [];

  // Get count of available movies
  const availableCount = movies ? movies.filter((movie: any) => movie.available).length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-medium text-neutral-800">Movies</h2>
          <p className="text-neutral-500 mt-1">
            Manage your movie library
          </p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button 
            variant="default" 
            onClick={handleAddMovie}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Movie</span>
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search by title, director or genre..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="available-only" 
                  checked={availableOnly}
                  onCheckedChange={(checked) => setAvailableOnly(checked as boolean)}
                />
                <Label htmlFor="available-only">Available only</Label>
              </div>

              <Badge variant="outline" className="ml-2">
                {movies ? movies.length : 0} Total / {availableCount} Available
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movies grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Skeleton loading state
          Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="p-4 flex items-start">
                <Skeleton className="w-16 h-20 rounded" />
                <div className="ml-4 flex-grow">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-1" />
                </div>
              </div>
              <div className="p-3 border-t bg-neutral-50 flex justify-end space-x-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </Card>
          ))
        ) : filteredMovies.length > 0 ? (
          filteredMovies.map((movie: any) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onEdit={handleEditMovie} 
              onDelete={handleDeleteMovie}
            />
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-neutral-500">
            {searchTerm || availableOnly ? 
              "No movies match your search criteria" : 
              "No movies in the library yet"
            }
          </div>
        )}
      </div>

      {/* Movie Modal */}
      <MovieModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        movieToEdit={movieToEdit}
        onSubmit={() => setIsModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteMovie}
        title="Delete Movie"
        description={`Are you sure you want to delete "${movieToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isPending={deleteMovieMutation.isPending}
      />
    </div>
  );
}
