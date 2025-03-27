<script lang="ts">
  import { Router, Route } from 'svelte-routing';
  import Dashboard from './pages/Dashboard.svelte';
  import Movies from './pages/Movies.svelte';
  import Users from './pages/Users.svelte';
  import Rentals from './pages/Rentals.svelte';
  import NotFound from './pages/NotFound.svelte';
  import Layout from './components/Layout.svelte';

  export let url = '';
</script>

<Router {url}>
  <Layout>
    <Route path="/" component={Dashboard} />
    <Route path="/movies" component={Movies} />
    <Route path="/users" component={Users} />
    <Route path="/rentals" component={Rentals} />
    <Route path="*" component={NotFound} />
  </Layout>
</Router>