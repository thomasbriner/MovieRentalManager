<script lang="ts">
  import { onMount } from 'svelte';
  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';
  
  let sidebarOpen = false;
  
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
  
  function closeSidebar() {
    sidebarOpen = false;
  }
  
  onMount(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        sidebarOpen = false;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<div class="flex min-h-screen flex-col">
  <Sidebar open={sidebarOpen} closeSidebar={closeSidebar} />
  
  <div class="flex flex-col flex-1">
    <Header toggleSidebar={toggleSidebar} />
    
    <main class="flex-1 p-4 lg:p-6">
      <slot />
    </main>
  </div>
</div>