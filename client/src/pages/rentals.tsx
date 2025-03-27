import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  CornerDownLeft,
  Trash2  
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format, isAfter, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge";
import RentalModal from "@/components/ui/rental-modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Rentals() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);

  // Fetch rentals
  const { data: rentals, isLoading } = useQuery({
    queryKey: ['/api/rentals'],
  });

  // Return rental mutation
  const returnRentalMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/rentals/${id}/return`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rentals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Rental returned successfully",
      });
      setIsReturnDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to return rental",
        variant: "destructive",
      });
      setIsReturnDialogOpen(false);
    },
  });

  // Delete rental mutation
  const deleteRentalMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/rentals/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rentals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Rental deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete rental",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  // Handle return rental
  const handleReturnRental = (rental: any) => {
    setSelectedRental(rental);
    setIsReturnDialogOpen(true);
  };

  // Handle delete rental
  const handleDeleteRental = (rental: any) => {
    setSelectedRental(rental);
    setIsDeleteDialogOpen(true);
  };

  // Confirm return rental
  const confirmReturnRental = () => {
    if (selectedRental) {
      returnRentalMutation.mutate(selectedRental.id);
    }
  };

  // Confirm delete rental
  const confirmDeleteRental = () => {
    if (selectedRental) {
      deleteRentalMutation.mutate(selectedRental.id);
    }
  };

  // Function to determine rental status
  const getRentalStatus = (rental: any) => {
    if (rental.returnedDate) {
      return { 
        label: "Returned", 
        color: "bg-blue-500/10 text-blue-500",
        value: "returned"
      };
    }
    
    const dueDate = new Date(rental.dueDate);
    const today = new Date();
    
    if (isAfter(today, dueDate)) {
      return { 
        label: "Overdue", 
        color: "bg-red-500/10 text-red-500",
        value: "overdue"
      };
    } else if (isToday(dueDate)) {
      return { 
        label: "Due Today", 
        color: "bg-amber-500/10 text-amber-500",
        value: "due-today"
      };
    } else {
      return { 
        label: "Active", 
        color: "bg-green-500/10 text-green-500",
        value: "active"
      };
    }
  };

  // Filter rentals based on search term and status filter
  const filteredRentals = rentals
    ? rentals.filter((rental: any) => {
        // Search filter
        const matchesSearch = rental.movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            rental.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            rental.user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Status filter
        const status = getRentalStatus(rental).value;
        const matchesStatus = statusFilter === "all" || status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  // Count rentals by status
  const countsByStatus = rentals
    ? rentals.reduce((counts: any, rental: any) => {
        const status = getRentalStatus(rental).value;
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      }, {})
    : {};

  const totalCount = rentals ? rentals.length : 0;
  const activeCount = (countsByStatus.active || 0) + (countsByStatus['due-today'] || 0);
  const overdueCount = countsByStatus.overdue || 0;
  const returnedCount = countsByStatus.returned || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-medium text-neutral-800">Rentals</h2>
          <p className="text-neutral-500 mt-1">
            Manage movie rentals
          </p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button 
            variant="default" 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>New Rental</span>
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search by movie title or user name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-36 sm:w-40">
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rentals</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="due-today">Due Today</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 items-center">
                <Badge variant="outline" className="whitespace-nowrap">
                  {totalCount} Total
                </Badge>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 whitespace-nowrap">
                  {activeCount} Active
                </Badge>
                <Badge variant="outline" className="bg-red-500/10 text-red-500 whitespace-nowrap hidden sm:inline-flex">
                  {overdueCount} Overdue
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rentals table */}
      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-base font-medium">All Rentals</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50">
                <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">Movie</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">User</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">Rented On</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">Due Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Skeleton loading state
                Array(5).fill(0).map((_, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-10 rounded" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredRentals.length > 0 ? (
                filteredRentals.map((rental: any) => {
                  const status = getRentalStatus(rental);
                  return (
                    <tr key={rental.id} className="border-b hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-10 rounded bg-neutral-200 flex-shrink-0" />
                          <span>{rental.movie.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{rental.user.name}</td>
                      <td className="px-6 py-4 text-sm">{format(new Date(rental.rentedDate), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4 text-sm">{format(new Date(rental.dueDate), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {!rental.returnedDate && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              title="Return"
                              onClick={() => handleReturnRental(rental)}
                            >
                              <CornerDownLeft className="h-4 w-4 text-neutral-500 hover:text-primary" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            title="Delete"
                            onClick={() => handleDeleteRental(rental)}
                          >
                            <Trash2 className="h-4 w-4 text-neutral-500 hover:text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-neutral-500">
                    {searchTerm || statusFilter !== "all" ? 
                      "No rentals match your search criteria" : 
                      "No rentals found"
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rental Modal */}
      <RentalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => setIsModalOpen(false)}
      />

      {/* Return Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isReturnDialogOpen}
        onClose={() => setIsReturnDialogOpen(false)}
        onConfirm={confirmReturnRental}
        title="Return Movie"
        description={`Are you sure you want to mark "${selectedRental?.movie?.title}" as returned by ${selectedRental?.user?.name}?`}
        confirmText="Return Movie"
        cancelText="Cancel"
        isPending={returnRentalMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteRental}
        title="Delete Rental"
        description={`Are you sure you want to delete the rental for "${selectedRental?.movie?.title}" by ${selectedRental?.user?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isPending={deleteRentalMutation.isPending}
      />
    </div>
  );
}
