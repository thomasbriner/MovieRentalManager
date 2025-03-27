import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertRentalSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Create a form schema based on the insertRentalSchema
const formSchema = z.object({
  userId: z.coerce.number().min(1, "Please select a user"),
  movieId: z.coerce.number().min(1, "Please select a movie"),
  rentedDate: z.date({
    required_error: "Rental date is required",
  }),
  dueDate: z.date({
    required_error: "Return date is required",
  }),
  notes: z.string().optional(),
}).refine(data => {
  // Ensure dueDate is after rentedDate
  return data.dueDate >= data.rentedDate;
}, {
  message: "Return date must be after or equal to the rental date",
  path: ["dueDate"]
});

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentalToEdit?: any;
  onSubmit: () => void;
}

export default function RentalModal({ 
  isOpen, 
  onClose, 
  rentalToEdit,
  onSubmit
}: RentalModalProps) {
  const { toast } = useToast();
  
  // Get available movies and users
  const { data: movies, isLoading: loadingMovies } = useQuery({
    queryKey: ['/api/movies'],
    select: (data) => data.filter((movie: any) => movie.available),
  });
  
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });

  // Setup form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: undefined,
      movieId: undefined,
      rentedDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      notes: "",
    },
  });

  // Reset form when modal opens/closes or editing a different rental
  useEffect(() => {
    if (isOpen) {
      if (rentalToEdit) {
        form.reset({
          userId: rentalToEdit.userId,
          movieId: rentalToEdit.movieId,
          rentedDate: new Date(rentalToEdit.rentedDate),
          dueDate: new Date(rentalToEdit.dueDate),
          notes: rentalToEdit.notes || "",
        });
      } else {
        form.reset({
          userId: undefined,
          movieId: undefined,
          rentedDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
          notes: "",
        });
      }
    }
  }, [isOpen, rentalToEdit, form]);

  // Create rental mutation
  const createRentalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest('POST', '/api/rentals', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rentals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Rental created successfully",
      });
      onSubmit();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create rental",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    createRentalMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Add New Rental</DialogTitle>
          <DialogDescription>
            Create a new rental by selecting a user, movie, and rental dates.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* User selection */}
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select
                    disabled={loadingUsers}
                    onValueChange={field.onChange}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Movie selection */}
            <FormField
              control={form.control}
              name="movieId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Movie</FormLabel>
                  <Select
                    disabled={loadingMovies}
                    onValueChange={field.onChange}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a movie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {movies?.map((movie: any) => (
                        <SelectItem key={movie.id} value={movie.id.toString()}>
                          {movie.title} ({movie.year})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Rental date */}
            <FormField
              control={form.control}
              name="rentedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Rental Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Due date */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Return Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date < form.getValues("rentedDate")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this rental..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={createRentalMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createRentalMutation.isPending}
              >
                {createRentalMutation.isPending ? "Creating..." : "Create Rental"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
