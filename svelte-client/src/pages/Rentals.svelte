<script lang="ts">
  import { onMount } from 'svelte';
  import RentalModal from '../components/RentalModal.svelte';
  import ConfirmDialog from '../components/ConfirmDialog.svelte';
  
  // Types
  type User = {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  
  type Movie = {
    id: number;
    title: string;
    director?: string;
    year?: number;
    genre?: string;
    available: boolean;
    description?: string;
  };
  
  type Rental = {
    id: number;
    userId: number;
    movieId: number;
    rentalDate: string;
    returnedDate?: string;
    user: User;
    movie: Movie;
  };
  
  // State
  let rentals: Rental[] = [];
  let isLoading = true;
  let modalOpen = false;
  let confirmDialogOpen = false;
  let rentalToEdit: Rental | null = null;
  let rentalToDelete: Rental | null = null;
  let isDeleting = false;
  let isReturning = false;
  let confirmReturnDialogOpen = false;
  let rentalToReturn: Rental | null = null;
  
  onMount(async () => {
    await fetchRentals();
  });
  
  async function fetchRentals() {
    try {
      isLoading = true;
      const response = await fetch('/api/rentals');
      const data = await response.json();
      rentals = data;
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      isLoading = false;
    }
  }
  
  function openAddModal() {
    rentalToEdit = null;
    modalOpen = true;
  }
  
  function closeModal() {
    modalOpen = false;
  }
  
  function openDeleteDialog(rental: Rental) {
    rentalToDelete = rental;
    confirmDialogOpen = true;
  }
  
  function closeDeleteDialog() {
    confirmDialogOpen = false;
  }
  
  async function handleDeleteRental() {
    if (!rentalToDelete) return;
    
    isDeleting = true;
    
    try {
      const response = await fetch(`/api/rentals/${rentalToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchRentals();
      }
    } catch (error) {
      console.error('Error deleting rental:', error);
    } finally {
      isDeleting = false;
      closeDeleteDialog();
    }
  }
  
  function openReturnDialog(rental: Rental) {
    rentalToReturn = rental;
    confirmReturnDialogOpen = true;
  }
  
  function closeReturnDialog() {
    confirmReturnDialogOpen = false;
  }
  
  async function handleReturnRental() {
    if (!rentalToReturn) return;
    
    isReturning = true;
    
    try {
      const response = await fetch(`/api/rentals/${rentalToReturn.id}/return`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ returnedDate: new Date().toISOString() })
      });
      
      if (response.ok) {
        await fetchRentals();
      }
    } catch (error) {
      console.error('Error returning rental:', error);
    } finally {
      isReturning = false;
      closeReturnDialog();
    }
  }
  
  async function handleRentalSubmit() {
    await fetchRentals();
    closeModal();
  }
  
  function formatDate(dateString: string | undefined) {
    if (!dateString) return 'Not returned';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Rentals</h1>
    <button 
      on:click={openAddModal}
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Create Rental
    </button>
  </div>
  
  {#if isLoading}
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b">
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movie</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each Array(5) as _}
            <tr class="border-b">
              {#each Array(6) as _}
                <td class="px-6 py-4">
                  <div class="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else if rentals.length === 0}
    <div class="text-center p-10 bg-white rounded-lg shadow">
      <p class="text-gray-500 mb-4">No rentals found</p>
      <button 
        on:click={openAddModal}
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Create your first rental
      </button>
    </div>
  {:else}
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b">
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movie</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each rentals as rental}
            <tr class="border-b hover:bg-gray-50">
              <td class="px-6 py-4 font-medium">{rental.movie.title}</td>
              <td class="px-6 py-4">{rental.user.name}</td>
              <td class="px-6 py-4">{formatDate(rental.rentalDate)}</td>
              <td class="px-6 py-4">{formatDate(rental.returnedDate)}</td>
              <td class="px-6 py-4">
                {#if rental.returnedDate}
                  <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Returned
                  </span>
                {:else}
                  <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Active
                  </span>
                {/if}
              </td>
              <td class="px-6 py-4">
                <div class="flex space-x-2">
                  {#if !rental.returnedDate}
                    <button 
                      on:click={() => openReturnDialog(rental)}
                      class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Return
                    </button>
                  {/if}
                  <button 
                    on:click={() => openDeleteDialog(rental)}
                    class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<RentalModal 
  isOpen={modalOpen}
  onClose={closeModal}
  onSubmit={handleRentalSubmit}
/>

<ConfirmDialog
  isOpen={confirmDialogOpen}
  onClose={closeDeleteDialog}
  onConfirm={handleDeleteRental}
  title="Delete Rental"
  description={`Are you sure you want to delete the rental for "${rentalToDelete?.movie?.title}" by ${rentalToDelete?.user?.name}? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  isPending={isDeleting}
/>

<ConfirmDialog
  isOpen={confirmReturnDialogOpen}
  onClose={closeReturnDialog}
  onConfirm={handleReturnRental}
  title="Return Movie"
  description={`Are you sure you want to mark "${rentalToReturn?.movie?.title}" as returned by ${rentalToReturn?.user?.name}?`}
  confirmText="Return"
  cancelText="Cancel"
  isPending={isReturning}
/>