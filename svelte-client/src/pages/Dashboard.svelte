<script lang="ts">
  import { onMount } from 'svelte';
  import ConfirmDialog from '../components/ConfirmDialog.svelte';
  
  // Types
  type User = {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  
  type Movie = {
    id: number;
    title: string;
    director?: string;
    year?: number;
    genre?: string;
    available: boolean;
    description?: string;
  };
  
  type Rental = {
    id: number;
    userId: number;
    movieId: number;
    rentalDate: string;
    returnedDate?: string;
    user: User;
    movie: Movie;
  };
  
  type Stat = {
    label: string;
    value: number;
    icon: string;
    iconBg: string;
    iconColor: string;
  };
  
  // Data
  let stats: Stat[] = [];
  let activeRentals: Rental[] = [];
  let recentMovies: Movie[] = [];
  let recentUsers: User[] = [];
  
  // Loading states
  let isLoading = true;
  let isReturning = false;
  
  // Dialog state
  let confirmDialogOpen = false;
  let rentalToReturn: Rental | null = null;
  
  onMount(async () => {
    await Promise.all([
      fetchStats(),
      fetchActiveRentals(),
      fetchRecentMovies(),
      fetchRecentUsers()
    ]);
    isLoading = false;
  });
  
  async function fetchStats() {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      stats = [
        {
          label: 'Total Users',
          value: data.totalUsers,
          icon: 'users',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        },
        {
          label: 'Total Movies',
          value: data.totalMovies,
          icon: 'film',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600'
        },
        {
          label: 'Active Rentals',
          value: data.activeRentals,
          icon: 'dollar-sign',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        },
        {
          label: 'Available Movies',
          value: data.availableMovies,
          icon: 'tag',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600'
        }
      ];
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }
  
  async function fetchActiveRentals() {
    try {
      const response = await fetch('/api/rentals/active');
      const data = await response.json();
      activeRentals = data;
    } catch (error) {
      console.error('Error fetching active rentals:', error);
    }
  }
  
  async function fetchRecentMovies() {
    try {
      const response = await fetch('/api/movies/recent');
      const data = await response.json();
      recentMovies = data;
    } catch (error) {
      console.error('Error fetching recent movies:', error);
    }
  }
  
  async function fetchRecentUsers() {
    try {
      const response = await fetch('/api/users/recent');
      const data = await response.json();
      recentUsers = data;
    } catch (error) {
      console.error('Error fetching recent users:', error);
    }
  }
  
  function openReturnDialog(rental: Rental) {
    rentalToReturn = rental;
    confirmDialogOpen = true;
  }
  
  function closeReturnDialog() {
    confirmDialogOpen = false;
  }
  
  async function handleReturnRental() {
    if (!rentalToReturn) return;
    
    isReturning = true;
    
    try {
      const response = await fetch(`/api/rentals/${rentalToReturn.id}/return`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ returnedDate: new Date().toISOString() })
      });
      
      if (response.ok) {
        await Promise.all([
          fetchStats(),
          fetchActiveRentals()
        ]);
      }
    } catch (error) {
      console.error('Error returning rental:', error);
    } finally {
      isReturning = false;
      closeReturnDialog();
    }
  }
  
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div>
  <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {#if isLoading}
      {#each Array(4) as _, i}
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="animate-pulse">
            <div class="h-10 w-10 rounded-full bg-gray-200 mb-4"></div>
            <div class="h-5 w-24 bg-gray-200 mb-2"></div>
            <div class="h-8 w-16 bg-gray-200"></div>
          </div>
        </div>
      {/each}
    {:else}
      {#each stats as stat}
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center mb-4">
            <div class="{stat.iconBg} p-3 rounded-full">
              <span class="{stat.iconColor}">
                <i class="icon-{stat.icon}"></i>
              </span>
            </div>
          </div>
          <div class="text-sm text-gray-500">{stat.label}</div>
          <div class="text-2xl font-bold">{stat.value}</div>
        </div>
      {/each}
    {/if}
  </div>
  
  <div class="mb-8">
    <h2 class="text-xl font-bold mb-4">Active Rentals</h2>
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b">
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movie</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#if isLoading}
            {#each Array(3) as _}
              <tr class="border-b">
                <td class="px-6 py-4">
                  <div class="animate-pulse h-4 w-32 bg-gray-200"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="animate-pulse h-4 w-24 bg-gray-200"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="animate-pulse h-4 w-20 bg-gray-200"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
                </td>
              </tr>
            {/each}
          {:else if activeRentals.length === 0}
            <tr>
              <td colspan="4" class="px-6 py-4 text-center text-gray-500">No active rentals found</td>
            </tr>
          {:else}
            {#each activeRentals as rental}
              <tr class="border-b hover:bg-gray-50">
                <td class="px-6 py-4">{rental.movie.title}</td>
                <td class="px-6 py-4">{rental.user.name}</td>
                <td class="px-6 py-4">{formatDate(rental.rentalDate)}</td>
                <td class="px-6 py-4">
                  <button 
                    on:click={() => openReturnDialog(rental)}
                    class="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Return
                  </button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div>
      <h2 class="text-xl font-bold mb-4">Recent Movies</h2>
      <div class="bg-white rounded-lg shadow p-4">
        {#if isLoading}
          {#each Array(3) as _}
            <div class="mb-4 p-4 border-b">
              <div class="animate-pulse">
                <div class="h-5 w-3/4 bg-gray-200 mb-2"></div>
                <div class="h-4 w-1/2 bg-gray-200"></div>
              </div>
            </div>
          {/each}
        {:else if recentMovies.length === 0}
          <p class="text-gray-500 text-center py-4">No movies found</p>
        {:else}
          {#each recentMovies as movie}
            <div class="mb-4 p-4 border-b last:border-b-0">
              <h3 class="font-medium">{movie.title}</h3>
              <p class="text-sm text-gray-500">
                {movie.director || 'Unknown director'} • {movie.year || 'Unknown year'}
              </p>
              <div class="mt-2">
                <span class={movie.available ? "text-green-600 text-xs font-medium" : "text-red-600 text-xs font-medium"}>
                  {movie.available ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
    
    <div>
      <h2 class="text-xl font-bold mb-4">Recent Users</h2>
      <div class="bg-white rounded-lg shadow p-4">
        {#if isLoading}
          {#each Array(3) as _}
            <div class="mb-4 p-4 border-b">
              <div class="animate-pulse">
                <div class="h-5 w-3/4 bg-gray-200 mb-2"></div>
                <div class="h-4 w-1/2 bg-gray-200"></div>
              </div>
            </div>
          {/each}
        {:else if recentUsers.length === 0}
          <p class="text-gray-500 text-center py-4">No users found</p>
        {:else}
          {#each recentUsers as user}
            <div class="mb-4 p-4 border-b last:border-b-0">
              <h3 class="font-medium">{user.name}</h3>
              <p class="text-sm text-gray-500">{user.email}</p>
              {#if user.phone}
                <p class="text-xs text-gray-400">{user.phone}</p>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

<ConfirmDialog
  isOpen={confirmDialogOpen}
  onClose={closeReturnDialog}
  onConfirm={handleReturnRental}
  title="Return Movie"
  description={`Are you sure you want to return "${rentalToReturn?.movie?.title}" rented by ${rentalToReturn?.user?.name}?`}
  confirmText="Return"
  cancelText="Cancel"
  isPending={isReturning}
/>