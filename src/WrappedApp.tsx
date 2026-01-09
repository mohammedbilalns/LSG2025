import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter, createHashHistory } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { NotFound } from "./components/common/NotFound";
import { Loader } from "./components/common/Loader";

const queryClient = new QueryClient();

// Set up a Hash History 
const hashHistory = createHashHistory()

const router = createRouter({
  routeTree,
  history: hashHistory,
  defaultPreload: 'intent',
  context: { queryClient },
  defaultNotFoundComponent: NotFound,
  defaultPendingComponent: Loader,
})

// Register the router instance 
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function WrappedApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default WrappedApp;
