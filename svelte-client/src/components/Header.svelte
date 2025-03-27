<script lang="ts">
  import { onMount } from 'svelte';
  import { location } from 'svelte-spa-router';
  export let toggleSidebar: () => void;
  
  let searchTerm = '';
  let searchResults = [];
  let showSearchResults = false;
  
  onMount(() => {
    const handleClickOutside = (event) => {
      const searchContainer = document.getElementById('search-container');
      if (searchContainer && !searchContainer.contains(event.target)) {
        showSearchResults = false;
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
  
  async function handleSearch() {
    if (!searchTerm.trim()) {
      searchResults = [];
      showSearchResults = false;
      return;
    }
    
    try {
      const [moviesRes, usersRes] = await Promise.all([
        fetch('/api/movies'),
        fetch('/api/users')
      ]);
      
      const movies = await moviesRes.json();
      const users = await usersRes.json();
      
      const filteredMovies = movies
        .filter(movie => 
          movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (movie.director && movie.director.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (movie.genre && movie.genre.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .map(movie => ({
          ...movie,
          type: 'movie'
        }));
      
      const filteredUsers = users
        .filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(user => ({
          ...user,
          type: 'user'
        }));
      
      searchResults = [...filteredMovies, ...filteredUsers];
      showSearchResults = true;
    } catch (error) {
      console.error('Search error:', error);
    }
  }
  
  function getPageTitle() {
    switch ($location) {
      case '/':
        return 'Dashboard';
      case '/movies':
        return 'Movies';
      case '/users':
        return 'Users';
      case '/rentals':
        return 'Rentals';
      default:
        return 'Movie Rental System';
    }
  }
  
  function navigateTo(result) {
    showSearchResults = false;
    searchTerm = '';
    
    if (result.type === 'movie') {
      window.location.href = '/#/movies';
    } else if (result.type === 'user') {
      window.location.href = '/#/users';
    }
  }
</script>

<header class="sticky top-0 z-10 flex items-center h-16 px-4 border-b bg-background gap-4">
  <button 
    class="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
    on:click={toggleSidebar}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  </button>
  
  <div class="lg:hidden shrink-0 text-xl font-bold text-primary">
    Movie Rental
  </div>
  
  <h1 class="hidden lg:block text-xl font-bold">{getPageTitle()}</h1>
  
  <div id="search-container" class="relative ml-auto">
    <div class="relative">
      <svg 
        class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400"
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
        type="text"
        placeholder="Search movies and users..."
        bind:value={searchTerm}
        on:input={handleSearch}
        class="h-9 rounded-full border bg-background px-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary w-full min-w-[200px] md:min-w-[300px]"
      />
    </div>
    
    {#if showSearchResults && searchResults.length > 0}
      <div class="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-[300px] overflow-y-auto z-50">
        <div class="p-2">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
            Search Results
          </div>
          {#each searchResults as result}
            <button
              on:click={() => navigateTo(result)}
              class="flex flex-col w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div class="flex items-center">
                {#if result.type === 'movie'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-primary">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                  <span class="font-medium">{result.title}</span>
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-primary">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span class="font-medium">{result.name}</span>
                {/if}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {#if result.type === 'movie'}
                  {result.director || 'No director'} · {result.genre || 'No genre'}
                {:else}
                  {result.email}
                {/if}
              </div>
            </button>
          {/each}
        </div>
      </div>
    {:else if showSearchResults && searchTerm.trim().length > 0}
      <div class="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          No results found for "{searchTerm}".
        </div>
      </div>
    {/if}
  </div>
</header>