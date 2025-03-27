import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import UserModal from "@/components/ui/user-modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import UserCard from "@/components/ui/user-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Users() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/users/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Cannot delete user with active rentals",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  // Handle opening the edit modal
  const handleEditUser = (user: any) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  // Handle opening the create modal
  const handleAddUser = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  // Handle opening the delete confirmation
  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirming deletion
  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  // Filter users based on search term
  const filteredUsers = users
    ? users.filter((user: any) => {
        return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (user.phone && user.phone.includes(searchTerm));
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-medium text-neutral-800">Users</h2>
          <p className="text-neutral-500 mt-1">
            Manage user accounts
          </p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button 
            variant="default" 
            onClick={handleAddUser}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email or phone..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Badge variant="outline">
              {users ? users.length : 0} Registered Users
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Skeleton loading state
          Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="p-4 flex items-start">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="ml-4 flex-grow">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div className="p-3 border-t bg-neutral-50 flex justify-end space-x-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </Card>
          ))
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user: any) => (
            <UserCard 
              key={user.id} 
              user={user} 
              onEdit={handleEditUser} 
              onDelete={handleDeleteUser}
            />
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-neutral-500">
            {searchTerm ? 
              "No users match your search criteria" : 
              "No users registered yet"
            }
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
        onSubmit={() => setIsModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        description={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isPending={deleteUserMutation.isPending}
      />
    </div>
  );
}
