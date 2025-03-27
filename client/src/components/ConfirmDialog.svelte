<script lang="ts">
  export let isOpen: boolean = false;
  export let onClose: () => void;
  export let onConfirm: () => void;
  export let title: string = 'Confirm';
  export let description: string = 'Are you sure you want to perform this action?';
  export let confirmText: string = 'Confirm';
  export let cancelText: string = 'Cancel';
  export let isPending: boolean = false;
</script>

{#if isOpen}
<div class="fixed inset-0 flex items-center justify-center z-50">
  <!-- Backdrop -->
  <div class="absolute inset-0 bg-black bg-opacity-50" on:click={onClose}></div>
  
  <!-- Dialog -->
  <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto z-10 overflow-hidden">
    <div class="p-6">
      <h2 class="text-lg font-semibold mb-2">{title}</h2>
      <p class="text-gray-600 mb-6">{description}</p>
      
      <div class="flex justify-end space-x-2">
        <button 
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          on:click={onClose}
          disabled={isPending}
        >
          {cancelText}
        </button>
        <button 
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          on:click={onConfirm}
          disabled={isPending}
        >
          {#if isPending}
            <span class="inline-block animate-spin mr-2">↻</span>
          {/if}
          {confirmText}
        </button>
      </div>
    </div>
  </div>
</div>
{/if}