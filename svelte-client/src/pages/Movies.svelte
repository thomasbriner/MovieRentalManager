<script lang="ts">
  import { onMount } from 'svelte';
  import MovieModal from '../components/MovieModal.svelte';
  import ConfirmDialog from '../components/ConfirmDialog.svelte';
  
  // Types
  type Movie = {
    id: number;
    title: string;
    director?: string;
    year?: number;
    genre?: string;
    available: boolean;
    description?: string;
  };
  
  // State
  let movies: Movie[] = [];
  let isLoading = true;
  let modalOpen = false;
  let confirmDialogOpen = false;
  let movieToEdit: Movie | null = null;
  let movieToDelete: Movie | null = null;
  let isDeleting = false;
  
  onMount(async () => {
    await fetchMovies();
  });
  
  async function fetchMovies() {
    try {
      isLoading = true;
      const response = await fetch('/api/movies');
      const data = await response.json();
      movies = data;
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      isLoading = false;
    }
  }
  
  function openAddModal() {
    movieToEdit = null;
    modalOpen = true;
  }
  
  function openEditModal(movie: Movie) {
    movieToEdit = movie;
    modalOpen = true;
  }
  
  function closeModal() {
    modalOpen = false;
  }
  
  function openDeleteDialog(movie: Movie) {
    movieToDelete = movie;
    confirmDialogOpen = true;
  }
  
  function closeDeleteDialog() {
    confirmDialogOpen = false;
  }
  
  async function handleDeleteMovie() {
    if (!movieToDelete) return;
    
    isDeleting = true;
    
    try {
      const response = await fetch(`/api/movies/${movieToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchMovies();
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
    } finally {
      isDeleting = false;
      closeDeleteDialog();
    }
  }
  
  async function handleMovieSubmit() {
    await fetchMovies();
    closeModal();
  }
</script>

<div>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Movies</h1>
    <button 
      on:click={openAddModal}
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Add Movie
    </button>
  </div>
  
  {#if isLoading}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each Array(6) as _}
        <div class="bg-white rounded-lg shadow p-6">
          <div class="animate-pulse">
            <div class="h-5 w-3/4 bg-gray-200 mb-3"></div>
            <div class="h-4 w-1/2 bg-gray-200 mb-2"></div>
            <div class="h-4 w-1/3 bg-gray-200 mb-4"></div>
            <div class="h-20 w-full bg-gray-200 rounded mb-4"></div>
            <div class="flex justify-end space-x-2">
              <div class="h-8 w-16 bg-gray-200 rounded"></div>
              <div class="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if movies.length === 0}
    <div class="text-center p-10 bg-white rounded-lg shadow">
      <p class="text-gray-500 mb-4">No movies found</p>
      <button 
        on:click={openAddModal}
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Add your first movie
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each movies as movie}
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-6">
            <div class="flex justify-between items-start mb-2">
              <h2 class="text-xl font-semibold">{movie.title}</h2>
              <span class={movie.available ? "text-green-600 text-xs font-medium px-2 py-1 bg-green-100 rounded" : "text-red-600 text-xs font-medium px-2 py-1 bg-red-100 rounded"}>
                {movie.available ? 'Available' : 'Not Available'}
              </span>
            </div>
            
            <div class="text-sm text-gray-500 mb-2">
              {#if movie.director || movie.year}
                <p>{movie.director || 'Unknown director'} • {movie.year || 'Unknown year'}</p>
              {/if}
              {#if movie.genre}
                <p class="text-xs text-gray-400">{movie.genre}</p>
              {/if}
            </div>
            
            {#if movie.description}
              <p class="text-sm mb-4">{movie.description}</p>
            {:else}
              <p class="text-sm text-gray-500 italic mb-4">No description available</p>
            {/if}
            
            <div class="flex justify-end space-x-2">
              <button 
                on:click={() => openEditModal(movie)}
                class="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              >
                Edit
              </button>
              <button 
                on:click={() => openDeleteDialog(movie)}
                class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<MovieModal 
  isOpen={modalOpen}
  onClose={closeModal}
  movieToEdit={movieToEdit}
  onSubmit={handleMovieSubmit}
/>

<ConfirmDialog
  isOpen={confirmDialogOpen}
  onClose={closeDeleteDialog}
  onConfirm={handleDeleteMovie}
  title="Delete Movie"
  description={`Are you sure you want to delete "${movieToDelete?.title}"? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  isPending={isDeleting}
/>