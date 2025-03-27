<script lang="ts">
  import { onMount } from 'svelte';
  import { Film, Users, ShoppingBag } from 'lucide-svelte';

  let stats = {
    totalMovies: 0,
    availableMovies: 0,
    totalUsers: 0,
    activeRentals: 0,
    recentRentals: []
  };

  let loading = true;

  onMount(async () => {
    try {
      const [movies, users, rentals] = await Promise.all([
        fetch('/api/movies').then(res => res.json()),
        fetch('/api/users').then(res => res.json()),
        fetch('/api/rentals').then(res => res.json())
      ]);

      stats = {
        totalMovies: movies.length,
        availableMovies: movies.filter(m => m.available).length,
        totalUsers: users.length,
        activeRentals: rentals.filter(r => !r.returnedDate).length,
        recentRentals: rentals
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      loading = false;
    }
  });
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold tracking-tight">Dashboard</h2>
    <p class="text-muted-foreground">Overview of your movie rental system</p>
  </div>

  {#if loading}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {#each Array(4) as _}
        <div class="bg-card rounded-lg p-6 shadow animate-pulse">
          <div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
          <div class="h-5 w-20 bg-gray-200 dark:bg-gray-700 mb-2"></div>
          <div class="h-8 w-12 bg-gray-200 dark:bg-gray-700"></div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div class="bg-card rounded-lg p-6 shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Total Movies</p>
            <h3 class="text-3xl font-bold mt-1">{stats.totalMovies}</h3>
          </div>
          <div class="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
            <Film class="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
        </div>
      </div>
      
      <div class="bg-card rounded-lg p-6 shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Available Movies</p>
            <h3 class="text-3xl font-bold mt-1">{stats.availableMovies}</h3>
          </div>
          <div class="bg-green-100 dark:bg-green-900 p-3 rounded-full">
            <Film class="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
        </div>
      </div>
      
      <div class="bg-card rounded-lg p-6 shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Total Users</p>
            <h3 class="text-3xl font-bold mt-1">{stats.totalUsers}</h3>
          </div>
          <div class="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
            <Users class="h-6 w-6 text-purple-600 dark:text-purple-300" />
          </div>
        </div>
      </div>
      
      <div class="bg-card rounded-lg p-6 shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Active Rentals</p>
            <h3 class="text-3xl font-bold mt-1">{stats.activeRentals}</h3>
          </div>
          <div class="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
            <ShoppingBag class="h-6 w-6 text-amber-600 dark:text-amber-300" />
          </div>
        </div>
      </div>
    </div>
  {/if}

  <div class="space-y-4">
    <h3 class="text-xl font-semibold">Recent Rentals</h3>
    
    {#if loading}
      <div class="bg-card rounded-lg shadow overflow-hidden">
        {#each Array(5) as _}
          <div class="p-4 border-b border-border animate-pulse">
            <div class="flex justify-between">
              <div class="space-y-2">
                <div class="h-5 w-48 bg-gray-200 dark:bg-gray-700"></div>
                <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        {/each}
      </div>
    {:else if stats.recentRentals.length === 0}
      <div class="bg-card rounded-lg p-8 shadow text-center">
        <p class="text-muted-foreground">No rentals found</p>
      </div>
    {:else}
      <div class="bg-card rounded-lg shadow overflow-hidden">
        {#each stats.recentRentals as rental}
          <div class="p-4 border-b border-border">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium">{rental.movie.title}</p>
                <p class="text-sm text-muted-foreground">Rented to: {rental.user.name}</p>
              </div>
              <div>
                <span class={rental.returnedDate ? "text-green-600 dark:text-green-400 text-sm font-medium" : "text-amber-600 dark:text-amber-400 text-sm font-medium"}>
                  {rental.returnedDate ? 'Returned' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>