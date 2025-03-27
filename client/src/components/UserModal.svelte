<script lang="ts">
  import { onMount } from 'svelte';
  
  export let isOpen: boolean = false;
  export let onClose: () => void;
  export let userToEdit: any = null;
  export let onSubmit: () => void;
  
  // Form state
  let name = '';
  let email = '';
  let phone = '';
  
  // Error state
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  
  $: if (isOpen) {
    resetForm();
    if (userToEdit) {
      populateForm();
    }
  }
  
  function resetForm() {
    name = '';
    email = '';
    phone = '';
    errors = {};
  }
  
  function populateForm() {
    if (!userToEdit) return;
    
    name = userToEdit.name || '';
    email = userToEdit.email || '';
    phone = userToEdit.phone || '';
  }
  
  function validateForm() {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }
  
  async function handleSubmit() {
    if (!validateForm()) return;
    
    isSubmitting = true;
    
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
      
      if (response.ok) {
        onSubmit();
      } else {
        const data = await response.json();
        if (data.errors) {
          errors = data.errors;
        }
      }
    } catch (error) {
      console.error('Error submitting user:', error);
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isOpen}
<div class="fixed inset-0 flex items-center justify-center z-50">
  <!-- Backdrop -->
  <div class="absolute inset-0 bg-black bg-opacity-50" on:click={onClose}></div>
  
  <!-- Modal -->
  <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto z-10 overflow-hidden">
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">
        {userToEdit ? 'Edit User' : 'Add New User'}
      </h2>
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="grid grid-cols-1 gap-4 mb-4">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              bind:value={name}
              type="text"
              id="name"
              class="w-full p-2 border {errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md"
            />
            {#if errors.name}
              <p class="text-red-500 text-xs mt-1">{errors.name}</p>
            {/if}
          </div>
          
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              bind:value={email}
              type="email"
              id="email"
              class="w-full p-2 border {errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md"
            />
            {#if errors.email}
              <p class="text-red-500 text-xs mt-1">{errors.email}</p>
            {/if}
          </div>
          
          <!-- Phone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              bind:value={phone}
              type="tel"
              id="phone"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div class="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            on:click={onClose}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <span class="inline-block animate-spin mr-2">↻</span>
            {/if}
            {userToEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
{/if}