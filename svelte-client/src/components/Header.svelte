<script lang="ts">
  import { onMount } from 'svelte';
  
  export let toggleSidebar: () => void;
  
  let searchTerm = '';
  let searchResults: any[] = [];
  let showDropdown = false;
  let isSearching = false;
  
  function handleSearch() {
    if (searchTerm.trim().length === 0) {
      showDropdown = false;
      searchResults = [];
      return;
    }
    
    isSearching = true;
    showDropdown = true;
    
    // Perform search across multiple endpoints
    Promise.all([
      fetch(`/api/movies/search?q=${encodeURIComponent(searchTerm)}`).then(res => res.json()),
      fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`).then(res => res.json())
    ]).then(([movies, users]) => {
      // Format results
      const formattedMovies = movies.map((movie: any) => ({
        id: movie.id,
        type: 'movie',
        title: movie.title,
        subtitle: movie.director || 'Unknown director',
        available: movie.available,
        path: `/movies`
      }));
      
      const formattedUsers = users.map((user: any) => ({
        id: user.id,
        type: 'user',
        title: user.name,
        subtitle: user.email,
        path: `/users`
      }));
      
      searchResults = [...formattedMovies, ...formattedUsers];
      isSearching = false;
    }).catch(err => {
      console.error('Error searching:', err);
      isSearching = false;
    });
  }
  
  function handleInputChange() {
    if (searchTerm.trim().length > 2) {
      handleSearch();
    } else {
      showDropdown = false;
      searchResults = [];
    }
  }
  
  function closeDropdown() {
    setTimeout(() => {
      showDropdown = false;
    }, 200);
  }
  
  // Handle click outside to close dropdown
  let searchContainer: HTMLDivElement;
  
  function handleClickOutside(event: MouseEvent) {
    if (searchContainer && !searchContainer.contains(event.target as Node)) {
      showDropdown = false;
    }
  }
  
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<header class="bg-white border-b border-gray-200 sticky top-0 z-10">
  <div class="px-4 sm:px-6 lg:px-8 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <button 
          on:click={toggleSidebar}
          class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
        >
          <span class="sr-only">Open sidebar</span>
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div class="ml-4 flex lg:ml-0">
          <a href="/" class="flex items-center">
            <span class="text-xl font-bold text-gray-900">Movie Rental</span>
          </a>
        </div>
      </div>
      
      <div class="flex-1 max-w-lg mx-auto">
        <div class="relative" bind:this={searchContainer}>
          <div class="flex items-center border border-gray-300 rounded-md">
            <input 
              type="text"
              bind:value={searchTerm}
              on:input={handleInputChange}
              on:blur={closeDropdown}
              placeholder="Search movies, users..."
              class="w-full py-2 pl-4 pr-10 text-sm text-gray-900 bg-transparent rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {#if isSearching}
                <svg class="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              {:else}
                <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              {/if}
            </div>
          </div>
          
          {#if showDropdown && searchResults.length > 0}
            <div class="absolute mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-72 overflow-y-auto z-20">
              <ul class="py-1">
                {#each searchResults as result}
                  <li>
                    <a 
                      href={result.path} 
                      class="flex items-start px-4 py-2 hover:bg-gray-100"
                    >
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                        <p class="text-xs text-gray-500">{result.subtitle}</p>
                        {#if result.type === 'movie'}
                          <span class={result.available ? "text-xs text-green-600" : "text-xs text-red-600"}>
                            {result.available ? 'Available' : 'Not Available'}
                          </span>
                        {/if}
                      </div>
                      <div class="ml-3">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {result.type === 'movie' ? 'Movie' : 'User'}
                        </span>
                      </div>
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {:else if showDropdown && searchTerm.trim().length > 0 && !isSearching}
            <div class="absolute mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 z-20">
              <div class="p-4 text-sm text-gray-500 text-center">
                No results found for "{searchTerm}"
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</header>