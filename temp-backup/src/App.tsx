import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import MainLayout from "@/layouts/main-layout";
import Dashboard from "@/pages/dashboard";
import Movies from "@/pages/movies";
import Users from "@/pages/users";
import Rentals from "@/pages/rentals";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/movies" component={Movies} />
      <Route path="/users" component={Users} />
      <Route path="/rentals" component={Rentals} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Router />
      </MainLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
