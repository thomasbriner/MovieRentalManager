<script lang="ts">
  import { location } from 'svelte-spa-router';
  export let open = false;
  export let closeSidebar: () => void;

  const isActive = (path: string) => $location === path;
</script>

<div class="fixed z-50 inset-0 {open ? 'block' : 'hidden'} lg:hidden">
  <div class="fixed inset-0 bg-black/50" on:click={closeSidebar}></div>
  <aside class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg dark:bg-gray-900 overflow-y-auto">
    <div class="flex items-center justify-between px-4 py-4 border-b">
      <h1 class="text-xl font-bold text-primary">Movie Rental</h1>
      <button 
        on:click={closeSidebar}
        class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <nav class="p-4">
      <ul class="space-y-2">
        <li>
          <a 
            href="/#/" 
            class="flex items-center p-2 rounded-lg {isActive('/') ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            Dashboard
          </a>
        </li>
        <li>
          <a 
            href="/#/movies" 
            class="flex items-center p-2 rounded-lg {isActive('/movies') ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            Movies
          </a>
        </li>
        <li>
          <a 
            href="/#/users" 
            class="flex items-center p-2 rounded-lg {isActive('/users') ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Users
          </a>
        </li>
        <li>
          <a 
            href="/#/rentals" 
            class="flex items-center p-2 rounded-lg {isActive('/rentals') ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            Rentals
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</div>

<aside class="hidden lg:flex flex-col w-64 border-r shrink-0">
  <div class="flex items-center h-16 px-4 border-b">
    <h1 class="text-xl font-bold text-primary">Movie Rental</h1>
  </div>
  <nav class="p-4 flex-1">
    <ul class="space-y-2">
      <li>
        <a 
          href="/#/" 
          class="flex items-center p-2 rounded-lg {isActive('/') ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
            <rect x="3" y="3" width="7" height="9"></rect>
            <rect x="14" y="3" width="7" height="5"></rect>
            <rect x="14" y="12" width="7" height="9"></rect>
            <rect x="3" y="16" width="7" height="5"></rect>
          </svg>
          Dashboard
        </a>
      </li>
      <li>
        <a 
          href="/#/movies" 
          class="flex items-center p-2 rounded-lg {isActive('/movies') ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          Movies
        </a>
      </li>
      <li>
        <a 
          href="/#/users" 
          class="flex items-center p-2 rounded-lg {isActive('/users') ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Users
        </a>
      </li>
      <li>
        <a 
          href="/#/rentals" 
          class="flex items-center p-2 rounded-lg {isActive('/rentals') ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          Rentals
        </a>
      </li>
    </ul>
  </nav>
</aside>