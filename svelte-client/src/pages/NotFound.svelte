<script lang="ts">
  import { push } from 'svelte-spa-router';
</script>

<div class="flex h-[100vh] w-full flex-col items-center justify-center">
  <div class="text-center">
    <h1 class="text-6xl font-bold text-primary">404</h1>
    <h2 class="mt-4 text-2xl font-semibold">Page Not Found</h2>
    <p class="mt-2 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
    <button
      on:click={() => push('/')}
      class="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      Go to Dashboard
    </button>
  </div>
</div>