<script lang="ts">
  import { onMount } from 'svelte';
  import UserModal from '../components/UserModal.svelte';
  import ConfirmDialog from '../components/ConfirmDialog.svelte';
  
  // Types
  type User = {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  
  // State
  let users: User[] = [];
  let isLoading = true;
  let modalOpen = false;
  let confirmDialogOpen = false;
  let userToEdit: User | null = null;
  let userToDelete: User | null = null;
  let isDeleting = false;
  
  onMount(async () => {
    await fetchUsers();
  });
  
  async function fetchUsers() {
    try {
      isLoading = true;
      const response = await fetch('/api/users');
      const data = await response.json();
      users = data;
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      isLoading = false;
    }
  }
  
  function openAddModal() {
    userToEdit = null;
    modalOpen = true;
  }
  
  function openEditModal(user: User) {
    userToEdit = user;
    modalOpen = true;
  }
  
  function closeModal() {
    modalOpen = false;
  }
  
  function openDeleteDialog(user: User) {
    userToDelete = user;
    confirmDialogOpen = true;
  }
  
  function closeDeleteDialog() {
    confirmDialogOpen = false;
  }
  
  async function handleDeleteUser() {
    if (!userToDelete) return;
    
    isDeleting = true;
    
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      isDeleting = false;
      closeDeleteDialog();
    }
  }
  
  async function handleUserSubmit() {
    await fetchUsers();
    closeModal();
  }
</script>

<div>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Users</h1>
    <button 
      on:click={openAddModal}
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Add User
    </button>
  </div>
  
  {#if isLoading}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each Array(6) as _}
        <div class="bg-white rounded-lg shadow p-6">
          <div class="animate-pulse">
            <div class="h-5 w-3/4 bg-gray-200 mb-3"></div>
            <div class="h-4 w-1/2 bg-gray-200 mb-2"></div>
            <div class="h-4 w-1/3 bg-gray-200 mb-4"></div>
            <div class="flex justify-end space-x-2">
              <div class="h-8 w-16 bg-gray-200 rounded"></div>
              <div class="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if users.length === 0}
    <div class="text-center p-10 bg-white rounded-lg shadow">
      <p class="text-gray-500 mb-4">No users found</p>
      <button 
        on:click={openAddModal}
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Add your first user
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each users as user}
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-2">{user.name}</h2>
            <p class="text-sm text-gray-500 mb-1">{user.email}</p>
            {#if user.phone}
              <p class="text-sm text-gray-500 mb-4">{user.phone}</p>
            {:else}
              <p class="text-sm text-gray-400 italic mb-4">No phone number</p>
            {/if}
            
            <div class="flex justify-end space-x-2">
              <button 
                on:click={() => openEditModal(user)}
                class="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              >
                Edit
              </button>
              <button 
                on:click={() => openDeleteDialog(user)}
                class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<UserModal 
  isOpen={modalOpen}
  onClose={closeModal}
  userToEdit={userToEdit}
  onSubmit={handleUserSubmit}
/>

<ConfirmDialog
  isOpen={confirmDialogOpen}
  onClose={closeDeleteDialog}
  onConfirm={handleDeleteUser}
  title="Delete User"
  description={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  isPending={isDeleting}
/>