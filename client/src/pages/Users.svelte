<script lang="ts">
  import { onMount } from 'svelte';
  import { User, Plus, Search, Edit, Trash, X } from 'lucide-svelte';
  
  let users = [];
  let loading = true;
  let searchQuery = '';
  let showModal = false;
  let currentUser = null;
  
  let newUser = {
    name: '',
    email: '',
    phone: ''
  };

  $: filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.phone && user.phone.includes(searchQuery))
  );

  onMount(async () => {
    try {
      const response = await fetch('/api/users');
      users = await response.json();
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      loading = false;
    }
  });

  function openModal(user = null) {
    currentUser = user;
    if (user) {
      newUser = { ...user };
    } else {
      newUser = {
        name: '',
        email: '',
        phone: ''
      };
    }
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  async function saveUser() {
    try {
      const url = currentUser ? `/api/users/${currentUser.id}` : '/api/users';
      const method = currentUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save user');
      }
      
      const savedUser = await response.json();
      
      if (currentUser) {
        users = users.map(u => u.id === savedUser.id ? savedUser : u);
      } else {
        users = [...users, savedUser];
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      users = users.filter(u => u.id !== id);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col md:flex-row md:items-center md:justify-between">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Users</h2>
      <p class="text-muted-foreground">Manage your users</p>
    </div>
    <div class="mt-4 md:mt-0">
      <button 
        class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
        on:click={() => openModal()}
      >
        <Plus class="h-4 w-4 mr-2" />
        Add User
      </button>
    </div>
  </div>

  <div class="relative">
    <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <input 
      type="text" 
      bind:value={searchQuery}
      placeholder="Search users..." 
      class="pl-10 h-10 w-full md:max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
    />
  </div>

  {#if loading}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each Array(8) as _}
        <div class="bg-card rounded-lg shadow-sm overflow-hidden animate-pulse">
          <div class="p-6 flex flex-col items-center text-center">
            <div class="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
            <div class="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 mb-2"></div>
            <div class="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 mb-2"></div>
            <div class="h-4 w-2/3 bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if filteredUsers.length === 0}
    <div class="bg-card rounded-lg p-8 shadow-sm text-center">
      {#if searchQuery}
        <User class="h-10 w-10 mx-auto text-muted-foreground" />
        <h3 class="mt-4 text-lg font-medium">No users found</h3>
        <p class="mt-2 text-muted-foreground">Try adjusting your search query</p>
        <button 
          class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          on:click={() => searchQuery = ''}
        >
          <X class="h-4 w-4 mr-2" />
          Clear search
        </button>
      {:else}
        <User class="h-10 w-10 mx-auto text-muted-foreground" />
        <h3 class="mt-4 text-lg font-medium">No users available</h3>
        <p class="mt-2 text-muted-foreground">Add your first user to get started</p>
        <button 
          class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 hover:bg-primary/90"
          on:click={() => openModal()}
        >
          <Plus class="h-4 w-4 mr-2" />
          Add User
        </button>
      {/if}
    </div>
  {:else}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each filteredUsers as user}
        <div class="bg-card rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div class="p-6 flex-1 flex flex-col items-center text-center">
            <div class="h-20 w-20 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
              <User class="h-10 w-10 text-purple-600 dark:text-purple-300" />
            </div>
            
            <h3 class="text-lg font-semibold">{user.name}</h3>
            
            {#if user.email}
              <p class="text-sm text-muted-foreground mt-1">{user.email}</p>
            {/if}
            
            {#if user.phone}
              <p class="text-sm text-muted-foreground mt-1">{user.phone}</p>
            {/if}
          </div>
          
          <div class="border-t border-border p-4 flex justify-center gap-2">
            <button 
              class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              on:click={() => openModal(user)}
              aria-label="Edit user"
            >
              <Edit class="h-4 w-4 mr-2" />
              Edit
            </button>
            <button 
              class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border border-input bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground"
              on:click={() => deleteUser(user.id)}
              aria-label="Delete user"
            >
              <Trash class="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="bg-card rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6 space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">{currentUser ? 'Edit User' : 'Add User'}</h3>
          <button 
            class="text-muted-foreground hover:text-foreground"
            on:click={closeModal}
            aria-label="Close modal"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        
        <form on:submit|preventDefault={saveUser} class="space-y-4">
          <div class="space-y-2">
            <label for="name" class="block text-sm font-medium">Name</label>
            <input
              id="name"
              type="text"
              bind:value={newUser.name}
              required
              class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              bind:value={newUser.email}
              class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          
          <div class="space-y-2">
            <label for="phone" class="block text-sm font-medium">Phone</label>
            <input
              id="phone"
              type="tel"
              bind:value={newUser.phone}
              class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          
          <div class="flex justify-end gap-2 pt-4">
            <button 
              type="button"
              on:click={closeModal}
              class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
            >
              {currentUser ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}