<script lang="ts">
  import { Router, Route } from 'svelte-spa-router';
  import Dashboard from './pages/Dashboard.svelte';
  import Movies from './pages/Movies.svelte';
  import Users from './pages/Users.svelte';
  import Rentals from './pages/Rentals.svelte';
  import NotFound from './pages/NotFound.svelte';
  import './app.css';

  const routes = {
    '/': Dashboard,
    '/movies': Movies,
    '/users': Users,
    '/rentals': Rentals,
    '*': NotFound
  };
</script>

<main class="flex min-h-screen flex-col bg-background">
  <Router {routes} />
</main>

<style>
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
</style>