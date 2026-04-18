import { createRouter, RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import { routeTree } from './routeTree.gen';
import './globals.css';
import { Provider as StoreProvider } from 'jotai';
import { ErrorBoundary } from '@/app/error-boundary';
import { NotFound } from '@/app/NotFound';
import { QueryClientProvider } from '@/app/providers/QueryClientProvider';
import { AppearanceProvider } from '@/shared/appearance';
import { store } from '@/shared/store';

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: NotFound,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    readonly router: typeof router;
  }
}

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
  <ErrorBoundary
    onError={() => {
      // TODO [FUTURE]: add error logging
    }}
  >
    <StoreProvider store={store}>
      <AppearanceProvider>
        <QueryClientProvider>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AppearanceProvider>
    </StoreProvider>
  </ErrorBoundary>
);
