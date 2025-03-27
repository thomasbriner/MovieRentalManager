<script lang="ts">
  import { onMount } from 'svelte';
  import { Film, Plus, Search, Edit, Trash, X } from 'lucide-svelte';
  
  let movies = [];
  let loading = true;
  let searchQuery = '';
  let showModal = false;
  let currentMovie = null;
  
  let newMovie = {
    title: '',
    director: '',
    year: undefined,
    genre: '',
    available: true,
    description: ''
  };

  $: filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (movie.director && movie.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (movie.genre && movie.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  onMount(async () => {
    try {
      const response = await fetch('/api/movies');
      movies = await response.json();
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      loading = false;
    }
  });

  function openModal(movie = null) {
    currentMovie = movie;
    if (movie) {
      newMovie = { ...movie };
    } else {
      newMovie = {
        title: '',
        director: '',
        year: undefined,
        genre: '',
        available: true,
        description: ''
      };
    }
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  async function saveMovie() {
    try {
      const url = currentMovie ? `/api/movies/${currentMovie.id}` : '/api/movies';
      const method = currentMovie ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMovie)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save movie');
      }
      
      const savedMovie = await response.json();
      
      if (currentMovie) {
        movies = movies.map(m => m.id === savedMovie.id ? savedMovie : m);
      } else {
        movies = [...movies, savedMovie];
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving movie:', error);
    }
  }

  async function deleteMovie(id) {
    if (!confirm('Are you sure you want to delete this movie?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/movies/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete movie');
      }
      
      movies = movies.filter(m => m.id !== id);
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col md:flex-row md:items-center md:justify-between">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Movies</h2>
      <p class="text-muted-foreground">Manage your movie collection</p>
    </div>
    <div class="mt-4 md:mt-0">
      <button 
        class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
        on:click={() => openModal()}
      >
        <Plus class="h-4 w-4 mr-2" />
        Add Movie
      </button>
    </div>
  </div>

  <div class="relative">
    <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <input 
      type="text" 
      bind:value={searchQuery}
      placeholder="Search movies..." 
      class="pl-10 h-10 w-full md:max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
    />
  </div>

  {#if loading}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each Array(8) as _}
        <div class="bg-card rounded-lg shadow-sm overflow-hidden animate-pulse">
          <div class="h-48 bg-gray-200 dark:bg-gray-700"></div>
          <div class="p-4 space-y-2">
            <div class="h-5 w-3/4 bg-gray-200 dark:bg-gray-700"></div>
            <div class="h-4 w-1/2 bg-gray-200 dark:bg-gray-700"></div>
            <div class="h-4 w-2/3 bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if filteredMovies.length === 0}
    <div class="bg-card rounded-lg p-8 shadow-sm text-center">
      {#if searchQuery}
        <Film class="h-10 w-10 mx-auto text-muted-foreground" />
        <h3 class="mt-4 text-lg font-medium">No movies found</h3>
        <p class="mt-2 text-muted-foreground">Try adjusting your search query</p>
        <button 
          class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          on:click={() => searchQuery = ''}
        >
          <X class="h-4 w-4 mr-2" />
          Clear search
        </button>
      {:else}
        <Film class="h-10 w-10 mx-auto text-muted-foreground" />
        <h3 class="mt-4 text-lg font-medium">No movies available</h3>
        <p class="mt-2 text-muted-foreground">Add your first movie to get started</p>
        <button 
          class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 hover:bg-primary/90"
          on:click={() => openModal()}
        >
          <Plus class="h-4 w-4 mr-2" />
          Add Movie
        </button>
      {/if}
    </div>
  {:else}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each filteredMovies as movie}
        <div class="bg-card rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div class="p-6 flex-1">
            <div class="flex items-center justify-between">
              <div class="rounded-full p-2 bg-blue-100 dark:bg-blue-900">
                <Film class="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <span class={movie.available ? "text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}>
                {movie.available ? 'Available' : 'Rented Out'}
              </span>
            </div>
            
            <h3 class="mt-4 text-lg font-semibold">{movie.title}</h3>
            
            {#if movie.director}
              <p class="text-sm text-muted-foreground mt-1">Director: {movie.director}</p>
            {/if}
            
            <div class="flex items-center gap-2 mt-2">
              {#if movie.year}
                <span class="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">{movie.year}</span>
              {/if}
              
              {#if movie.genre}
                <span class="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">{movie.genre}</span>
              {/if}
            </div>
            
            {#if movie.description}
              <p class="mt-3 text-sm line-clamp-3">{movie.description}</p>
            {/if}
          </div>
          
          <div class="border-t border-border p-4 flex justify-end gap-2">
            <button 
              class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              on:click={() => openModal(movie)}
              aria-label="Edit movie"
            >
              <Edit class="h-4 w-4" />
            </button>
            <button 
              class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border border-input bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground"
              on:click={() => deleteMovie(movie.id)}
              aria-label="Delete movie"
            >
              <Trash class="h-4 w-4" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="bg-card rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6 space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">{currentMovie ? 'Edit Movie' : 'Add Movie'}</h3>
          <button 
            class="text-muted-foreground hover:text-foreground"
            on:click={closeModal}
            aria-label="Close modal"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        
        <form on:submit|preventDefault={saveMovie} class="space-y-4">
          <div class="space-y-2">
            <label for="title" class="block text-sm font-medium">Title</label>
            <input
              id="title"
              type="text"
              bind:value={newMovie.title}
              required
              class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          
          <div class="space-y-2">
            <label for="director" class="block text-sm font-medium">Director</label>
            <input
              id="director"
              type="text"
              bind:value={newMovie.director}
              class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          
          <div class="space-y-2">
            <label for="year" class="block text-sm font-medium">Release Year</label>
            <input
              id="year"
              type="number"
              bind:value={newMovie.year}
              min="1900"
              max="2099"
              class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          
          <div class="space-y-2">
            <label for="genre" class="block text-sm font-medium">Genre</label>
            <input
              id="genre"
              type="text"
              bind:value={newMovie.genre}
              class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          
          <div class="space-y-2">
            <label for="description" class="block text-sm font-medium">Description</label>
            <textarea
              id="description"
              bind:value={newMovie.description}
              rows="3"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            ></textarea>
          </div>
          
          <div class="flex items-center space-x-2">
            <input
              id="available"
              type="checkbox"
              bind:checked={newMovie.available}
              class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label for="available" class="text-sm font-medium">Available for rental</label>
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
              {currentMovie ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}