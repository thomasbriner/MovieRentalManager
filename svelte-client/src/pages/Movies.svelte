<script lang="ts">
  import { onMount } from 'svelte';
  import Layout from '../components/Layout.svelte';
  
  let isLoading = true;
  let movies = [];
  let isModalOpen = false;
  let movieToEdit = null;
  let isConfirmDialogOpen = false;
  let movieToDelete = null;
  
  // Form fields
  let title = '';
  let director = '';
  let year = '';
  let genre = '';
  let description = '';
  let available = true;
  
  onMount(() => {
    fetchMovies();
  });
  
  async function fetchMovies() {
    try {
      const response = await fetch('/api/movies');
      movies = await response.json();
      isLoading = false;
    } catch (error) {
      console.error('Error fetching movies:', error);
      isLoading = false;
    }
  }
  
  function openMovieModal(movie = null) {
    if (movie) {
      movieToEdit = movie;
      title = movie.title;
      director = movie.director || '';
      year = movie.year ? movie.year.toString() : '';
      genre = movie.genre || '';
      description = movie.description || '';
      available = movie.available;
    } else {
      movieToEdit = null;
      title = '';
      director = '';
      year = '';
      genre = '';
      description = '';
      available = true;
    }
    
    isModalOpen = true;
  }
  
  function closeMovieModal() {
    isModalOpen = false;
  }
  
  async function handleSubmit() {
    try {
      const movieData = {
        title,
        director: director || undefined,
        year: year ? parseInt(year) : undefined,
        genre: genre || undefined,
        description: description || undefined,
        available
      };
      
      const url = movieToEdit 
        ? `/api/movies/${movieToEdit.id}` 
        : '/api/movies';
      
      const method = movieToEdit ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(movieData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      closeMovieModal();
      fetchMovies();
    } catch (error) {
      console.error('Error saving movie:', error);
    }
  }
  
  function confirmDelete(movie) {
    movieToDelete = movie;
    isConfirmDialogOpen = true;
  }
  
  function closeConfirmDialog() {
    isConfirmDialogOpen = false;
    movieToDelete = null;
  }
  
  async function deleteMovie() {
    if (!movieToDelete) return;
    
    try {
      const response = await fetch(`/api/movies/${movieToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      closeConfirmDialog();
      fetchMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  }
</script>

<Layout>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-bold tracking-tight">Movies</h2>
      <button
        on:click={() => openMovieModal()}
        class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Movie
      </button>
    </div>
    
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#if isLoading}
        {#each Array(6) as _}
          <div class="rounded-xl border bg-card text-card-foreground shadow">
            <div class="p-6">
              <div class="skeleton h-5 w-3/4 rounded mb-4"></div>
              <div class="skeleton h-4 w-1/2 rounded mb-2"></div>
              <div class="skeleton h-4 w-1/3 rounded mb-6"></div>
              <div class="skeleton h-20 w-full rounded mb-4"></div>
              <div class="flex justify-end space-x-2">
                <div class="skeleton h-9 w-16 rounded"></div>
                <div class="skeleton h-9 w-16 rounded"></div>
              </div>
            </div>
          </div>
        {/each}
      {:else if movies.length === 0}
        <div class="col-span-full flex flex-col items-center justify-center p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary mb-4">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          <h3 class="text-lg font-medium">No movies found</h3>
          <p class="text-sm text-gray-500 mt-1">Click the 'Add Movie' button to add a new movie.</p>
        </div>
      {:else}
        {#each movies as movie}
          <div class="rounded-xl border bg-card text-card-foreground shadow">
            <div class="p-6">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-semibold text-lg">{movie.title}</h3>
                <span class={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ${movie.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {movie.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              {#if movie.director || movie.year || movie.genre}
                <div class="text-sm text-gray-500 mb-3">
                  {#if movie.director}
                    <span>{movie.director}</span>
                  {/if}
                  {#if movie.year}
                    <span>{movie.director ? ' · ' : ''}{movie.year}</span>
                  {/if}
                  {#if movie.genre}
                    <span>{movie.director || movie.year ? ' · ' : ''}{movie.genre}</span>
                  {/if}
                </div>
              {/if}
              
              {#if movie.description}
                <p class="text-sm text-gray-600 mb-4 line-clamp-3">{movie.description}</p>
              {/if}
              
              <div class="flex justify-end space-x-2">
                <button
                  on:click={() => openMovieModal(movie)}
                  class="inline-flex items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
                <button
                  on:click={() => confirmDelete(movie)}
                  class="inline-flex items-center justify-center rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                >
                  <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</Layout>

<!-- Movie Modal -->
{#if isModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto p-6">
      <button
        on:click={closeMovieModal}
        class="absolute top-4 right-4 inline-flex items-center justify-center rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <div class="text-xl font-semibold mb-4">
        {movieToEdit ? 'Edit Movie' : 'Add Movie'}
      </div>
      
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <label for="title" class="text-sm font-medium">Title <span class="text-red-500">*</span></label>
          <input
            id="title"
            type="text"
            required
            bind:value={title}
            class="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        
        <div class="space-y-2">
          <label for="director" class="text-sm font-medium">Director</label>
          <input
            id="director"
            type="text"
            bind:value={director}
            class="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        
        <div class="space-y-2">
          <label for="year" class="text-sm font-medium">Year</label>
          <input
            id="year"
            type="number"
            min="1888"
            max="2099"
            placeholder="YYYY"
            bind:value={year}
            class="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        
        <div class="space-y-2">
          <label for="genre" class="text-sm font-medium">Genre</label>
          <input
            id="genre"
            type="text"
            bind:value={genre}
            class="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        
        <div class="space-y-2">
          <label for="description" class="text-sm font-medium">Description</label>
          <textarea
            id="description"
            bind:value={description}
            rows="3"
            class="flex w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          ></textarea>
        </div>
        
        <div class="flex items-center space-x-2">
          <input
            id="available"
            type="checkbox"
            bind:checked={available}
            class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
          />
          <label for="available" class="text-sm font-medium">Available for Rent</label>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            on:click={closeMovieModal}
            class="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {movieToEdit ? 'Update' : 'Create'}
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
      <h3 class="text-lg font-semibold mb-2">Delete Movie</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Are you sure you want to delete "{movieToDelete?.title}"? This action cannot be undone.
      </p>
      <div class="flex justify-end space-x-3">
        <button
          on:click={closeConfirmDialog}
          class="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          on:click={deleteMovie}
          class="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Delete
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