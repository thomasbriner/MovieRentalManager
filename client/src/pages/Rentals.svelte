<script lang="ts">
  import { onMount } from 'svelte';
  import { ShoppingBag, Plus, Search, RotateCcw, Trash, X, Calendar, User, Film } from 'lucide-svelte';
  
  let rentals = [];
  let users = [];
  let movies = [];
  let loading = true;
  let searchQuery = '';
  let showModal = false;
  let currentRental = null;
  
  let newRental = {
    userId: 0,
    movieId: 0,
    dueDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days from now
  };

  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  $: filteredRentals = rentals.filter(rental => 
    rental.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rental.movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  onMount(async () => {
    try {
      const [rentalsRes, usersRes, moviesRes] = await Promise.all([
        fetch('/api/rentals').then(res => res.json()),
        fetch('/api/users').then(res => res.json()),
        fetch('/api/movies').then(res => res.json())
      ]);
      
      rentals = rentalsRes;
      users = usersRes;
      movies = moviesRes.filter(movie => movie.available);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      loading = false;
    }
  });

  function openModal(rental = null) {
    currentRental = rental;
    if (rental) {
      newRental = { 
        userId: rental.userId,
        movieId: rental.movieId,
        dueDate: formatDate(new Date(rental.dueDate))
      };
    } else {
      newRental = {
        userId: users.length > 0 ? users[0].id : 0,
        movieId: movies.length > 0 ? movies[0].id : 0,
        dueDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      };
    }
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  async function saveRental() {
    try {
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRental)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create rental');
      }
      
      const savedRental = await response.json();
      rentals = [...rentals, savedRental];
      
      // Update available status for the rented movie
      movies = movies.filter(m => m.id !== savedRental.movieId);
      
      closeModal();
    } catch (error) {
      console.error('Error saving rental:', error);
    }
  }

  async function returnRental(id) {
    if (!confirm('Are you sure you want to mark this rental as returned?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/rentals/${id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ returnedDate: new Date().toISOString() })
      });
      
      if (!response.ok) {
        throw new Error('Failed to return rental');
      }
      
      const updatedRental = await response.json();
      rentals = rentals.map(r => r.id === updatedRental.id ? updatedRental : r);
      
      // Update the available movies list
      const movieResponse = await fetch('/api/movies');
      const allMovies = await movieResponse.json();
      movies = allMovies.filter(movie => movie.available);
    } catch (error) {
      console.error('Error returning rental:', error);
    }
  }

  async function deleteRental(id) {
    if (!confirm('Are you sure you want to delete this rental?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/rentals/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete rental');
      }
      
      rentals = rentals.filter(r => r.id !== id);
      
      // Update the available movies list
      const movieResponse = await fetch('/api/movies');
      const allMovies = await movieResponse.json();
      movies = allMovies.filter(movie => movie.available);
    } catch (error) {
      console.error('Error deleting rental:', error);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col md:flex-row md:items-center md:justify-between">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Rentals</h2>
      <p class="text-muted-foreground">Manage your movie rentals</p>
    </div>
    <div class="mt-4 md:mt-0">
      <button 
        class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
        on:click={() => openModal()}
        disabled={movies.length === 0 || users.length === 0}
      >
        <Plus class="h-4 w-4 mr-2" />
        Create Rental
      </button>
    </div>
  </div>

  <div class="relative">
    <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <input 
      type="text" 
      bind:value={searchQuery}
      placeholder="Search rentals..." 
      class="pl-10 h-10 w-full md:max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
    />
  </div>

  {#if loading}
    <div class="bg-card rounded-lg shadow-sm overflow-hidden animate-pulse">
      {#each Array(5) as _}
        <div class="p-4 border-b border-border">
          <div class="flex justify-between">
            <div class="space-y-2">
              <div class="h-5 w-48 bg-gray-200 dark:bg-gray-700"></div>
              <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div class="h-8 w-24 bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if filteredRentals.length === 0}
    <div class="bg-card rounded-lg p-8 shadow-sm text-center">
      {#if searchQuery}
        <ShoppingBag class="h-10 w-10 mx-auto text-muted-foreground" />
        <h3 class="mt-4 text-lg font-medium">No rentals found</h3>
        <p class="mt-2 text-muted-foreground">Try adjusting your search query</p>
        <button 
          class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          on:click={() => searchQuery = ''}
        >
          <X class="h-4 w-4 mr-2" />
          Clear search
        </button>
      {:else}
        <ShoppingBag class="h-10 w-10 mx-auto text-muted-foreground" />
        <h3 class="mt-4 text-lg font-medium">No rentals available</h3>
        <p class="mt-2 text-muted-foreground">Create your first rental to get started</p>
        <button 
          class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 hover:bg-primary/90"
          on:click={() => openModal()}
          disabled={movies.length === 0 || users.length === 0}
        >
          <Plus class="h-4 w-4 mr-2" />
          Create Rental
        </button>
        
        {#if movies.length === 0 && users.length === 0}
          <p class="mt-4 text-muted-foreground">You need to add users and movies first</p>
        {:else if movies.length === 0}
          <p class="mt-4 text-muted-foreground">No available movies to rent</p>
        {:else if users.length === 0}
          <p class="mt-4 text-muted-foreground">No users to rent to</p>
        {/if}
      {/if}
    </div>
  {:else}
    <div class="bg-card rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-full divide-y divide-border">
          <thead>
            <tr class="bg-muted/50">
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Movie</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rental Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            {#each filteredRentals as rental}
              <tr class="hover:bg-muted/30">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                      <User class="h-4 w-4 text-purple-600 dark:text-purple-300" />
                    </div>
                    <span class="font-medium">{rental.user.name}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                      <Film class="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <span>{rental.movie.title}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{new Date(rental.createdAt).toLocaleDateString()}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{new Date(rental.dueDate).toLocaleDateString()}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {#if rental.returnedDate}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Returned
                    </span>
                  {:else if new Date(rental.dueDate) < new Date()}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      Overdue
                    </span>
                  {:else}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                      Active
                    </span>
                  {/if}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {#if !rental.returnedDate}
                    <button 
                      class="inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 mr-2"
                      on:click={() => returnRental(rental.id)}
                      aria-label="Return rental"
                    >
                      <RotateCcw class="h-3.5 w-3.5 mr-1" />
                      Return
                    </button>
                  {/if}
                  <button 
                    class="inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                    on:click={() => deleteRental(rental.id)}
                    aria-label="Delete rental"
                  >
                    <Trash class="h-3.5 w-3.5 mr-1" />
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="bg-card rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6 space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">Create New Rental</h3>
          <button 
            class="text-muted-foreground hover:text-foreground"
            on:click={closeModal}
            aria-label="Close modal"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        
        <form on:submit|preventDefault={saveRental} class="space-y-4">
          <div class="space-y-2">
            <label for="userId" class="block text-sm font-medium">User</label>
            <select 
              id="userId"
              bind:value={newRental.userId}
              required
              class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {#each users as user}
                <option value={user.id}>{user.name}</option>
              {/each}
            </select>
          </div>
          
          <div class="space-y-2">
            <label for="movieId" class="block text-sm font-medium">Movie</label>
            <select 
              id="movieId"
              bind:value={newRental.movieId}
              required
              class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {#each movies as movie}
                <option value={movie.id}>{movie.title}</option>
              {/each}
            </select>
          </div>
          
          <div class="space-y-2">
            <label for="dueDate" class="block text-sm font-medium">Due Date</label>
            <input
              id="dueDate"
              type="date"
              bind:value={newRental.dueDate}
              required
              min={formatDate(new Date())}
              class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          
          <div class="flex justify-end gap-2 pt-4">
            <button 
              type="button"
              on:click={closeModal}
              class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}