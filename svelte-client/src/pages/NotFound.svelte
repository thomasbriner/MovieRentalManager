<script>
  import { push } from 'svelte-spa-router';
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="text-center p-8">
    <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
    <h2 class="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
    <p class="text-gray-600 mb-8">The page you are looking for doesn't exist or has been moved.</p>
    <button 
      on:click={() => push('/')}
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Back to Dashboard
    </button>
  </div>
</div>