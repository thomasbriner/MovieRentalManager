import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertMovieSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Create a form schema based on the insertMovieSchema
const formSchema = insertMovieSchema.extend({
  year: z.coerce.number().min(1900, "Year must be at least 1900").max(new Date().getFullYear() + 10, `Year must be at most ${new Date().getFullYear() + 10}`),
});

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieToEdit?: any;
  onSubmit: () => void;
}

export default function MovieModal({ 
  isOpen, 
  onClose, 
  movieToEdit,
  onSubmit
}: MovieModalProps) {
  const { toast } = useToast();
  const isEditing = !!movieToEdit;
  
  // Setup form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      director: "",
      year: new Date().getFullYear(),
      genre: "",
      description: "",
      available: true,
    },
  });

  // Reset form when modal opens/closes or editing a different movie
  useEffect(() => {
    if (isOpen) {
      if (movieToEdit) {
        form.reset({
          title: movieToEdit.title,
          director: movieToEdit.director || "",
          year: movieToEdit.year || new Date().getFullYear(),
          genre: movieToEdit.genre || "",
          description: movieToEdit.description || "",
          available: movieToEdit.available,
        });
      } else {
        form.reset({
          title: "",
          director: "",
          year: new Date().getFullYear(),
          genre: "",
          description: "",
          available: true,
        });
      }
    }
  }, [isOpen, movieToEdit, form]);

  // Create movie mutation
  const createMovieMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest('POST', '/api/movies', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Movie created successfully",
      });
      onSubmit();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create movie",
        variant: "destructive",
      });
    },
  });

  // Update movie mutation
  const updateMovieMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest('PATCH', `/api/movies/${movieToEdit.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Movie updated successfully",
      });
      onSubmit();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update movie",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditing) {
      updateMovieMutation.mutate(values);
    } else {
      createMovieMutation.mutate(values);
    }
  };

  const isPending = createMovieMutation.isPending || updateMovieMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {isEditing ? "Edit Movie" : "Add New Movie"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update movie information below."
              : "Enter movie details to add to the library."
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter movie title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Director */}
            <FormField
              control={form.control}
              name="director"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Director</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter director's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Year */}
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1900} 
                      max={new Date().getFullYear() + 10} 
                      placeholder="Enter release year" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Genre */}
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter genre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter movie description"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Available */}
            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Available for rent</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Uncheck if this movie is not available for rent
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isPending}
              >
                {isPending 
                  ? (isEditing ? "Updating..." : "Creating...") 
                  : (isEditing ? "Update Movie" : "Create Movie")
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
