<script lang="ts">
  import { onMount } from 'svelte';
  import Layout from '../components/Layout.svelte';
  
  let isLoading = true;
  let users = [];
  let isModalOpen = false;
  let userToEdit = null;
  let isConfirmDialogOpen = false;
  let userToDelete = null;
  
  // Form fields
  let name = '';
  let email = '';
  let phone = '';
  
  onMount(() => {
    fetchUsers();
  });
  
  async function fetchUsers() {
    try {
      const response = await fetch('/api/users');
      users = await response.json();
      isLoading = false;
    } catch (error) {
      console.error('Error fetching users:', error);
      isLoading = false;
    }
  }
  
  function openUserModal(user = null) {
    if (user) {
      userToEdit = user;
      name = user.name;
      email = user.email;
      phone = user.phone || '';
    } else {
      userToEdit = null;
      name = '';
      email = '';
      phone = '';
    }
    
    isModalOpen = true;
  }
  
  function closeUserModal() {
    isModalOpen = false;
  }
  
  async function handleSubmit() {
    try {
      const userData = {
        name,
        email,
        phone: phone || undefined
      };
      
      const url = userToEdit 
        ? `/api/users/${userToEdit.id}` 
        : '/api/users';
      
      const method = userToEdit ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      closeUserModal();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }
  
  function confirmDelete(user) {
    userToDelete = user;
    isConfirmDialogOpen = true;
  }
  
  function closeConfirmDialog() {
    isConfirmDialogOpen = false;
    userToDelete = null;
  }
  
  async function deleteUser() {
    if (!userToDelete) return;
    
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      closeConfirmDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
</script>

<Layout>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-bold tracking-tight">Users</h2>
      <button
        on:click={() => openUserModal()}
        class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add User
      </button>
    </div>
    
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#if isLoading}
        {#each Array(6) as _}
          <div class="rounded-xl border bg-card text-card-foreground shadow">
            <div class="p-6">
              <div class="skeleton h-5 w-3/4 rounded mb-4"></div>
              <div class="skeleton h-4 w-full rounded mb-2"></div>
              <div class="skeleton h-4 w-2/3 rounded mb-6"></div>
              <div class="flex justify-end space-x-2">
                <div class="skeleton h-9 w-16 rounded"></div>
                <div class="skeleton h-9 w-16 rounded"></div>
              </div>
            </div>
          </div>
        {/each}
      {:else if users.length === 0}
        <div class="col-span-full flex flex-col items-center justify-center p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary mb-4">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3 class="text-lg font-medium">No users found</h3>
          <p class="text-sm text-gray-500 mt-1">Click the 'Add User' button to add a new user.</p>
        </div>
      {:else}
        {#each users as user}
          <div class="rounded-xl border bg-card text-card-foreground shadow">
            <div class="p-6">
              <div class="flex items-center space-x-4 mb-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-lg">{user.name}</h3>
                </div>
              </div>
              
              <div class="space-y-2 mb-6">
                <div class="flex items-center text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-gray-400">
                    <path d="M22 17.607c0 4.3424-10 4.3424-10 0v-5.5c0-3.1416 1.7909-5.607 5-5.607s5 2.4654 5 5.607v5.5z"></path>
                    <path d="M2 17.607c0 4.3424 10 4.3424 10 0v-5.5c0-3.1416-1.7909-5.607-5-5.607s-5 2.4654-5 5.607v5.5z"></path>
                  </svg>
                  {user.email}
                </div>
                
                {#if user.phone}
                  <div class="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-gray-400">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    {user.phone}
                  </div>
                {/if}
              </div>
              
              <div class="flex justify-end space-x-2">
                <button
                  on:click={() => openUserModal(user)}
                  class="inline-flex items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
                <button
                  on:click={() => confirmDelete(user)}
                  class="inline-flex items-center justify-center rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                >
                  <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</Layout>

<!-- User Modal -->
{#if isModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto p-6">
      <button
        on:click={closeUserModal}
        class="absolute top-4 right-4 inline-flex items-center justify-center rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <div class="text-xl font-semibold mb-4">
        {userToEdit ? 'Edit User' : 'Add User'}
      </div>
      
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <label for="name" class="text-sm font-medium">Name <span class="text-red-500">*</span></label>
          <input
            id="name"
            type="text"
            required
            bind:value={name}
            class="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium">Email <span class="text-red-500">*</span></label>
          <input
            id="email"
            type="email"
            required
            bind:value={email}
            class="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        
        <div class="space-y-2">
          <label for="phone" class="text-sm font-medium">Phone</label>
          <input
            id="phone"
            type="tel"
            bind:value={phone}
            class="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            on:click={closeUserModal}
            class="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {userToEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Confirm Delete Dialog -->
{#if isConfirmDialogOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6">
      <h3 class="text-lg font-semibold mb-2">Delete User</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Are you sure you want to delete "{userToDelete?.name}"? This action cannot be undone.
      </p>
      <div class="flex justify-end space-x-3">
        <button
          on:click={closeConfirmDialog}
          class="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          on:click={deleteUser}
          class="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Skeletons */
  .skeleton {
    @apply relative overflow-hidden bg-gray-200 dark:bg-gray-700 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent;
  }
</style>