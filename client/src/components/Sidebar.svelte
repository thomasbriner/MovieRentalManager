<script lang="ts">
  import { Home, Film, Users, ShoppingBag } from 'lucide-svelte';
  import { Link, useLocation } from 'svelte-routing';

  export let open = false;
  export let closeSidebar: () => void;

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/movies', label: 'Movies', icon: Film },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/rentals', label: 'Rentals', icon: ShoppingBag }
  ];

  const location = useLocation();
  $: currentPath = $location;
</script>

<aside 
  class="fixed inset-y-0 left-0 z-20 flex flex-col w-64 transition-transform duration-300 ease-in-out transform bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 {open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
>
  <div class="p-4 flex justify-between items-center">
    <div class="flex items-center">
      <Film class="h-6 w-6 text-primary" />
      <span class="ml-2 text-lg font-medium text-gray-900 dark:text-white">MovieRent</span>
    </div>
    <button 
      class="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-50 dark:hover:bg-gray-800 md:hidden focus:outline-none"
      on:click={closeSidebar}
      aria-label="Close sidebar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>

  <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
    {#each navItems as { href, label, icon }}
      <Link
        to={href}
        class="flex items-center p-3 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 {currentPath === href ? 'bg-gray-100 dark:bg-gray-800 text-primary dark:text-primary' : ''}"
        on:click={closeSidebar}
      >
        <svelte:component this={icon} class="h-5 w-5 mr-3 {currentPath === href ? 'text-primary' : ''}" />
        {label}
      </Link>
    {/each}
  </nav>
</aside>

{#if open}
  <div 
    class="fixed inset-0 z-10 bg-gray-900 bg-opacity-50 md:hidden"
    on:click={closeSidebar}
  ></div>
{/if}