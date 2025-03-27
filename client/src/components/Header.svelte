<script lang="ts">
  import { Menu } from 'lucide-svelte';

  export let toggleSidebar: () => void;
</script>

<header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
  <div class="flex items-center">
    <button 
      class="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-50 dark:hover:bg-gray-800 focus:outline-none"
      on:click={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <Menu size={20} />
    </button>
    <h1 class="ml-4 text-xl font-semibold text-gray-900 dark:text-white">Movie Rental System</h1>
  </div>
  
  <div class="flex items-center space-x-2">
    <!-- Add profile or additional header items here -->
  </div>
</header>