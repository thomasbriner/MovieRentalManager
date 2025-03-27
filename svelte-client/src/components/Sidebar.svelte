<script lang="ts">
  import { location } from 'svelte-spa-router';
  
  export let open: boolean = false;
  export let closeSidebar: () => void;
  
  const links = [
    { href: '/', label: 'Dashboard', icon: 'dashboard' },
    { href: '/movies', label: 'Movies', icon: 'movie' },
    { href: '/users', label: 'Users', icon: 'users' },
    { href: '/rentals', label: 'Rentals', icon: 'book' }
  ];
</script>

<aside class={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between h-16 px-4 border-b">
      <span class="text-xl font-bold text-gray-900">Movie Rental</span>
      <button 
        on:click={closeSidebar}
        class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
      >
        <span class="sr-only">Close sidebar</span>
        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <nav class="flex-1 overflow-y-auto py-4">
      <ul class="space-y-1 px-2">
        {#each links as link}
          <li>
            <a 
              href={link.href} 
              class={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${$location === link.href ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              on:click|preventDefault={() => {
                window.location.hash = link.href;
                if (open) closeSidebar();
              }}
            >
              <span class="mr-3">
                {#if link.icon === 'dashboard'}
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                {:else if link.icon === 'movie'}
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                {:else if link.icon === 'users'}
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                {:else if link.icon === 'book'}
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                {/if}
              </span>
              {link.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
    
    <div class="border-t p-4">
      <div class="text-xs text-gray-500">
        <p>© 2025 Movie Rental System</p>
        <p>All rights reserved</p>
      </div>
    </div>
  </div>
</aside>

{#if open}
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
    on:click={closeSidebar}
  ></div>
{/if}