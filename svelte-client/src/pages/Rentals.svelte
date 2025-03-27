<script lang="ts">
  import { onMount } from 'svelte';
  import Layout from '../components/Layout.svelte';
  
  let isLoading = true;
  let rentals = [];
  let users = [];
  let movies = [];
  let isModalOpen = false;
  let rentalToEdit = null;
  let isConfirmDialogOpen = false;
  let rentalToDelete = null;
  let isReturnDialogOpen = false;
  let rentalToReturn = null;
  
  // Form fields
  let userId = '';
  let movieId = '';
  let rentedDate = new Date().toISOString().split('T')[0];
  let dueDate = '';
  let notes = '';
  
  onMount(() => {
    fetchData();
    
    // Set default due date to 7 days from today
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 7);
    dueDate = defaultDueDate.toISOString().split('T')[0];
  });
  
  async function fetchData() {
    try {
      const [rentalsRes, usersRes, moviesRes] = await Promise.all([
        fetch('/api/rentals'),
        fetch('/api/users'),
        fetch('/api/movies')
      ]);
      
      rentals = await rentalsRes.json();
      users = await usersRes.json();
      movies = await moviesRes.json();
      
      isLoading = false;
    } catch (error) {
      console.error('Error fetching data:', error);
      isLoading = false;
    }
  }
  
  function getAvailableMovies() {
    return movies.filter(movie => movie.available || (rentalToEdit && movie.id === rentalToEdit.movieId));
  }
  
  function openRentalModal(rental = null) {
    if (rental) {
      rentalToEdit = rental;
      userId = rental.userId.toString();
      movieId = rental.movieId.toString();
      rentedDate = new Date(rental.rentedDate).toISOString().split('T')[0];
      dueDate = new Date(rental.dueDate).toISOString().split('T')[0];
      notes = rental.notes || '';
    } else {
      rentalToEdit = null;
      userId = users.length > 0 ? users[0].id.toString() : '';
      movieId = getAvailableMovies().length > 0 ? getAvailableMovies()[0].id.toString() : '';
      rentedDate = new Date().toISOString().split('T')[0];
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
      dueDate = defaultDueDate.toISOString().split('T')[0];
      notes = '';
    }
    
    isModalOpen = true;
  }
  
  function closeRentalModal() {
    isModalOpen = false;
  }
  
  async function handleSubmit() {
    try {
      if (!userId || !movieId || !rentedDate || !dueDate) {
        alert('Please fill in all required fields');
        return;
      }
      
      const rentalData = {
        userId: parseInt(userId),
        movieId: parseInt(movieId),
        rentedDate,
        dueDate,
        notes: notes || undefined
      };
      
      const url = rentalToEdit 
        ? `/api/rentals/${rentalToEdit.id}` 
        : '/api/rentals';
      
      const method = rentalToEdit ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rentalData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      closeRentalModal();
      fetchData();
    } catch (error) {
      console.error('Error saving rental:', error);
    }
  }
  
  function confirmDelete(rental) {
    rentalToDelete = rental;
    isConfirmDialogOpen = true;
  }
  
  function closeConfirmDialog() {
    isConfirmDialogOpen = false;
    rentalToDelete = null;
  }
  
  async function deleteRental() {
    if (!rentalToDelete) return;
    
    try {
      const response = await fetch(`/api/rentals/${rentalToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      closeConfirmDialog();
      fetchData();
    } catch (error) {
      console.error('Error deleting rental:', error);
    }
  }
  
  function confirmReturn(rental) {
    rentalToReturn = rental;
    isReturnDialogOpen = true;
  }
  
  function closeReturnDialog() {
    isReturnDialogOpen = false;
    rentalToReturn = null;
  }
  
  async function returnRental() {
    if (!rentalToReturn) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`/api/rentals/${rentalToReturn.id}/return`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ returnedDate: today })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      closeReturnDialog();
      fetchData();
    } catch (error) {
      console.error('Error returning rental:', error);
    }
  }
  
  function getUserName(userId) {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  }
  
  function getMovieTitle(movieId) {
    const movie = movies.find(m => m.id === movieId);
    return movie ? movie.title : 'Unknown';
  }
  
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString();
  }
  
  function isDueSoon(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  }
  
  function isOverdue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  }
</script>

<Layout>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-bold tracking-tight">Rentals</h2>
      <button
        on:click={() => openRentalModal()}
        class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        New Rental
      </button>
    </div>
    
    <div class="rounded-xl border shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-muted/50">
              <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
              <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Movie</th>
              <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Rented Date</th>
              <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Due Date</th>
              <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            {#if isLoading}
              {#each Array(5) as _}
                <tr>
                  <td class="p-4 align-middle"><div class="skeleton h-4 w-24 rounded"></div></td>
                  <td class="p-4 align-middle"><div class="skeleton h-4 w-24 rounded"></div></td>
                  <td class="p-4 align-middle"><div class="skeleton h-4 w-24 rounded"></div></td>
                  <td class="p-4 align-middle"><div class="skeleton h-4 w-24 rounded"></div></td>
                  <td class="p-4 align-middle"><div class="skeleton h-6 w-16 rounded-full"></div></td>
                  <td class="p-4 align-middle">
                    <div class="flex space-x-2">
                      <div class="skeleton h-8 w-8 rounded"></div>
                      <div class="skeleton h-8 w-8 rounded"></div>
                    </div>
                  </td>
                </tr>
              {/each}
            {:else if rentals.length === 0}
              <tr>
                <td colspan="6" class="p-4 text-center text-gray-500">No rentals found</td>
              </tr>
            {:else}
              {#each rentals as rental}
                <tr class="hover:bg-muted/50">
                  <td class="p-4 align-middle">{rental.user.name}</td>
                  <td class="p-4 align-middle">{rental.movie.title}</td>
                  <td class="p-4 align-middle">{formatDate(rental.rentedDate)}</td>
                  <td class="p-4 align-middle">
                    <span class={`
                      ${isOverdue(rental.dueDate) && !rental.returnedDate ? 'text-red-600 font-medium' : ''}
                      ${isDueSoon(rental.dueDate) && !rental.returnedDate ? 'text-yellow-600 font-medium' : ''}
                    `}>
                      {formatDate(rental.dueDate)}
                    </span>
                  </td>
                  <td class="p-4 align-middle">
                    {#if rental.returnedDate}
                      <span class="inline-flex h-6 items-center rounded-full bg-green-100 px-2.5 text-xs font-medium text-green-700">
                        Returned {formatDate(rental.returnedDate)}
                      </span>
                    {:else if isOverdue(rental.dueDate)}
                      <span class="inline-flex h-6 items-center rounded-full bg-red-100 px-2.5 text-xs font-medium text-red-700">
                        Overdue
                      </span>
                    {:else if isDueSoon(rental.dueDate)}
                      <span class="inline-flex h-6 items-center rounded-full bg-yellow-100 px-2.5 text-xs font-medium text-yellow-800">
                        Due Soon
                      </span>
                    {:else}
                      <span class="inline-flex h-6 items-center rounded-full bg-blue-100 px-2.5 text-xs font-medium text-blue-700">
                        Active
                      </span>
                    {/if}
                  </td>
                  <td class="p-4 align-middle">
                    <div class="flex items-center space-x-2">
                      {#if !rental.returnedDate}
                        <button
                          on:click={() => confirmReturn(rental)}
                          class="inline-flex items-center justify-center rounded-md bg-green-100 w-8 h-8 text-green-700 hover:bg-green-200"
                          title="Return"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                      {/if}
                      <button
                        on:click={() => openRentalModal(rental)}
                        class="inline-flex items-center justify-center rounded-md bg-gray-100 w-8 h-8 text-gray-700 hover:bg-gray-200"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        on:click={() => confirmDelete(rental)}
                        class="inline-flex items-center justify-center rounded-md bg-red-100 w-8 h-8 text-red-700 hover:bg-red-200"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</Layout>

<!-- Rental Modal -->
{#if isModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto p-6">
      <button
        on:click={closeRentalModal}
        class="absolute top-4 right-4 inline-flex items-center justify-center rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <div class="text-xl font-semibold mb-4">
        {rentalToEdit ? 'Edit Rental' : 'New Rental'}
      </div>
      
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <label for="userId" class="text-sm font-medium">User <span class="text-red-500">*</span></label>
          <select
            id="userId"
            bind:value={userId}
            required
            class="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            {#each users as user}
              <option value={user.id}>{user.name}</option>
            {/each}
          </select>
        </div>
        
        <div class="space-y-2">
          <label for="movieId" class="text-sm font-medium">Movie <span class="text-red-500">*</span></label>
          <select
            id="movieId"
            bind:value={movieId}
            required
            class="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            {#each getAvailableMovies() as movie}
              <option value={movie.id}>{movie.title}</option>
            {/each}
          </select>
        </div>
        
        <div class="space-y-2">
          <label for="rentedDate" class="text-sm font-medium">Rented Date <span class="text-red-500">*</span></label>
          <input
            id="rentedDate"
            type="date"
            required
            bind:value={rentedDate}
            class="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        
        <div class="space-y-2">
          <label for="dueDate" class="text-sm font-medium">Due Date <span class="text-red-500">*</span></label>
          <input
            id="dueDate"
            type="date"
            required
            bind:value={dueDate}
            class="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        
        <div class="space-y-2">
          <label for="notes" class="text-sm font-medium">Notes</label>
          <textarea
            id="notes"
            bind:value={notes}
            rows="3"
            class="flex w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          ></textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            on:click={closeRentalModal}
            class="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {rentalToEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Confirm Delete Dialog -->
{#if isConfirmDialogOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6">
      <h3 class="text-lg font-semibold mb-2">Delete Rental</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Are you sure you want to delete this rental? This action cannot be undone.
      </p>
      <div class="flex justify-end space-x-3">
        <button
          on:click={closeConfirmDialog}
          class="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          on:click={deleteRental}
          class="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Confirm Return Dialog -->
{#if isReturnDialogOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6">
      <h3 class="text-lg font-semibold mb-2">Return Rental</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Are you sure you want to mark this rental as returned? This will make the movie available for rent again.
      </p>
      <div class="flex justify-end space-x-3">
        <button
          on:click={closeReturnDialog}
          class="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          on:click={returnRental}
          class="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Return
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Skeletons */
  .skeleton {
    @apply relative overflow-hidden bg-gray-200 dark:bg-gray-700 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent;
  }
</style>