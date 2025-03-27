<script lang="ts">
  import { onMount } from 'svelte';
  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';

  let sidebarOpen = false;
  let isMobile = false;

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function closeSidebar() {
    if (isMobile && sidebarOpen) {
      sidebarOpen = false;
    }
  }

  function handleResize() {
    isMobile = window.innerWidth < 768;
    sidebarOpen = !isMobile;
  }

  onMount(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<div class="flex h-screen bg-background overflow-hidden">
  <Sidebar open={sidebarOpen} closeSidebar={closeSidebar} />
  
  <div class="flex flex-col flex-1 w-full">
    <Header toggleSidebar={toggleSidebar} />
    
    <main class="flex-1 overflow-y-auto p-4 md:p-6">
      <slot />
    </main>
  </div>
</div>