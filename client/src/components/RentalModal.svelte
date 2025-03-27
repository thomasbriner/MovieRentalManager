<script lang="ts">
  import { onMount } from 'svelte';
  
  export let isOpen: boolean = false;
  export let onClose: () => void;
  export let onSubmit: () => void;
  
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
  };
  
  // Form state
  let selectedUserId: number | null = null;
  let selectedMovieId: number | null = null;
  let rentalDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
  
  // Data
  let users: User[] = [];
  let movies: Movie[] = [];
  let isLoadingUsers = false;
  let isLoadingMovies = false;
  
  // Error state
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  
  $: if (isOpen) {
    resetForm();
    fetchUsers();
    fetchMovies();
  }
  
  function resetForm() {
    selectedUserId = null;
    selectedMovieId = null;
    rentalDate = new Date().toISOString().split('T')[0];
    errors = {};
  }
  
  async function fetchUsers() {
    try {
      isLoadingUsers = true;
      const response = await fetch('/api/users');
      const data = await response.json();
      users = data;
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      isLoadingUsers = false;
    }
  }
  
  async function fetchMovies() {
    try {
      isLoadingMovies = true;
      const response = await fetch('/api/movies/available');
      const data = await response.json();
      movies = data;
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      isLoadingMovies = false;
    }
  }
  
  function validateForm() {
    const newErrors: Record<string, string> = {};
    
    if (!selectedUserId) {
      newErrors.userId = 'Please select a user';
    }
    
    if (!selectedMovieId) {
      newErrors.movieId = 'Please select a movie';
    }
    
    if (!rentalDate) {
      newErrors.rentalDate = 'Rental date is required';
    }
    
    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }
  
  async function handleSubmit() {
    if (!validateForm()) return;
    
    isSubmitting = true;
    
    try {
      const rentalData = {
        userId: selectedUserId,
        movieId: selectedMovieId,
        rentalDate: new Date(rentalDate).toISOString()
      };
      
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rentalData)
      });
      
      if (response.ok) {
        onSubmit();
      } else {
        const data = await response.json();
        if (data.errors) {
          errors = data.errors;
        }
      }
    } catch (error) {
      console.error('Error creating rental:', error);
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isOpen}
<div class="fixed inset-0 flex items-center justify-center z-50">
  <!-- Backdrop -->
  <div class="absolute inset-0 bg-black bg-opacity-50" on:click={onClose}></div>
  
  <!-- Modal -->
  <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto z-10 overflow-hidden">
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">Create New Rental</h2>
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="grid grid-cols-1 gap-4 mb-4">
          <!-- User Selection -->
          <div>
            <label for="userId" class="block text-sm font-medium text-gray-700 mb-1">
              User *
            </label>
            {#if isLoadingUsers}
              <div class="w-full p-2 border border-gray-300 rounded-md bg-gray-50">
                <div class="animate-pulse h-5 bg-gray-200 rounded"></div>
              </div>
            {:else}
              <select
                bind:value={selectedUserId}
                id="userId"
                class="w-full p-2 border {errors.userId ? 'border-red-500' : 'border-gray-300'} rounded-md"
              >
                <option value={null}>Select a user</option>
                {#each users as user}
                  <option value={user.id}>{user.name} ({user.email})</option>
                {/each}
              </select>
              {#if errors.userId}
                <p class="text-red-500 text-xs mt-1">{errors.userId}</p>
              {/if}
              {#if users.length === 0}
                <p class="text-amber-600 text-xs mt-1">No users available. Please create a user first.</p>
              {/if}
            {/if}
          </div>
          
          <!-- Movie Selection -->
          <div>
            <label for="movieId" class="block text-sm font-medium text-gray-700 mb-1">
              Movie *
            </label>
            {#if isLoadingMovies}
              <div class="w-full p-2 border border-gray-300 rounded-md bg-gray-50">
                <div class="animate-pulse h-5 bg-gray-200 rounded"></div>
              </div>
            {:else}
              <select
                bind:value={selectedMovieId}
                id="movieId"
                class="w-full p-2 border {errors.movieId ? 'border-red-500' : 'border-gray-300'} rounded-md"
              >
                <option value={null}>Select a movie</option>
                {#each movies as movie}
                  <option value={movie.id}>{movie.title} ({movie.director || 'Unknown director'})</option>
                {/each}
              </select>
              {#if errors.movieId}
                <p class="text-red-500 text-xs mt-1">{errors.movieId}</p>
              {/if}
              {#if movies.length === 0}
                <p class="text-amber-600 text-xs mt-1">No available movies. Please create a movie first or wait for returns.</p>
              {/if}
            {/if}
          </div>
          
          <!-- Rental Date -->
          <div>
            <label for="rentalDate" class="block text-sm font-medium text-gray-700 mb-1">
              Rental Date *
            </label>
            <input
              bind:value={rentalDate}
              type="date"
              id="rentalDate"
              class="w-full p-2 border {errors.rentalDate ? 'border-red-500' : 'border-gray-300'} rounded-md"
              max={new Date().toISOString().split('T')[0]}
            />
            {#if errors.rentalDate}
              <p class="text-red-500 text-xs mt-1">{errors.rentalDate}</p>
            {/if}
          </div>
        </div>
        
        <div class="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            on:click={onClose}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            disabled={isSubmitting || movies.length === 0 || users.length === 0}
          >
            {#if isSubmitting}
              <span class="inline-block animate-spin mr-2">↻</span>
            {/if}
            Create Rental
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
{/if}