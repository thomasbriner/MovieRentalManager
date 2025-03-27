<script lang="ts">
  import { onMount } from 'svelte';
  import Layout from '../components/Layout.svelte';
  
  let isLoading = true;
  let rentals = [];
  let activeRentals = 0;
  let availableMovies = 0;
  let totalUsers = 0;

  async function fetchDashboardData() {
    try {
      const [rentalsRes, moviesRes, usersRes] = await Promise.all([
        fetch('/api/rentals'),
        fetch('/api/movies'),
        fetch('/api/users')
      ]);
      
      const rentalsData = await rentalsRes.json();
      const moviesData = await moviesRes.json();
      const usersData = await usersRes.json();
      
      // Get only the 5 most recent rentals
      rentals = rentalsData
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      // Calculate stats
      activeRentals = rentalsData.filter(rental => !rental.returnedDate).length;
      availableMovies = moviesData.filter(movie => movie.available).length;
      totalUsers = usersData.length;
      
      isLoading = false;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      isLoading = false;
    }
  }
  
  onMount(() => {
    fetchDashboardData();
  });
</script>

<Layout>
  <div class="space-y-6">
    <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
    
    <!-- Stats Section -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <!-- Active Rentals -->
      {#if isLoading}
        <div class="rounded-xl border bg-card text-card-foreground shadow">
          <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div class="skeleton h-4 w-24 rounded"></div>
            <div class="skeleton h-10 w-10 rounded-full"></div>
          </div>
          <div class="p-6 pt-0">
            <div class="skeleton h-8 w-16 rounded mb-2"></div>
            <div class="skeleton h-3 w-32 rounded"></div>
          </div>
        </div>
      {:else}
        <div class="rounded-xl border bg-card text-card-foreground shadow">
          <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 class="tracking-tight text-sm font-medium">Active Rentals</h3>
            <div class="p-2 rounded-full bg-purple-100 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
          <div class="p-6 pt-0">
            <div class="text-2xl font-bold">{activeRentals}</div>
            <p class="text-xs text-gray-500 mt-1">Movies currently rented out</p>
          </div>
        </div>
      {/if}
      
      <!-- Available Movies -->
      {#if isLoading}
        <div class="rounded-xl border bg-card text-card-foreground shadow">
          <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div class="skeleton h-4 w-24 rounded"></div>
            <div class="skeleton h-10 w-10 rounded-full"></div>
          </div>
          <div class="p-6 pt-0">
            <div class="skeleton h-8 w-16 rounded mb-2"></div>
            <div class="skeleton h-3 w-32 rounded"></div>
          </div>
        </div>
      {:else}
        <div class="rounded-xl border bg-card text-card-foreground shadow">
          <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 class="tracking-tight text-sm font-medium">Available Movies</h3>
            <div class="p-2 rounded-full bg-blue-100 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </div>
          </div>
          <div class="p-6 pt-0">
            <div class="text-2xl font-bold">{availableMovies}</div>
            <p class="text-xs text-gray-500 mt-1">Movies available for rent</p>
          </div>
        </div>
      {/if}
      
      <!-- Total Users -->
      {#if isLoading}
        <div class="rounded-xl border bg-card text-card-foreground shadow">
          <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div class="skeleton h-4 w-24 rounded"></div>
            <div class="skeleton h-10 w-10 rounded-full"></div>
          </div>
          <div class="p-6 pt-0">
            <div class="skeleton h-8 w-16 rounded mb-2"></div>
            <div class="skeleton h-3 w-32 rounded"></div>
          </div>
        </div>
      {:else}
        <div class="rounded-xl border bg-card text-card-foreground shadow">
          <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 class="tracking-tight text-sm font-medium">Total Users</h3>
            <div class="p-2 rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
          <div class="p-6 pt-0">
            <div class="text-2xl font-bold">{totalUsers}</div>
            <p class="text-xs text-gray-500 mt-1">Registered users in the system</p>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Recent Rentals Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium">Recent Rentals</h3>
        <a 
          href="/#/rentals" 
          class="text-sm font-medium text-primary hover:underline"
        >
          View all
        </a>
      </div>
      
      <div class="rounded-xl border shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-muted/50">
                <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Movie</th>
                <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Rented Date</th>
                <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Due Date</th>
                <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              {#if isLoading}
                {#each Array(5) as _}
                  <tr>
                    <td class="p-4 align-middle"><div class="skeleton h-4 w-24 rounded"></div></td>
                    <td class="p-4 align-middle"><div class="skeleton h-4 w-24 rounded"></div></td>
                    <td class="p-4 align-middle"><div class="skeleton h-4 w-24 rounded"></div></td>
                    <td class="p-4 align-middle"><div class="skeleton h-4 w-24 rounded"></div></td>
                    <td class="p-4 align-middle"><div class="skeleton h-6 w-16 rounded-full"></div></td>
                  </tr>
                {/each}
              {:else if rentals.length === 0}
                <tr>
                  <td colspan="5" class="p-4 text-center text-gray-500">No rentals found</td>
                </tr>
              {:else}
                {#each rentals as rental}
                  <tr class="hover:bg-muted/50">
                    <td class="p-4 align-middle">{rental.user.name}</td>
                    <td class="p-4 align-middle">{rental.movie.title}</td>
                    <td class="p-4 align-middle">{new Date(rental.rentedDate).toLocaleDateString()}</td>
                    <td class="p-4 align-middle">{new Date(rental.dueDate).toLocaleDateString()}</td>
                    <td class="p-4 align-middle">
                      {#if rental.returnedDate}
                        <span class="inline-flex h-6 items-center rounded-full bg-green-100 px-2.5 text-xs font-medium text-green-700">
                          Returned
                        </span>
                      {:else}
                        <span class="inline-flex h-6 items-center rounded-full bg-yellow-100 px-2.5 text-xs font-medium text-yellow-800">
                          Active
                        </span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</Layout>

<style>
  /* Skeletons */
  .skeleton {
    @apply relative overflow-hidden bg-gray-200 dark:bg-gray-700 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent;
  }
</style>

<!-- Skeleton Components -->
{#if false}
<div class="sr-only">These components are only used for TypeScript hints</div>
{/if}

<svelte:component this={null}>
{#if false}
  <div id="StatCardSkeleton">
    <div class="rounded-xl border bg-card text-card-foreground shadow">
      <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <div class="skeleton h-4 w-24 rounded"></div>
        <div class="skeleton h-10 w-10 rounded-full"></div>
      </div>
      <div class="p-6 pt-0">
        <div class="skeleton h-8 w-16 rounded mb-2"></div>
        <div class="skeleton h-3 w-32 rounded"></div>
      </div>
    </div>
  </div>

  <div id="RentalRowSkeleton">
    <tr>
      <td class="p-4 align-middle"><div class="skeleton h-4 w-24 rounded"></div></td>
      <td class="p-4 align-middle"><div class="skeleton h-4 w-24 rounded"></div></td>
      <td class="p-4 align-middle"><div class="skeleton h-4 w-24 rounded"></div></td>
      <td class="p-4 align-middle"><div class="skeleton h-4 w-24 rounded"></div></td>
      <td class="p-4 align-middle"><div class="skeleton h-6 w-16 rounded-full"></div></td>
    </tr>
  </div>
{/if}
</svelte:component>