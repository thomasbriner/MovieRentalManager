<script lang="ts">
  import { link } from 'svelte-routing';
  import { Home } from 'lucide-svelte';
</script>

<div class="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
  <h1 class="text-6xl font-bold text-primary">404</h1>
  <h2 class="text-2xl font-semibold mt-4">Page Not Found</h2>
  <p class="mt-2 text-muted-foreground max-w-md">
    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
  </p>
  <a 
    href="/"
    use:link
    class="mt-6 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
  >
    <Home class="h-4 w-4 mr-2" />
    Back to Dashboard
  </a>
</div>