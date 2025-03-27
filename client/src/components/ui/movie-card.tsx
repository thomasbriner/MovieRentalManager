import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Film } from "lucide-react";

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    director?: string;
    year?: number;
    genre?: string;
    available: boolean;
    description?: string;
  };
  onEdit: (movie: any) => void;
  onDelete: (movie: any) => void;
}

export default function MovieCard({ movie, onEdit, onDelete }: MovieCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-start">
          <div className="w-16 h-20 bg-neutral-200 rounded flex-shrink-0 flex items-center justify-center">
            <Film className="h-8 w-8 text-neutral-400" />
          </div>
          
          <div className="ml-4 flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg line-clamp-1">{movie.title}</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {movie.director && `${movie.director} • `}
                  {movie.year && `${movie.year} • `}
                  {movie.genre}
                </p>
              </div>
              
              <Badge variant={movie.available ? "success" : "destructive"} className="ml-2">
                {movie.available ? "Available" : "Rented"}
              </Badge>
            </div>
            
            {movie.description && (
              <p className="text-sm mt-2 text-neutral-600 line-clamp-2">
                {movie.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-auto p-3 border-t bg-neutral-50 flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(movie)}
            className="text-neutral-700"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(movie)}
            className="text-red-600 border-red-200 hover:bg-red-50"
            disabled={!movie.available}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
