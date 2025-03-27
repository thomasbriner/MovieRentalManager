<script lang="ts">
  import { onMount } from 'svelte';
  
  export let isOpen: boolean = false;
  export let onClose: () => void;
  export let movieToEdit: any = null;
  export let onSubmit: () => void;
  
  // Form state
  let title = '';
  let director = '';
  let year: number | null = null;
  let genre = '';
  let description = '';
  let available = true;
  
  // Error state
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  
  $: if (isOpen) {
    resetForm();
    if (movieToEdit) {
      populateForm();
    }
  }
  
  function resetForm() {
    title = '';
    director = '';
    year = null;
    genre = '';
    description = '';
    available = true;
    errors = {};
  }
  
  function populateForm() {
    if (!movieToEdit) return;
    
    title = movieToEdit.title || '';
    director = movieToEdit.director || '';
    year = movieToEdit.year || null;
    genre = movieToEdit.genre || '';
    description = movieToEdit.description || '';
    available = movieToEdit.available !== undefined ? movieToEdit.available : true;
  }
  
  function validateForm() {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (year !== null && (isNaN(year) || year < 1800 || year > new Date().getFullYear())) {
      newErrors.year = `Year must be between 1800 and ${new Date().getFullYear()}`;
    }
    
    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }
  
  async function handleSubmit() {
    if (!validateForm()) return;
    
    isSubmitting = true;
    
    try {
      const movieData = {
        title,
        director: director || undefined,
        year: year || undefined,
        genre: genre || undefined,
        description: description || undefined,
        available
      };
      
      const url = movieToEdit 
        ? `/api/movies/${movieToEdit.id}`
        : '/api/movies';
      
      const method = movieToEdit ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(movieData)
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
      console.error('Error submitting movie:', error);
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
  <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto z-10 overflow-hidden">
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">
        {movieToEdit ? 'Edit Movie' : 'Add New Movie'}
      </h2>
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="grid grid-cols-1 gap-4 mb-4">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              bind:value={title}
              type="text"
              id="title"
              class="w-full p-2 border rounded-md {errors.title ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.title}
              <p class="text-red-500 text-xs mt-1">{errors.title}</p>
            {/if}
          </div>
          
          <!-- Director & Year -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="director" class="block text-sm font-medium text-gray-700 mb-1">
                Director
              </label>
              <input
                bind:value={director}
                type="text"
                id="director"
                class="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label for="year" class="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                bind:value={year}
                type="number"
                id="year"
                min="1800"
                max={new Date().getFullYear()}
                class="w-full p-2 border {errors.year ? 'border-red-500' : 'border-gray-300'} rounded-md"
              />
              {#if errors.year}
                <p class="text-red-500 text-xs mt-1">{errors.year}</p>
              {/if}
            </div>
          </div>
          
          <!-- Genre -->
          <div>
            <label for="genre" class="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            <input
              bind:value={genre}
              type="text"
              id="genre"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              bind:value={description}
              id="description"
              rows="4"
              class="w-full p-2 border border-gray-300 rounded-md"
            ></textarea>
          </div>
          
          <!-- Available -->
          <div class="flex items-center">
            <input
              bind:checked={available}
              type="checkbox"
              id="available"
              class="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label for="available" class="ml-2 text-sm font-medium text-gray-700">
              Available for rent
            </label>
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
            {movieToEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
{/if}